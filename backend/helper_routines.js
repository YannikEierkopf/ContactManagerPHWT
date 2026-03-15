const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const dbUser = process.env.DB_USER || 'postgres';

// PostgreSQL configuration
const pool = new Pool({
    user: dbUser,
    host: 'localhost',
    database: process.env.DB_NAME || 'contact_manager_db',
    password: process.env.DB_PASSWORD,
    port: 5432,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL database'))
    .catch(err => console.error('Database connection error:', err));

// helper routines -----------------------------------------------------------
async function hashPassword(password) {
    // return a promise that resolves to the bcrypt hash
    const hash = await bcrypt.hash(password, 10);
    return hash;
}

function normalizeUsername(username) {
    return String(username || '').trim().toLowerCase();
}
//TODO redundant
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

module.exports = {
    hashPassword,
    normalizeUsername,
    getPassword,
    setPassword,
    getContacts,
    userOwnsContact,
    requireLogin,
    requireAdmin,
    pool
};
