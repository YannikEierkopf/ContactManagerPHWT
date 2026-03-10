// Load packages
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const path = require('path');
const bcrypt = require('bcrypt');
require('dotenv').config();

// Initialize server
const app = express();
const port = Number(process.env.PORT) || 3000;
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'frontend', 'login', 'login.html'));
});

// Server is able to read data from HTML-Form
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // allow JSON bodies for API endpoints

const sessionSecret = process.env.SESSION_SECRET;
const sessionMaxAge = Number(process.env.SESSION_MAX_AGE_MS) || 5 * 60 * 1000;
const sessionTableName = process.env.SESSION_TABLE_NAME || 'user_sessions';

// PostgreSQL configuration
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: process.env.DB_NAME || 'contact_manager_db',
    password: process.env.DB_PASSWORD,
    port: 5432,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Database connection error:', err));

app.use(session({
    store: new pgSession({
        pool,
        tableName: sessionTableName,
        createTableIfMissing: true
    }),
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: sessionMaxAge,
        httpOnly: true,
    }
}));

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

async function userOwnsContact(userID, contactID) {
    const query = `
        SELECT 1
        FROM user_contacts
        WHERE user_id = $1 AND contact_id = $2
        LIMIT 1`;
    const { rows } = await pool.query(query, [userID, contactID]);
    return rows.length > 0;
}

function requireLogin(req, res, next) {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'Nicht eingeloggt' });
    }
    next();
}

function requireAdmin(req, res, next) {
    if (req.session.user.role !== 'admin') {
        return res.status(403).json({ message: 'Kein Zugriff' });
    }
    next();
}

// API routes ---------------------------------------------------------------
// (TODO TESTEN)
// admin creates a new user with explicit role
app.post('/api/users', requireLogin, requireAdmin, async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ error: 'Benutzername, Passwort und Rolle sind erforderlich' });
    }

    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Rolle muss admin oder user sein' });
    }

    try {
        const hashed = await hashPassword(password);
        const insert = `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`;
        await pool.query(insert, [username, hashed, role]);
        return res.status(201).json({ message: 'Benutzer erstellt' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Benutzername existiert bereits' });
        }
        console.error(err);
        return res.status(500).json({ error: 'Fehler beim Erstellen des Benutzers' });
    }
});

// login: verify credentials and return user id and role if ok
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('username and password required');
    }

    try {
        const select = `SELECT id, username, password_hash, role FROM users WHERE username = $1`;
        const { rows } = await pool.query(select, [username]);
        if (rows.length === 0) {
            return res.status(401).send('Ungueltige Anmeldedaten');
        }
        const user = rows[0];
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).send('Ungueltige Anmeldedaten');
        }
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };

        res.json({
            message: 'Login erfolgreich',
            userID: user.id,
            username: user.username,
            role: user.role
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Login-Fehler');
    }
});

app.get('/check-session', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'Keine aktive Sitzung' });
    }
    res.json(req.session.user);
});

app.post('/logout', requireLogin, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Abmelden fehlgeschlagen' });
        }
        res.clearCookie('connect.sid');
        return res.json({ message: 'Erfolgreich abgemeldet' });
    });
});

// update a user's password
app.post('/set/password', requireLogin, async (req, res) => {
    const { userID, newPassword } = req.body;
    const isAdmin = req.session.user.role === 'admin';
    const targetUserID = isAdmin ? Number(userID) : req.session.user.id;

    if (!newPassword) {
        return res.status(400).send('Neues Passwort ist erforderlich');
    }

    if (!targetUserID) {
        return res.status(400).send('Gültige Benutzer-ID erforderlich');
    }

    try {
        await setPassword(targetUserID, newPassword);
        res.send('Passwort aktualisiert');
    } catch (err) {
        console.error(err);
        res.status(500).send('Fehler beim Aktualisieren des Passworts');
    }
});

// fetch contacts for a user
app.post('/get/contact/', requireLogin, async (req, res) => {
    try {
        const userID = req.session.user.id;
        const contacts = await getContacts(userID);
        res.json(contacts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Fehler beim Laden der Kontakte');
    }
});

// Contact
// POST new contact
app.post('/create/contact', requireLogin, async (req, res) => {
    const data = req.body;

    const insertQuery = `
        INSERT INTO contacts (
            first_name,
            last_name,
            email,
            telephone_number,
            custom_fields
        )
        VALUES ($1, $2, $3, $4, $5) 
        RETURNING id`;


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
    //Insert data into db and link contact to user
    try {
        const result = await pool.query(insertQuery, values);
        const contactID = result.rows[0].id;
        const userID = req.session.user.id;

        await pool.query(
            `INSERT INTO user_contacts (user_id, contact_id) VALUES ($1, $2)`,
            [userID, contactID]
        );

        console.log(`New contact was created and linked to user ${userID}.`);
        res.redirect('../dashboard/dashboard.html');

    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Fehler');
    }
});

//POST edit contact

app.post('/edit/contact', requireLogin, async (req, res) => {
    const data = req.body;
    //const id = req.params.id;
    const id = parseInt(data.id, 10); // von hidden input im Formular
    if (!id) return res.status(400).send('contact ID fehlt');

    try {
        const allowed = await userOwnsContact(req.session.user.id, id);
        if (!allowed) {
            return res.status(403).send('Kein Zugriff');
        }
    } catch (error) {
        console.error('Error checking contact ownership:', error);
        return res.status(500).send('Fehler');
    }


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
        res.redirect('../dashboard/dashboard.html');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Fehler');
    }

});

//GET data for edit
app.get('/api/contacts/:id', requireLogin, async (req, res) => {
    const contactId = parseInt(req.params.id, 10);
    if (!contactId) {
        return res.status(400).send('Ungueltige Kontakt-ID');
    }

    try {
        const allowed = await userOwnsContact(req.session.user.id, contactId);
        if (!allowed) {
            return res.status(403).send('Kein Zugriff');
        }
    } catch (error) {
        console.error('Error checking contact ownership:', error);
        return res.status(500).send('Fehler');
    }

    const selectQuery = `
        SELECT * FROM contacts 
        WHERE id = $1
    `;

    try {
        const result = await pool.query(selectQuery, [contactId]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching single contact:', error);
        res.status(500).send('Fehler');
    }
});

//POST inquiries
app.post('/create/inquire', async (req, res) => {
    const data = req.body;

    const insertQuery = `
        INSERT INTO inquiries (
            name,
            email,
            message
        )
        VALUES ($1, $2, $3)`;

    const values = [
        data['name'],
        data['email'],
        data['message']
    ];

    try {
        await pool.query(insertQuery, values);
        console.log(`New inquire was created.`);
        res.send('Neue Anfrage wurde erstellt!');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Fehler');
    }
})

// POST delete contact
app.post('/delete/contact', requireLogin, async (req, res) => {
    const id = Number(req.body.id);
    if (!id) {
        return res.status(400).send('Ungueltige Kontakt-ID');
    }

    try {
        const allowed = await userOwnsContact(req.session.user.id, id);
        if (!allowed) {
            return res.status(403).send('Kein Zugriff');
        }
    } catch (error) {
        console.error('Error checking contact ownership:', error);
        return res.status(500).send('Fehler');
    }

    const deleteQuery = `
        DELETE FROM contacts 
        WHERE id = $1
    `;

    try {
        await pool.query(deleteQuery, [id]);
        console.log(`Contact was deleted.`);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Fehler');
    }
});
