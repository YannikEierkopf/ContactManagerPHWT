
function addField() {
    const container = document.getElementById('customFields');
    const field = document.createElement('div');
    const i = Date.now();

    field.id = `${i}`;
    field.style.marginBottom = '10px';
    field.innerHTML = `
                        <input type = "text" id = "label_${i}" name = "label_${i}" placeholder = "Bezeichnung"><br>
                        <input type="text" id = "input_${i}" name="input_${i}" placeholder="Wert"><br>
                        <button type = "button" onclick = "removeField(${i})">Feld löschen</button>`

    container.appendChild(field);
}

function removeField(id) {
    const field = document.getElementById(id);
    field.remove();

}

window.onload = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const contactId = urlParams.get('id');

    if (!contactId) {
        return;
    }

    document.getElementById('contactId').value = contactId;

    try {
        const response = await fetch(`/api/contacts/${contactId}`);
        const contact = await response.json();

        document.getElementById('firstName').value = contact.first_name || '';
        document.getElementById('lastName').value = contact.last_name || '';
        document.getElementById('email').value = contact.email || '';
        document.getElementById('telephoneNumber').value = contact.telephone_number || '';

        if (contact.custom_fields) {
            for (const [key, value] of Object.entries(contact.custom_fields)) {
                loadCustomField(key, value);
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

function loadCustomField(labelName, inputValue) {
    const container = document.getElementById('customFields');
    const field = document.createElement('div');
    const i = Date.now();

    field.id = `field_${i}`;
    field.style.marginBottom = '10px';
    field.innerHTML = `
                        <input type="text" id="label_${i}" name="label_${i}" value="${labelName}" placeholder="Bezeichnung"><br>
                        <input type="text" id="input_${i}" name="input_${i}" value="${inputValue}" placeholder="Wert"><br>
                        <button type="button" onclick="removeField('field_${i}')">Feld löschen</button>`;

    container.appendChild(field);
}

async function deleteContact() {
    const contactId = document.getElementById('contactId').value;

    try {
        const response = await fetch('/delete/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${contactId}`
        });

        if (response.ok) {
            window.location.href = '/dashboard/dashboard.html';
        }
    } catch (error) {
        console.error('Error:', error);
    }
}
