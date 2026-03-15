const router = require('../routes');
const helper = require('../helper_routines');

// admin creates a new user with explicit role
router.post('/api/users', router.authLimiter, helper.requireLogin, helper.requireAdmin, async (req, res) => {
    const { username, password, role } = req.body;
    const normalizedUsername = helper.normalizeUsername(username);

    if (!normalizedUsername || !password || !role) {
        return res.status(400).json({ error: 'Benutzername, Passwort und Rolle sind erforderlich' });
    }

    if (!['admin', 'user'].includes(role)) {
        return res.status(400).json({ error: 'Rolle muss admin oder user sein' });
    }

    try {
        const hashed = await helper.hashPassword(password);
        const insert = `INSERT INTO users (username, password_hash, role) VALUES ($1, $2, $3)`;
        await helper.pool.query(insert, [normalizedUsername, hashed, role]);
        return res.status(201).json({ message: 'Benutzer erstellt' });
    } catch (err) {
        if (err.code === '23505') {
            return res.status(409).json({ error: 'Benutzername existiert bereits' });
        }
        console.error(err);
        return res.status(500).json({ error: 'Fehler beim Erstellen des Benutzers' });
    }
});

// update a user's password
router.post('/set/password', helper.requireLogin, async (req, res) => {
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
        await helper.setPassword(targetUserID, newPassword);
        res.send('Passwort aktualisiert');
    } catch (err) {
        console.error(err);
        res.status(500).send('Fehler beim Aktualisieren des Passworts');
    }
});
