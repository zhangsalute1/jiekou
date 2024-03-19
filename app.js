const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

// 数据库连接配置
const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: 'admin123',
    database: 'fakepoe'
};

const app = express();
const port = 3000;

const API_KEY = 'sk-jWELeaEAHrupgs4aB9880fB1F07648DbB28eA47e31656d81';
const API_URL = 'https://www.gptapi.us/v1/chat/completions';

app.use(cors());
app.use(bodyParser.json());

// 用户注册
app.post('/register', async (req, res) => {
    const { email, password, activationCode } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.execute('INSERT INTO users (email, password, activation_code) VALUES (?, ?, ?)', [email, hashedPassword, activationCode]);
        res.json({ message: 'User registered successfully!' });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'An error occurred', details: error.message });
    }
});

// 用户登录
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [users] = await connection.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length > 0) {
            const user = users[0];
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                const token = jwt.sign({ id: user.id }, 'your_secret_key', { expiresIn: '1h' });
                res.json({ message: 'Login successful!', token: token });
            } else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'An error occurred', details: error.message });
    }
});

//聊天
app.post('/chat', async (req, res) => {
    const { model, messages } = req.body;

    try {
        const response = await axios.post(API_URL, {
            model: model,
            messages: messages,
            max_tokens: 150,
            n: 1,
            stop: null,
            temperature: 0.8,
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`,
            },
        });

        const generatedText = response.data.choices[0].message.content.trim();
        res.json({ message: generatedText });
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'An error occurred', details: error.response ? error.response.data : error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});