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

const eloInput =
    document.getElementById("elo");

const tierInput =
    document.getElementById("tier");

const gameModeInput =
    document.getElementById("gameMode");


let currentUser = null;
let isAdmin = false;


/* =========================
TIER FROM ELO
========================= */

function getTierFromElo(elo) {

    elo = Number(elo);

    if (!Number.isFinite(elo) || elo < 1000) {
        return "UNRANKED";
    }

    if (elo >= 2250) {
        return "HT1";
    }

    if (elo >= 2000) {
        return "LT1";
    }

    if (elo >= 1900) {
        return "HT2";
    }

    if (elo >= 1800) {
        return "LT2";
    }

    if (elo >= 1650) {
        return "HT3";
    }

    if (elo >= 1500) {
        return "LT3";
    }

    if (elo >= 1300) {
        return "HT4";
    }

    if (elo >= 1200) {
        return "LT4";
    }

    if (elo >= 1100) {
        return "HT5";
    }

    return "LT5";
}


/* =========================
UPDATE TIER PREVIEW
========================= */

eloInput.addEventListener("input", () => {

    const elo = Number(eloInput.value);

    tierInput.value =
        getTierFromElo(elo);

});


/* =========================
AUTH STATE
========================= */

auth.onAuthStateChanged(async (user) => {

    currentUser = user;

    loginPanel.style.display = "none";
    deniedPanel.style.display = "none";
    adminPanel.style.display = "none";

    isAdmin = false;


    if (!user) {

        loginPanel.style.display = "block";

        return;
    }


    try {

        const userDoc =
            await db
                .collection("users")
                .doc(user.uid)
                .get();


        if (
            userDoc.exists &&
            userDoc.data().role === "admin"
        ) {

            isAdmin = true;

            adminPanel.style.display = "block";

            loadAdminPlayers();

        } else {

            deniedPanel.style.display = "block";

        }

    } catch (error) {

        console.error(error);

        loginPanel.style.display = "block";

        showLoginMessage(
            "Could not check admin permissions.",
            false
        );

    }

});


/* =========================
LOGIN
========================= */

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


        if (!email || !password) {

            showLoginMessage(
                "Enter your email and password.",
                false
            );

            return;
        }


        try {

            await auth
                .signInWithEmailAndPassword(
                    email,
                    password
                );


            showLoginMessage(
                "Logged in successfully.",
                true
            );

        } catch (error) {

            console.error(error);

            showLoginMessage(
                error.message,
                false
            );

        }

    }
);


/* =========================
LOGOUT
========================= */

logoutButton.addEventListener(
    "click",
    async () => {

        await auth.signOut();

    }
);


logoutDenied.addEventListener(
    "click",
    async () => {

        await auth.signOut();

    }
);


/* =========================
SAVE PLAYER
========================= */

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


        const elo =
            Number(
                document
                    .getElementById("elo")
                    .value
            );


        const gameMode =
            gameModeInput.value;


        if (!username) {

            showAdminMessage(
                "Enter a Minecraft username.",
                false
            );

            return;
        }


        if (
            !Number.isFinite(elo) ||
            elo < 0
        ) {

            showAdminMessage(
                "Enter a valid ELO.",
                false
            );

            return;
        }


        const tier =
            getTierFromElo(elo);


        try {

            const playerRef =
                db
                    .collection("players")
                    .doc(username.toLowerCase());


            const playerDoc =
                await playerRef.get();


            let playerData =
                playerDoc.exists
                    ? playerDoc.data()
                    : {
                        username: username
                    };


            playerData.username =
                username;


            if (!playerData[gameMode]) {

                playerData[gameMode] = {
                    elo: 0,
                    tier: "UNRANKED"
                };

            }


            playerData[gameMode].elo =
                elo;

            playerData[gameMode].tier =
                tier;


            playerData.updatedAt =
                firebase.firestore
                    .FieldValue
                    .serverTimestamp();


            await playerRef.set(
                playerData
            );


            showAdminMessage(
                username +
                " updated for " +
                gameMode.toUpperCase() +
                " — " +
                tier +
                " (" +
                elo +
                " ELO)",
                true
            );


            loadAdminPlayers();


        } catch (error) {

            console.error(error);

            showAdminMessage(
                error.message,
                false
            );

        }

    }
);


