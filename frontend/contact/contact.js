
function addField() {
    const container = document.getElementById('customFields');
    const field = document.createElement('div');
    const i = Math.random();

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
        const response = await fetch(`/contacts/${contactId}`);
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
    const i = Math.random();

    field.id = `field_${i}`;
    field.style.marginBottom = '10px';

    const labelInput = document.createElement('input');
    labelInput.type = 'text';
    labelInput.id = `label_${i}`;
    labelInput.name = `label_${i}`;
    labelInput.value = labelName;
    labelInput.placeholder = 'Bezeichnung';

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.id = `input_${i}`;
    valueInput.name = `input_${i}`;
    valueInput.value = inputValue;
    valueInput.placeholder = 'Wert';
    valueInput.maxLength = 255;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.textContent = 'Feld löschen';
    deleteBtn.onclick = function() { removeField(`field_${i}`); };

    field.appendChild(labelInput);
    field.appendChild(valueInput);
    field.appendChild(deleteBtn);

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

const cancelBtn = document.querySelector('.cancel');

cancelBtn.addEventListener('click', () => {
    window.location.href = '/dashboard/dashboard.html';
});

const logoutBtn = document.querySelector('.btn-logout');

logoutBtn.addEventListener('click', async () => {
    try {
        await fetch('/logout', {
            method: 'POST',
            credentials: 'include'
        });
    } catch (error) {
        console.error('Logout Error:', error);
    } finally {
        window.location.href = '/login/login.html';
    }
});
