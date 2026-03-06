//Logout Button (für Benutzer und Admin)
const logoutButton = document.querySelector("header button");

logoutButton.addEventListener("click", function(){
    sessionStorage.removeItem("user");
    //window.location.href = "../login/login.html"
    window.location.href="../login/login.html";
});