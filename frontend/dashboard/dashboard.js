
//Authetifizierung User oder Admin
const storedUser = sessionStorage.getItem("user");

if (storedUser) {
  const user = JSON.parse(storedUser);
  document.getElementById(user.role).style.display = "block";

//Logout Button (für Benutzer und Admin)
const logoutButton = document.querySelector("header button");

logoutButton.addEventListener("click", function(){
    sessionStorage.removeItem("user");
    window.location.href = "../login/login.html"
});

//User Funktionalität
if (user.role === "user") {

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

}


//Admin Funktionalität
if (user.role === "admin") {

  const form = document.getElementById("createUserForm");

  form.addEventListener("submit", function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    console.log(username, password, role);
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

*/

} else {
    window.location.href="../login/login.html";
}

/*
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

