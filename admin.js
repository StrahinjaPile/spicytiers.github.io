"use strict";


/* =========================================================
   ELEMENTS
========================================================= */

const loginPanel =
    document.getElementById("loginPanel");

const deniedPanel =
    document.getElementById("deniedPanel");

const adminPanel =
    document.getElementById("adminPanel");


const loginMessage =
    document.getElementById("loginMessage");

const adminMessage =
    document.getElementById("adminMessage");


const loginButton =
    document.getElementById("loginButton");

const logoutButton =
    document.getElementById("logoutButton");

const logoutDenied =
    document.getElementById("logoutDenied");


const savePlayerButton =
    document.getElementById("savePlayer");

const deletePlayerButton =
    document.getElementById("deletePlayer");


const playerList =
    document.getElementById("adminPlayerList");


/* =========================================================
   STATE
========================================================= */

let currentUser = null;
let isAdmin = false;


/* =========================================================
   CHECK FIREBASE
========================================================= */

if (
    typeof firebase === "undefined"
) {

    console.error(
        "Firebase SDK was not loaded."
    );

    showLoginMessage(
        "Firebase failed to load.",
        false
    );

}


if (
    typeof auth === "undefined" ||
    typeof db === "undefined"
) {

    console.error(
        "Firebase Auth / Firestore was not initialized."
    );

    showLoginMessage(
        "Firebase configuration failed.",
        false
    );

}


/* =========================================================
   HIDE ALL
========================================================= */

function hideEverything() {

    loginPanel.style.display = "none";

    deniedPanel.style.display = "none";

    adminPanel.style.display = "none";
}


/* =========================================================
   AUTH STATE
========================================================= */

auth.onAuthStateChanged(
    async (user) => {

        hideEverything();

        currentUser = user;

        isAdmin = false;


        /* NOT LOGGED IN */

        if (!user) {

            loginPanel.style.display = "block";

            return;
        }


        /* LOGGED IN */

        console.log(
            "Logged in as:",
            user.email
        );

        console.log(
            "UID:",
            user.uid
        );


        try {

            const userDoc =
                await db
                    .collection("users")
                    .doc(user.uid)
                    .get();


            console.log(
                "User document:",
                userDoc.exists
                    ? userDoc.data()
                    : "DOES NOT EXIST"
            );


            if (
                userDoc.exists &&
                userDoc.data().role === "admin"
            ) {

                isAdmin = true;

                adminPanel.style.display =
                    "block";


                await loadAdminPlayers();

            } else {

                isAdmin = false;

                deniedPanel.style.display =
                    "block";
            }


        } catch (error) {

            console.error(
                "ADMIN CHECK ERROR:",
                error
            );

            loginPanel.style.display =
                "block";

            showLoginMessage(
                "Could not check admin permissions: " +
                error.message,
                false
            );
        }

    }
);


/* =========================================================
   LOGIN
========================================================= */

loginButton.addEventListener(
    "click",
    async () => {

        const email =
            document
                .getElementById("email")
                .value
                .trim();


        const password =
            document
                .getElementById("password")
                .value;


        if (!email) {

            showLoginMessage(
                "Enter your email.",
                false
            );

            return;
        }


        if (!password) {

            showLoginMessage(
                "Enter your password.",
                false
            );

            return;
        }


        loginButton.disabled = true;

        loginButton.textContent =
            "LOGGING IN...";


        showLoginMessage(
            "Logging in...",
            true
        );


        try {

            await auth
                .signInWithEmailAndPassword(
                    email,
                    password
                );


            showLoginMessage(
                "Login successful!",
                true
            );


        } catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            let message =
                error.message;


            if (
                error.code ===
                "auth/invalid-credential"
            ) {

                message =
                    "Invalid email or password.";

            }


            if (
                error.code ===
                "auth/user-not-found"
            ) {

                message =
                    "No account exists with this email.";

            }


            if (
                error.code ===
                "auth/wrong-password"
            ) {

                message =
                    "Incorrect password.";

            }


            if (
                error.code ===
                "auth/too-many-requests"
            ) {

                message =
                    "Too many attempts. Try again later.";

            }


            showLoginMessage(
                message,
                false
            );


        } finally {

            loginButton.disabled =
                false;

            loginButton.textContent =
                "LOGIN";
        }

    }
);


/* =========================================================
   LOGOUT
========================================================= */

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await auth.signOut();

        } catch (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );
        }

    }
);


logoutDenied.addEventListener(
    "click",
    async () => {

        try {

            await auth.signOut();

        } catch (error) {

            console.error(
                "LOGOUT ERROR:",
                error
            );
        }

    }
);


/* =========================================================
   SAVE / UPDATE PLAYER
========================================================= */

