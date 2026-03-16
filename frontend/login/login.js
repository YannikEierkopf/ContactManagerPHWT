const passwordError = document.getElementById('passwordError');

if (localStorage.getItem('username')) {
    document.getElementById('username').value = localStorage.getItem('username');
    document.getElementById('remember').checked = true;
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            await response.json();
            
            if (rememberMe) {
                localStorage.setItem('username', username);
            }
            else {
                localStorage.removeItem('username');
            }
            
            window.location.href = '/dashboard/dashboard.html';
        } else if (response.status === 429) {
            const data = await response.json();
            passwordError.textContent = `Zu viele Versuche. Bitte versuchen Sie es in ${data.secondsLeft} Sekunden erneut.`;
        } else {
            passwordError.textContent = 'Ungültige Anmeldedaten!';
        }
    } catch (error) {
        console.error('Login error:', error);
        passwordError.textContent = 'Ein Fehler ist aufgetreten!';
    }
});
