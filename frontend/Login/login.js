document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('Benutzername').value;
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('remember').checked;
    
    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            const data = await response.json();
            const userID = data.userID;
            const role = data.role;
            
            // Speichere user Daten im SessionStorage
            sessionStorage.setItem('user', JSON.stringify({ userID, role }));
            
            if (rememberMe) {
                localStorage.setItem('username', username);
            }
            
            // Weiterleitung zum Dashboard
            window.location.href = '/dashboard/dashboard.html';
        } else {
            document.getElementById('passwordError').textContent = 'Ungültige Anmeldedaten!';
        }
    } catch (error) {
        console.error('Login error:', error);
        document.getElementById('passwordError').textContent = 'Ein Fehler ist aufgetreten!';
    }
});