savePlayerButton.addEventListener(
    "click",
    async () => {

        if (!isAdmin) {

            showAdminMessage(
                "Access denied.",
                false
            );

            return;
        }


        const username =
            document
                .getElementById("username")
                .value
                .trim();


        const eloText =
            document
                .getElementById("elo")
                .value
                .trim();


        const tier =
            document
                .getElementById("tier")
                .value;


        const elo =
            Number(eloText);


        if (!username) {

            showAdminMessage(
                "Enter a Minecraft username.",
                false
            );

            return;
        }


        if (
            eloText === "" ||
            !Number.isFinite(elo) ||
            elo < 0
        ) {

            showAdminMessage(
                "Enter a valid ELO.",
                false
            );

            return;
        }


        savePlayerButton.disabled =
            true;

        savePlayerButton.textContent =
            "SAVING...";


        try {

            await db
                .collection("players")
                .doc(
                    username.toLowerCase()
                )
                .set({

                    username:
                        username,

                    elo:
                        elo,

                    tier:
                        tier,

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });


            showAdminMessage(
                username +
                " saved successfully!",
                true
            );


            await loadAdminPlayers();


        } catch (error) {

            console.error(
                "SAVE ERROR:",
                error
            );


            showAdminMessage(
                error.message,
                false
            );


        } finally {

            savePlayerButton.disabled =
                false;

            savePlayerButton.textContent =
                "SAVE / UPDATE PLAYER";
        }

    }
);


/* =========================================================
   DELETE PLAYER
========================================================= */

deletePlayerButton.addEventListener(
    "click",
    async () => {

        if (!isAdmin) {
            return;
        }


        const username =
            document
                .getElementById("username")
                .value
                .trim();


        if (!username) {

            showAdminMessage(
                "Enter the player's username.",
                false
            );

            return;
        }


        const confirmed =
            confirm(
                "Are you sure you want to delete " +
                username +
                "?"
            );


        if (!confirmed) {
            return;
        }


        deletePlayerButton.disabled =
            true;

        deletePlayerButton.textContent =
            "DELETING...";


        try {

            await db
                .collection("players")
                .doc(
                    username.toLowerCase()
                )
                .delete();


            showAdminMessage(
                username +
                " deleted successfully.",
                true
            );


            document
                .getElementById("username")
                .value = "";


            document
                .getElementById("elo")
                .value = "";


            document
                .getElementById("tier")
                .value =
                "UNRANKED";


            await loadAdminPlayers();


        } catch (error) {

            console.error(
                "DELETE ERROR:",
                error
            );


            showAdminMessage(
                error.message,
                false
            );


        } finally {

            deletePlayerButton.disabled =
                false;

            deletePlayerButton.textContent =
                "DELETE PLAYER";
        }

    }
);


/* =========================================================
   LOAD PLAYERS
========================================================= */

async function loadAdminPlayers() {

    playerList.innerHTML =
        "Loading...";


    try {

        const snapshot =
            await db
                .collection("players")
                .orderBy(
                    "elo",
                    "desc"
                )
                .get();


        playerList.innerHTML = "";


        if (snapshot.empty) {

            playerList.innerHTML =
                "No players yet.";

            return;
        }


        let rank = 1;


        snapshot.forEach(
            (doc) => {

                const player =
                    doc.data();


                const row =
                    document
                        .createElement(
                            "div"
                        );


                row.className =
                    "admin-player";


                const rankElement =
                    document
                        .createElement(
                            "div"
                        );

                rankElement.textContent =
                    "#" + rank;


                const name =
                    document
                        .createElement(
                            "div"
                        );

                name.textContent =
                    player.username ||
                    "Unknown";


                const tier =
                    document
                        .createElement(
                            "div"
                        );

                tier.textContent =
                    player.tier ||
                    "UNRANKED";


                const elo =
                    document
                        .createElement(
                            "div"
                        );

                elo.textContent =
                    (player.elo || 0) +
                    " ELO";


                row.appendChild(
                    rankElement
                );

                row.appendChild(
                    name
                );

                row.appendChild(
                    tier
                );

                row.appendChild(
                    elo
                );


                row.style.cursor =
                    "pointer";


                row.addEventListener(
                    "click",
                    () => {

                        document
                            .getElementById(
                                "username"
                            )
                            .value =
                            player.username ||
                            "";


                        document
                            .getElementById(
                                "elo"
                            )
                            .value =
                            player.elo ||
                            0;


                        document
                            .getElementById(
                                "tier"
                            )
                            .value =
                            player.tier ||
                            "UNRANKED";


                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                    }
                );


                playerList.appendChild(
                    row
                );


                rank++;
            }
        );


    } catch (error) {

        console.error(
            "LOAD PLAYERS ERROR:",
            error
        );


        playerList.innerHTML =
            "Could not load players: " +
            error.message;
    }
}


/* =========================================================
   LOGIN MESSAGE
========================================================= */

function showLoginMessage(
    message,
    success
) {

    loginMessage.textContent =
        message;


    loginMessage.className =
        success
            ? "message success"
            : "message error";
}


/* =========================================================
   ADMIN MESSAGE
========================================================= */

function showAdminMessage(
    message,
    success
) {

    adminMessage.textContent =
        message;


    adminMessage.className =
        success
            ? "message success"
            : "message error";
}
