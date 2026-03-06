//Authetifizierung User oder Admin
let user = null;  // const weggelassen, damit es auch auf einer höheren Ebene verfügbar ist
const storedUser = sessionStorage.getItem("user");

if (storedUser) {
  user = JSON.parse(storedUser);
if (!user){
    window.location.href="../login/login.html";
  }
//Bereiche sichtbar machen
  document.getElementById(user.role).style.display = "block";
}
 
/*
//Logout Button (für Benutzer und Admin)
const logoutButton = document.querySelector("header button");

logoutButton.addEventListener("click", function(){
    sessionStorage.removeItem("user");
    //window.location.href = "../login/login.html"
    window.location.href="../login/login.html";
});
*/
//User Funktionalität
if (user &&user.role === "user") {
  const contactList = document.getElementById("contactList");

   // Funktion, um Kontakte aus der Datenbank zu laden
  async function loadContacts() {
    try {
      const response = await fetch("http://localhost:3000/get/contact/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userID: user.userID }) // nutzt die userID vom SessionStorage
      });

      const contacts = await response.json();

      contactList.innerHTML = ""; // vorherige Liste leeren

      contacts.forEach(contact => {
  const li = document.createElement("li");

  // Link erstellen mit Query Parameter ?id=contactID
  const link = document.createElement("a");
  link.href = `../contact/edit_contact.html?id=${contact.id}`;
  link.textContent =
    contact.first_name + " " +
    contact.last_name + " | " +
    (contact.email || "keine Email") + " | " +
    (contact.telephone_number || "keine Telefonnummer");

  li.appendChild(link);
  contactList.appendChild(li);
});

    } catch (error) {
      console.error("Fehler beim Laden der Kontakte:", error);
    }
  }

  // Funktion direkt aufrufen
  loadContacts();
}


//ALt, auskommentiert
/*
 
  const contactList = document.getElementById("contactList");

  const contacts = [
    { name: "Max Mustermann", company: "Firma A", city: "Berlin" },
    { name: "Lisa Müller", company: "Firma B", city: "Hamburg" }
  ];

  contacts.forEach(function(contact) {
    const li = document.createElement("li");
    li.textContent = contact.name + " | " + contact.company + " | " + contact.city;
    contactList.appendChild(li);
  });


*/

//Admin Funktionalität
if (user.role === "admin") {

  const form = document.getElementById("createUserForm");

  form.addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

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
}

/*
console.log(username, password, role);

später erstzen etwas in die Richtung

fetch("http://localhost:3000/api/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    username: username,
    password: password,
    role: role
  })
})
.then(response => response.json())
.then(data => {
  console.log("Antwort vom Server:", data);
})
.catch(error => {
  console.error("Fehler:", error);
});
  });
}








} else {
    //window.location.href="../login/login.html";
    window.location.href="loginzumtest.html";
}

/*

--Neuer realer Testbenutzer--
sessionStorage.setItem("user", JSON.stringify({
  userID: 4,        
  username: "Max.Mustermann",
  role: "user"
}));

--Neuer realer Testadmin--
sessionStorage.setItem("user", JSON.stringify({
  userID: 5,        
  username: "Admin",
  role: "admin"
}));


--Benutzer--
sessionStorage.setItem("user", JSON.stringify({
  username: "Lisa",
  role: "user"
}));

--Admin--
sessionStorage.setItem("user", JSON.stringify({
  username: "Max",
  role: "admin"
}));
*/ 

