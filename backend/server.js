// Load packages
const express = require('express');
const router = express.Router();
module.exports = router;
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);

const path = require('path');


require('dotenv').config();
const helper = require('./helper_routines');
const routes = require('./routes');

// Initialize server
const app = express();
app.set('trust proxy', 1);
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

app.use(session({
    store: new pgSession({
        pool: helper.pool,
        tableName: 'user_sessions',
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
app.use('/', routes);
app.listen(port, () => {
    console.log('Server runs: http://localhost:3000');
});