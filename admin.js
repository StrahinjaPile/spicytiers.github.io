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


let isAdmin = false;


/* =========================
GAME MODES
========================= */

const gameModes = [

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
TIERS
========================= */

const tiers = [

    "UNRANKED",

    "LT5",
    "HT5",

    "LT4",
    "HT4",

    "LT3",
    "HT3",

    "LT2",
    "HT2",

    "LT1",
    "HT1"

];


/* =========================
CREATE TIER OPTIONS
========================= */

gameModes.forEach(mode => {

    const select =
        document.getElementById(
            mode + "Tier"
        );


    tiers.forEach(tier => {

        const option =
            document.createElement(
                "option"
            );

        option.value = tier;

        option.textContent = tier;

        select.appendChild(option);

    });

});


/* =========================
AUTH STATE
========================= */

auth.onAuthStateChanged(
    async user => {

        loginPanel.style.display =
            "none";

        deniedPanel.style.display =
            "none";

        adminPanel.style.display =
            "none";


        isAdmin = false;


        if (!user) {

            loginPanel.style.display =
                "block";

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

                adminPanel.style.display =
                    "block";

                loadAdminPlayers();

            } else {

                deniedPanel.style.display =
                    "block";

            }

        } catch (error) {

            console.error(error);

            loginPanel.style.display =
                "block";

            showLoginMessage(
                "Could not check admin permissions.",
                false
            );

        }

    }
);


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


        loginButton.disabled = true;

        loginButton.textContent =
            "LOGGING IN...";


        try {

            await auth
                .signInWithEmailAndPassword(
                    email,
                    password
                );


            showLoginMessage(
                "Login successful.",
                true
            );


        } catch (error) {

            console.error(error);

            showLoginMessage(
                getFirebaseError(error),
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


        const playerData = {
            username: username
        };


        gameModes.forEach(mode => {

            const eloInput =
                document.getElementById(
                    mode + "Elo"
                );

            const tierInput =
                document.getElementById(
                    mode + "Tier"
                );


            const elo =
                Number(
                    eloInput.value
                );


            if (
                !Number.isFinite(elo) ||
                elo < 0
            ) {

                throw new Error(
                    "Invalid ELO for " +
                    mode.toUpperCase()
                );

            }


            playerData[mode] = {

                elo: elo,

                tier:
                    tierInput.value

            };

        });


        try {

            savePlayerButton.disabled =
                true;

            savePlayerButton.textContent =
                "SAVING...";


            playerData.updatedAt =
                firebase.firestore
                    .FieldValue
                    .serverTimestamp();


            await db
                .collection("players")
                .doc(
                    username.toLowerCase()
                )
                .set(
                    playerData
                );


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

            savePlayerButton.disabled =
                false;

            savePlayerButton.textContent =
                "SAVE / UPDATE";

        }

    }
);


/* =========================
DELETE PLAYER
========================= */

deletePlayerButton.addEventListener(
    "click",
    async () => {

        if (!isAdmin) return;


        const username =
            document
                .getElementById("username")
                .value
                .trim();


        if (!username) {

            showAdminMessage(
                "Enter a player's username.",
                false
            );

            return;
        }


        if (
            !confirm(
                "Delete " +
                username +
                "?"
            )
        ) {

            return;
        }


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


        snapshot.forEach(doc => {

            players.push({
                id: doc.id,
                ...doc.data()
            });

        });


        players.sort(
            (a, b) => {

                const aElo =
                    Number(
                        a.sword?.elo || 0
                    );

                const bElo =
                    Number(
                        b.sword?.elo || 0
                    );

                return bElo - aElo;

            }
        );


        list.innerHTML = "";


        if (players.length === 0) {

            list.innerHTML =
                "No players yet.";

            return;
        }


        players.forEach(player => {

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


            const sword =
                document.createElement(
                    "div"
                );

            sword.textContent =
                "Sword: " +
                (
                    player.sword?.elo ||
                    0
                );


            const tier =
                document.createElement(
                    "div"
                );

            tier.textContent =
                player.sword?.tier ||
                "UNRANKED";


            row.appendChild(name);
            row.appendChild(sword);
            row.appendChild(tier);


            row.addEventListener(
                "click",
                () => {

                    loadPlayerIntoEditor(
                        player
                    );

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
LOAD PLAYER EDITOR
========================= */

function loadPlayerIntoEditor(
    player
) {

    document
        .getElementById("username")
        .value =
        player.username || "";


    gameModes.forEach(mode => {

        const stats =
            player[mode] || {};


        document
            .getElementById(
                mode + "Elo"
            )
            .value =
            Number(stats.elo) || 0;


        document
            .getElementById(
                mode + "Tier"
            )
            .value =
            stats.tier || "UNRANKED";

    });


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


/* =========================
CLEAR EDITOR
========================= */

function clearEditor() {

    document
        .getElementById("username")
        .value = "";


    gameModes.forEach(mode => {

        document
            .getElementById(
                mode + "Elo"
            )
            .value = 0;


        document
            .getElementById(
                mode + "Tier"
            )
            .value =
            "UNRANKED";

    });

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


/* =========================
FIREBASE ERRORS
========================= */

function getFirebaseError(error) {

    if (
        error.code ===
        "auth/invalid-credential"
    ) {

        return "Wrong email or password.";

    }

    if (
        error.code ===
        "auth/user-not-found"
    ) {

        return "Account does not exist.";

    }

    if (
        error.code ===
        "auth/wrong-password"
    ) {

        return "Wrong password.";

    }

    if (
        error.code ===
        "auth/too-many-requests"
    ) {

        return "Too many attempts. Try again later.";

    }

    return (
        error.message ||
        "Login failed."
    );

}
