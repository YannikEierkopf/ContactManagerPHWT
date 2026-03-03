// Load packages
const express = require('express');
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');

// Initialize server
const app = express();
const port = 3000;
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login', 'login.html'));
});

// Server is able to read data from HTML-Form
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // allow JSON bodies for API endpoints

// PostgreSQL configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'contact_manager_db',
    password: 'hallo',
    port: 5432,
});
pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Database connection error:', err));

// TODO: Init DB

// POST new contact
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

//POST edit contact

app.post('/update/contact', async (req, res) => {
    const data = req.body;
    const id = req.params.id;

    const editQuery = `
        UPDATE contacts 
        SET first_name = $1, 
            last_name = $2, 
            email = $3, 
            telephone_number = $4, 
            custom_fields = $5
        WHERE id = $6`;

    const customFields = {};

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
        customFields,
        id
    ];

    try {
        await pool.query(editQuery, values);
        console.log(`Contact was edited.`);
        res.send('Contact was edited!');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }

})

//Start server
app.listen(port, () => {
    console.log('Server runs: http://localhost:3000');
});


// helper routines -----------------------------------------------------------
async function hashPassword(password) {
    // return a promise that resolves to the bcrypt hash
    const hash = await bcrypt.hash(password, 10);
    return hash;
}

async function getPassword(userID) {
    const query = `
        SELECT password_hash
        FROM users
        WHERE id = $1`;
    const { rows } = await pool.query(query, [userID]);
    return rows;
}

async function setPassword(userID, password) {
    const hash = await hashPassword(password);
    const query = `UPDATE users SET password_hash = $1 WHERE id = $2`;
    await pool.query(query, [hash, userID]);
}

async function getContacts(userID) {
    const query = `
        SELECT c.*
        FROM user_contacts uc
        JOIN contacts c ON c.id = uc.contact_id
        WHERE uc.user_id = $1`;
    const { rows } = await pool.query(query, [userID]);
    return rows;
}

// API routes ---------------------------------------------------------------
// (TODO TESTEN)
// admin creates a new user with explicit role
app.post('/api/users', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ error: 'username, password and role are required' });
    }

    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: 'role must be admin or user' });
    }

    try {
        const hashed = await hashPassword(password);
        const insert = `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`;
        await pool.query(insert, [username, hashed, role]);
        return res.status(201).json({ message: 'user created' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'username already exists' });
        }
        console.error(err);
        return res.status(500).json({ error: 'error creating user' });
    }
});

// register a new user (expects username & password in body)
/* (TODO TESTEN ODER LÖSCHEN) app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('username and password required');
    }

    try {
        const hashed = await hashPassword(password);
        const insert = `INSERT INTO users (username, password_hash) VALUES ($1, $2)`;
        await pool.query(insert, [username, hashed]);
        res.send('user created');
    } catch (err) {
        console.error(err);
        res.status(500).send('error registering user');
    }
});
*/
// login: verify credentials and return user id if ok
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('username and password required');
    }

    try {
        const select = `SELECT id, password_hash FROM users WHERE username = $1`;
        const { rows } = await pool.query(select, [username]);
        if (rows.length === 0) {
            return res.status(401).send('invalid credentials');
        }
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).send('invalid credentials');
        }
        res.json({ userID: user.id });
    } catch (err) {
        console.error(err);
        res.status(500).send('login error');
    }
});

// update a user's password
app.post('/set/password', async (req, res) => {
    const { userID, newPassword } = req.body;
    if (!userID || !newPassword) {
        return res.status(400).send('user-ID and new Password required');
    }

    try {
        await setPassword(userID, newPassword);
        res.send('password updated');
    } catch (err) {
        console.error(err);
        res.status(500).send('error updating password');
    }
});

// fetch contacts for a user
app.post('/get/contact/', async (req, res) => {
    const { userID } = req.body;
    if (!userID) {
        return res.status(400).send('user-ID required');
    }

    try {
        const contacts = await getContacts(userID);
        res.json(contacts);
    } catch (err) {
        console.error(err);
        res.status(500).send('error retrieving contacts');
    }
});
