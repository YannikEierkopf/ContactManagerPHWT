//Load packages
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');

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
        INSERT INTO contacts (
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

function hashPassword(password) {
    const hash = bcrypt.hash(password, 10);
    return hash;
}

function getPassword(userID) {
    const query = `
        SELECT password_hash
        FROM users
        WHERE id = $1`;
    const { rows } = pool.query(query, [userID]);
    return rows;
}

function setPassword(password) {
    
}

app.post('/get/contact/', async (req, res) => {

});

function getContacts(userID) {
    const query = `
        SELECT c.*
        FROM user_contacts uc
        JOIN contacts c ON c.id = uc.contact_id
        WHERE uc.user_id = %1`;
    const { rows } = pool.query(query, [userID]);
    return rows;
}
