// Logout function
async function logout() {
    try {
        await fetch("/logout", {
            method: "POST",
            credentials: "include"
        });
    } catch (error) {
        console.error("Logout error:", error);
    } finally {
        window.location.href = "../login/login.html";
    }
}

// Logout button
const logoutButton = document.querySelector("header button");
logoutButton.addEventListener("click", logout);

// Automatic logout after inactivity
let inactivityTimer;
function resetInactivityTimer() {
    clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(function() {
        alert("Du wurdest wegen Inaktivität ausgeloggt.");
        logout();
    }, 20 * 60 * 1000); // 20 Minuten
}

// Events that reset the timer
document.addEventListener("mousemove", resetInactivityTimer);
document.addEventListener("keydown", resetInactivityTimer);
document.addEventListener("click", resetInactivityTimer);
document.addEventListener("scroll", resetInactivityTimer);

// Start timer on load
resetInactivityTimer();
