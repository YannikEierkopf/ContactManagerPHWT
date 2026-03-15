const router = require('../routes');
const helper = require('../helper_routines');
const bcrypt = require('bcrypt');

// public signup: create a normal user account
router.post('/api/signup', router.authLimiter, async (req, res) => {
    const { username, password } = req.body;
    const normalizedUsername = helper.normalizeUsername(username);

    if (!normalizedUsername || !password) {
        return res.status(400).json({ error: 'Benutzername und Passwort sind erforderlich' });
    }

    try {
        const hashed = await helper.hashPassword(password);
        const insert = `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, 'user')`;
        await helper.pool.query(insert, [normalizedUsername, hashed]);
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
router.post('/login', router.authLimiter, async (req, res) => {
    const { username, password } = req.body;
    const normalizedUsername = helper.normalizeUsername(username);
    if (!normalizedUsername || !password) {
        return res.status(400).send('username and password required');
    }

    try {
        const select = `SELECT id, username, password_hash, role FROM users WHERE username = $1`;
        const { rows } = await helper.pool.query(select, [normalizedUsername]);
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

router.get('/check-session', (req, res) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ message: 'Keine aktive Sitzung' });
    }
    res.json(req.session.user);
});

router.post('/logout', helper.requireLogin, (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Abmelden fehlgeschlagen' });
        }
        res.clearCookie('connect.sid');
        return res.json({ message: 'Erfolgreich abgemeldet' });
    });
});
