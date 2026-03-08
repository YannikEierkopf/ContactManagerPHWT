// Kontakte suchen
const searchInput = document.getElementById("contactSearch");
const contactList = document.getElementById("contactList");

searchInput.addEventListener("input", function () {     //Durch das input Event wir direkt bei der Eingabe "gesucht" (Ausblenden derer die nicht gesucht werden)
    const searchTerm = searchInput.value.toLowerCase();

    const contacts = contactList.getElementsByTagName("li");

    for (let i = 0; i < contacts.length; i++) {
        const contactText = contacts[i].textContent.toLowerCase();  //TextContent - HTML wird escaped - Sicherheit gegeben
                                                                    //Keine Nutzung von Inner HTML
        if (contactText.includes(searchTerm)) {
            contacts[i].style.display = "";
        } else {
            contacts[i].style.display = "none";
        }
    }
});