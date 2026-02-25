//Load packages
const express = require('express');
const { Pool } = require('pg');
const path = require('path');

//Initialize server
const app = express();
const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'new_contact.html'));
});

//Server is able to read data from HTML-Form
app.use(express.urlencoded({ extended: true }));

// PostgreSQL configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'contact_manager_db',
    password: 'postgres',
    port: 5432,
});

//POST new contact
app.post('/create/contact', async (req, res) => {
    const data = req.body;

    const insertQuery = `
        INSERT INTO contact (
            first_name,
            last_name,
            email,
            telephone_number,
            custom_fields
        )
        VALUES ($1, $2, $3, $4, $5)`;


    const customFields = {};
    //Custom fields in JSON umwandeln
    for (const key in data) {
        if (key.startsWith('label_')) {
            const id = key.split('_')[1];
            const fieldName = data[key];
            const fieldValue = data[`input_${id}`];
            customFields[fieldName] = fieldValue;

        }
    }

    const values = [
        data['firstName'],
        data['lastName'],
        data['email'],
        data['telephoneNumber'],
        customFields
    ];

    //Insert data into db
    try {
        await pool.query(insertQuery, values);
        console.log(`New contact was created.`);
        res.send('New contact was created!');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

//Start server
app.listen(port, () => {
    console.log('Server runs: http://localhost:3000');
});