const loginButton =
    document.getElementById("minecraftLogin");

const loginMessage =
    document.getElementById("loginMessage");


loginButton.addEventListener("click", () => {

    loginMessage.className =
        "login-message";

    loginMessage.textContent =
        "Open the SpicyTiers client to connect your Minecraft account.";

});
