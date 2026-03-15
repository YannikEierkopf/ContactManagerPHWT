const router = require('../routes');
const helper = require('../helper_routines');

//POST inquiries
router.post('/create/inquire', async (req, res) => {
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
        await helper.pool.query(insertQuery, values);
        console.log(`New inquire was created.`);
        res.send('Neue Anfrage wurde erstellt!');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Fehler');
    }
});