/* =========================
DELETE PLAYER FROM MODE
========================= */

deletePlayerButton.addEventListener(
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


        const gameMode =
            gameModeInput.value;


        if (!username) {

            showAdminMessage(
                "Enter the player's username.",
                false
            );

            return;
        }


        const confirmed =
            confirm(
                "Delete " +
                gameMode.toUpperCase() +
                " data for " +
                username +
                "?"
            );


        if (!confirmed) {
            return;
        }


        try {

            const playerRef =
                db
                    .collection("players")
                    .doc(username.toLowerCase());


            const playerDoc =
                await playerRef.get();


            if (!playerDoc.exists) {

                showAdminMessage(
                    "Player does not exist.",
                    false
                );

                return;
            }


            const data =
                playerDoc.data();


            delete data[gameMode];


            await playerRef.set(data);


            showAdminMessage(
                username +
                " " +
                gameMode.toUpperCase() +
                " data deleted.",
                true
            );


            document
                .getElementById("elo")
                .value = "";


            tierInput.value =
                "UNRANKED";


            loadAdminPlayers();


        } catch (error) {

            console.error(error);

            showAdminMessage(
                error.message,
                false
            );

        }

    }
);


/* =========================
LOAD PLAYERS
========================= */

async function loadAdminPlayers() {

    const list =
        document.getElementById(
            "adminPlayerList"
        );


    list.innerHTML =
        "Loading...";


    try {

        const snapshot =
            await db
                .collection("players")
                .get();


        list.innerHTML = "";


        if (snapshot.empty) {

            list.innerHTML =
                "No players yet.";

            return;
        }


        snapshot.forEach((doc) => {

            const player =
                doc.data();


            const mode =
                gameModeInput.value;


            const stats =
                player[mode] || {
                    elo: 0,
                    tier: "UNRANKED"
                };


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "admin-player";


            const name =
                document.createElement(
                    "div"
                );


            name.textContent =
                player.username ||
                "Unknown";


            const tier =
                document.createElement(
                    "div"
                );


            tier.className =
                getTierClass(
                    stats.tier
                );


            tier.textContent =
                stats.tier ||
                "UNRANKED";


            const elo =
                document.createElement(
                    "div"
                );


            elo.textContent =
                (stats.elo || 0) +
                " ELO";


            row.appendChild(name);
            row.appendChild(tier);
            row.appendChild(elo);


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
                        player.username;


                    document
                        .getElementById(
                            "elo"
                        )
                        .value =
                        stats.elo || 0;


                    tierInput.value =
                        stats.tier ||
                        "UNRANKED";


                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }
            );


            list.appendChild(row);

        });

    } catch (error) {

        console.error(error);

        list.innerHTML =
            "Could not load players.";

    }

}


/* =========================
GAME MODE CHANGE
========================= */

gameModeInput.addEventListener(
    "change",
    () => {

        const username =
            document
                .getElementById(
                    "username"
                )
                .value
                .trim();


        if (!username) {

            loadAdminPlayers();

            return;
        }


        db
            .collection("players")
            .doc(username.toLowerCase())
            .get()
            .then((doc) => {

                if (!doc.exists) {

                    eloInput.value = "";
                    tierInput.value =
                        "UNRANKED";

                    return;
                }


                const player =
                    doc.data();


                const stats =
                    player[
                        gameModeInput.value
                    ] || {};


                eloInput.value =
                    stats.elo || 0;


                tierInput.value =
                    stats.tier ||
                    getTierFromElo(
                        stats.elo || 0
                    );

            })
            .catch((error) => {

                console.error(error);

            });


        loadAdminPlayers();

    }
);


/* =========================
TIER CLASS
========================= */

function getTierClass(tier) {

    if (!tier) {
        return "tier-unranked";
    }


    return (
        "tier-" +
        tier
            .toLowerCase()
            .replace(" ", "-")
    );

}


/* =========================
MESSAGES
========================= */

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
