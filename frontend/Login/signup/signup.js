 const form = document.getElementById("loginForm");
 const back = document.querySelector(".btn-to-login");

  back.addEventListener("click", () => {
    window.location.href = "/login/login.html";
 });

  form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const role = 'user';

    try {
      const response = await fetch("http://localhost:3000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password,
          role: role
        })
      });

      const data = await response.json();
      console.log(response.status);
      console.log(data);

      if (!response.ok) {
        alert(data.error || "Benutzer konnte nicht erstellt werden.");
        return;
      }

      alert("Benutzer wurde erstellt.");
      form.reset();
    } catch (error) {
      console.error("Fehler:", error);
      alert("Server nicht erreichbar.");
    }
  });
