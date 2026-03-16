const form = document.getElementById("loginForm");
const back = document.querySelector(".btn-to-login");
const passwordError = document.getElementById("passwordError");

back.addEventListener("click", () => {
    window.location.href = "/login/login.html";
});

form.addEventListener("submit", async function(event) {
    event.preventDefault();
    passwordError.textContent = "";

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;

    try {
        const response = await fetch("/signup", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username,
                password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            passwordError.textContent = data.error || "Benutzer konnte nicht erstellt werden.";
            return;
        }

        alert("Benutzer wurde erstellt. Du kannst dich jetzt anmelden.");
        form.reset();
        window.location.href = "/login/login.html";
    } catch (error) {
        console.error("Fehler:", error);
        passwordError.textContent = "Server nicht erreichbar.";
    }
});
