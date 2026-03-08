// Logout als Funktion (ergänzt)
function logout(){
    sessionStorage.removeItem("user");
    window.location.href = "../login/login.html";
}

// Logout Button
const logoutButton = document.querySelector("header button");
logoutButton.addEventListener("click", logout);

// Automatischer Logout nach 5 Minuten
let inactivityTimer;
function resetInactivityTimer(){
    clearTimeout (inactivityTimer);

    inactivityTimer = setTimeout(function(){
        alert("Du wurdest wegen Inaktivität ausgeloggt.");
        logout();
    }, 5 * 50 * 1000); // 5 Minuten
}

// Events, die den Timer resetten
document.addEventListener("mousemove", resetInactivityTimer);
document.addEventListener("keydown", resetInactivityTimer);
document.addEventListener("click", resetInactivityTimer);
document.addEventListener("scroll", resetInactivityTimer);

// Timer beim Laden starten
resetInactivityTimer();