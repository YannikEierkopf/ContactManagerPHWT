const router = require('../routes');
const helper = require('../helper_routines');

// fetch contacts for a user
router.post('/get/contact/', helper.requireLogin, async (req, res) => {
    try {
        const userID = req.session.user.id;
        const contacts = await helper.getContacts(userID);
        res.json(contacts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Fehler beim Laden der Kontakte');
    }
});

// Contact
// POST new contact
router.post('/create/contact', helper.requireLogin, async (req, res) => {
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
            let fieldName = data[key].trim();
            const fieldValue = data[`input_${id}`];
            if (!fieldName) continue;

            let finalFieldName = fieldName;
            let counter = 2;

            while (customFields.hasOwnProperty(finalFieldName)) {
                finalFieldName = `${fieldName} (${counter})`;
                counter++;
            }
            customFields[finalFieldName] = fieldValue;

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
        const result = await helper.pool.query(insertQuery, values);
        const contactID = result.rows[0].id;
        const userID = req.session.user.id;

        await helper.pool.query(
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

router.post('/edit/contact', helper.requireLogin, async (req, res) => {
    const data = req.body;
    //const id = req.params.id;
    const id = parseInt(data.id, 10); // von hidden input im Formular
    if (!id) return res.status(400).send('contact ID fehlt');

    try {
        const allowed = await helper.userOwnsContact(req.session.user.id, id);
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
            let fieldName = data[key].trim();
            const fieldValue = data[`input_${id}`];
            if (!fieldName) continue;

            let finalFieldName = fieldName;
            let counter = 2;

            while (customFields.hasOwnProperty(finalFieldName)) {
                finalFieldName = `${fieldName} (${counter})`;
                counter++;
            }
            customFields[finalFieldName] = fieldValue;
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
        await helper.pool.query(editQuery, values);
        console.log(`Contact was edited.`);
        res.redirect('../dashboard/dashboard.html');
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Fehler');
    }

});

//GET data for edit
router.get('/contacts/:id', helper.requireLogin, async (req, res) => {
    const contactId = parseInt(req.params.id, 10);
    if (!contactId) {
        return res.status(400).send('Ungueltige Kontakt-ID');
    }

    try {
        const allowed = await helper.userOwnsContact(req.session.user.id, contactId);
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
        const result = await helper.pool.query(selectQuery, [contactId]);
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching single contact:', error);
        res.status(500).send('Fehler');
    }
});

// POST delete contact
router.post('/delete/contact', helper.requireLogin, async (req, res) => {
    const id = Number(req.body.id);
    if (!id) {
        return res.status(400).send('Ungueltige Kontakt-ID');
    }

    try {
        const allowed = await helper.userOwnsContact(req.session.user.id, id);
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
        await helper.pool.query(deleteQuery, [id]);
        console.log(`Contact was deleted.`);
        res.sendStatus(200);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Fehler');
    }
});

// this module attaches routes to the shared `router`
