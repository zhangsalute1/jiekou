const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');


const app = express();
const port = 3000;

const API_KEY = 'sk-jWELeaEAHrupgs4aB9880fB1F07648DbB28eA47e31656d81';
const API_URL = 'https://www.gptapi.us/v1/chat/completions';

app.use(cors());
app.use(bodyParser.json());

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