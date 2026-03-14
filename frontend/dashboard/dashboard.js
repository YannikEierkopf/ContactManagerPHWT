let user = null;

function redirectToLogin() {
  window.location.href = "../login/login.html";
}

async function checkSession() {
  const response = await fetch("/check-session", {
    credentials: "include"
  });

  if (!response.ok) {
    redirectToLogin();
    return null;
  }

  return response.json();
}

function showRoleSection(role) {
  const section = document.getElementById(role);
  if (section) {
    section.style.display = "block";
  }
}

async function loadContacts() {
  const contactList = document.getElementById("contactList");
  if (!contactList) {
    return;
  }

  try {
    const response = await fetch("/get/contact/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (response.status === 401) {
      redirectToLogin();
      return;
    }

    if (!response.ok) {
      console.error("Fehler beim Laden der Kontakte:", response.status);
      return;
    }

    const contacts = await response.json();
    contactList.innerHTML = "";

    contacts.forEach((contact) => {
      const li = document.createElement("li");
      const link = document.createElement("a");
      link.href = `../contact/edit_contact.html?id=${contact.id}`;
      link.textContent = [
      `${contact.first_name} ${contact.last_name}`,
      contact.email,
      contact.telephone_number
      ]
      .filter(Boolean)
      .join("\u00A0\u00A0|\u00A0\u00A0")    //non breaking space

      li.appendChild(link);
      contactList.appendChild(li);
    });
  } catch (error) {
    console.error("Fehler beim Laden der Kontakte:", error);
  }
}

function setupAdminCreateUser() {
  const form = document.getElementById("createUserForm");
  if (!form) {
    return;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({ username, password, role })
      });

      if (response.status === 401 || response.status === 403) {
        redirectToLogin();
        return;
      }

      const data = await response.json();
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

async function initDashboard() {
  user = await checkSession();
  if (!user) {
    return;
  }

  if (user.role !== "user" && user.role !== "admin") {
    redirectToLogin();
    return;
  }

  showRoleSection(user.role);

  if (user.role === "user") {
    await loadContacts();
  }

  if (user.role === "admin") {
    setupAdminCreateUser();
  }
}

document.addEventListener("DOMContentLoaded", initDashboard);

const newContactBtn = document.querySelector(".btn-new-contact");

newContactBtn.addEventListener("click", () => {
    window.location.href = "../contact/new_contact.html";
});