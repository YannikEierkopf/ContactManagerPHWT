const back = document.querySelector(".btn-dashboard");

back.addEventListener("click", () => {
    window.history.back();
});

document.querySelector('form').addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = {
        name: document.getElementById('name').value,
	email: document.getElementById('email').value,
	message: document.getElementById('message').value
    };

    try {
	const response = await fetch('/create/inquire', {
	    method:'POST',
	    headers: { 'Content-Type': 'application/json' },
	    body: JSON.stringify(formData)
	});

	if (response.ok) {
	    alert('Nachricht erfolgreich gesendet!');
	    window.history.back();
	} else {
	    alert('Fehler beim Senden der Nachricht.');
	}
    } catch (error) {
	alert('Ein Fehler ist aufgetreten.');
	}
});
