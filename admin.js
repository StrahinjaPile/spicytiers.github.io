const loginPanel = document.getElementById("loginPanel");
const deniedPanel = document.getElementById("deniedPanel");
const adminPanel = document.getElementById("adminPanel");

const loginMessage = document.getElementById("loginMessage");
const adminMessage = document.getElementById("adminMessage");

const loginButton = document.getElementById("loginButton");
const logoutButton = document.getElementById("logoutButton");
const logoutDenied = document.getElementById("logoutDenied");

const savePlayerButton = document.getElementById("savePlayer");
const deletePlayerButton = document.getElementById("deletePlayer");

let currentUser = null;
let isAdmin = false;


/* =========================
   GAMEMODES
========================= */

const modes = [
    "sword",
    "axe",
    "vanilla",
    "uhc",
    "smp",
    "netheriteop",
    "pot",
    "mace"
];


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

        const userDoc = await db
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

            loginButton.disabled = true;

            loginButton.textContent =
                "LOGGING IN...";


            await auth.signInWithEmailAndPassword(
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


        } finally {

            loginButton.disabled = false;

            loginButton.textContent =
                "LOGIN";

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


        if (!username) {

            showAdminMessage(
                "Enter a Minecraft username.",
                false
            );

            return;
        }


        const modesData = {};


        for (const mode of modes) {

            const eloInput =
                document.getElementById(
                    mode + "-elo"
                );

            const tierInput =
                document.getElementById(
                    mode + "-tier"
                );


            const elo =
                Number(
                    eloInput.value || 0
                );


            const tier =
                tierInput.value;


            if (
                !Number.isFinite(elo) ||
                elo < 0
            ) {

                showAdminMessage(
                    "Invalid ELO in " +
                    mode.toUpperCase(),
                    false
                );

                return;
            }


            modesData[mode] = {

                elo: elo,

                tier: tier

            };

        }


        try {

            savePlayerButton.disabled = true;

            savePlayerButton.textContent =
                "SAVING...";


            await db
                .collection("players")
                .doc(username.toLowerCase())
                .set({

                    username: username,

                    modes: modesData,

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


            loadAdminPlayers();


        } catch (error) {

            console.error(error);

            showAdminMessage(
                error.message,
                false
            );


        } finally {

            savePlayerButton.disabled = false;

            savePlayerButton.textContent =
                "SAVE / UPDATE PLAYER";

        }

    }
);


/* =========================
   DELETE PLAYER
========================= */

deletePlayerButton.addEventListener(
    "click",
    async () => {

        if (!isAdmin)
            return;


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


        if (!confirmed)
            return;


        try {

            await db
                .collection("players")
                .doc(
                    username.toLowerCase()
                )
                .delete();


            showAdminMessage(
                username +
                " deleted.",
                true
            );


            clearEditor();

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


        const players = [];


        snapshot.forEach((doc) => {

            players.push({
                id: doc.id,
                ...doc.data()
            });

        });


        players.sort(
            (a, b) => {

                const aElo =
                    getTotalElo(a);

                const bElo =
                    getTotalElo(b);

                return bElo - aElo;

            }
        );


        list.innerHTML = "";


        if (players.length === 0) {

            list.innerHTML =
                "No players yet.";

            return;
        }


        players.forEach(
            (player) => {

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


                const total =
                    document.createElement(
                        "div"
                    );

                total.textContent =
                    getTotalElo(player) +
                    " TOTAL ELO";


                row.appendChild(name);

                row.appendChild(total);


                row.style.cursor =
                    "pointer";


                row.addEventListener(
                    "click",
                    () => {

                        loadPlayerIntoEditor(
                            player
                        );

                        window.scrollTo({
                            top: 0,
                            behavior: "smooth"
                        });

                    }
                );


                list.appendChild(row);

            }
        );


    } catch (error) {

        console.error(error);

        list.innerHTML =
            "Could not load players.";

    }

}


/* =========================
   LOAD PLAYER INTO EDITOR
========================= */

function loadPlayerIntoEditor(player) {

    document
        .getElementById("username")
        .value =
        player.username || "";


    for (const mode of modes) {

        const modeData =
            player.modes &&
            player.modes[mode]
                ? player.modes[mode]
                : {
                    elo: 0,
                    tier: "UNRANKED"
                };


        document
            .getElementById(
                mode + "-elo"
            )
            .value =
            modeData.elo || 0;


        document
            .getElementById(
                mode + "-tier"
            )
            .value =
            modeData.tier ||
            "UNRANKED";

    }


    showAdminMessage(
        "Loaded " +
        player.username +
        ".",
        true
    );

}


/* =========================
   CLEAR EDITOR
========================= */

function clearEditor() {

    document
        .getElementById("username")
        .value = "";


    for (const mode of modes) {

        document
            .getElementById(
                mode + "-elo"
            )
            .value = 0;


        document
            .getElementById(
                mode + "-tier"
            )
            .value =
            "UNRANKED";

    }

}


/* =========================
   TOTAL ELO
========================= */

function getTotalElo(player) {

    let total = 0;


    for (const mode of modes) {

        if (
            player.modes &&
            player.modes[mode]
        ) {

            total += Number(
                player
                    .modes[mode]
                    .elo || 0
            );

        }

    }


    return total;

}


/* =========================
   LOGIN MESSAGE
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


/* =========================
   ADMIN MESSAGE
========================= */

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
