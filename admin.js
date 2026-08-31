console.log("🔥 SpicyTiers admin.js loaded!");

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

const loginForm = document.getElementById("loginForm");

let currentUser = null;
let isAdmin = false;


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

    console.log("Logged in:", user.email);
    console.log("UID:", user.uid);

    try {

        const userDoc = await db
            .collection("users")
            .doc(user.uid)
            .get();

        if (
            userDoc.exists &&
            userDoc.data().role === "admin"
        ) {

            console.log("✅ Admin verified");

            isAdmin = true;

            adminPanel.style.display = "block";

            await loadAdminPlayers();

        } else {

            console.log("❌ User is not admin");

            deniedPanel.style.display = "block";
        }

    } catch (error) {

        console.error("Admin check error:", error);

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

if (loginForm) {

    loginForm.addEventListener("submit", async (event) => {

        event.preventDefault();

        await login();

    });

} else {

    loginButton.addEventListener("click", async () => {

        await login();

    });

}


async function login() {

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = document
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
    loginButton.textContent = "LOGGING IN...";

    try {

        await auth.signInWithEmailAndPassword(
            email,
            password
        );

        showLoginMessage(
            "Login successful!",
            true
        );

    } catch (error) {

        console.error("Login error:", error);

        showLoginMessage(
            getFirebaseError(error),
            false
        );

    } finally {

        loginButton.disabled = false;
        loginButton.textContent = "LOGIN";

    }
}


/* =========================
   LOGOUT
========================= */

logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await auth.signOut();

        } catch (error) {

            console.error(error);

        }

    }
);


logoutDenied.addEventListener(
    "click",
    async () => {

        try {

            await auth.signOut();

        } catch (error) {

            console.error(error);

        }

    }
);


/* =========================
   SAVE / UPDATE PLAYER
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

        const username = document
            .getElementById("username")
            .value
            .trim();

        const eloValue = document
            .getElementById("elo")
            .value;

        const elo = Number(eloValue);

        const tier = document
            .getElementById("tier")
            .value;

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

        savePlayerButton.disabled = true;
        savePlayerButton.textContent = "SAVING...";

        try {

            await db
                .collection("players")
                .doc(username.toLowerCase())
                .set({

                    username: username,

                    elo: elo,

                    tier: tier,

                    updatedAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp()

                });

            showAdminMessage(
                username + " saved successfully!",
                true
            );

            await loadAdminPlayers();

        } catch (error) {

            console.error(
                "Save player error:",
                error
            );

            showAdminMessage(
                getFirebaseError(error),
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

        if (!isAdmin) {

            showAdminMessage(
                "Access denied.",
                false
            );

            return;
        }

        const username = document
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

        const confirmed = confirm(
            "Are you sure you want to delete " +
            username +
            "?"
        );

        if (!confirmed) return;

        deletePlayerButton.disabled = true;
        deletePlayerButton.textContent = "DELETING...";

        try {

            await db
                .collection("players")
                .doc(username.toLowerCase())
                .delete();

            showAdminMessage(
                username + " deleted successfully.",
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
                .value = "UNRANKED";

            await loadAdminPlayers();

        } catch (error) {

            console.error(
                "Delete player error:",
                error
            );

            showAdminMessage(
                getFirebaseError(error),
                false
            );

        } finally {

            deletePlayerButton.disabled = false;
            deletePlayerButton.textContent =
                "DELETE PLAYER";

        }

    }
);


/* =========================
   LOAD PLAYERS
========================= */

async function loadAdminPlayers() {

    const list = document.getElementById(
        "adminPlayerList"
    );

    list.innerHTML = "Loading players...";

    try {

        const snapshot = await db
            .collection("players")
            .orderBy("elo", "desc")
            .get();

        list.innerHTML = "";

        if (snapshot.empty) {

            list.innerHTML = "No players yet.";

            return;
        }

        let rank = 1;

        snapshot.forEach((doc) => {

            const player = doc.data();

            const row =
                document.createElement("div");

            row.className = "admin-player";

            const name =
                document.createElement("div");

            name.textContent =
                player.username || "Unknown";

            const tier =
                document.createElement("div");

            tier.textContent =
                player.tier || "UNRANKED";

            const elo =
                document.createElement("div");

            elo.textContent =
                (player.elo || 0) + " ELO";

            const rankElement =
                document.createElement("div");

            rankElement.textContent =
                "#" + rank;

            row.appendChild(rankElement);
            row.appendChild(name);
            row.appendChild(tier);
            row.appendChild(elo);

            row.style.cursor = "pointer";

            row.addEventListener(
                "click",
                () => {

                    document
                        .getElementById("username")
                        .value =
                        player.username || "";

                    document
                        .getElementById("elo")
                        .value =
                        player.elo || 0;

                    document
                        .getElementById("tier")
                        .value =
                        player.tier || "UNRANKED";

                    window.scrollTo({
                        top: 0,
                        behavior: "smooth"
                    });

                }
            );

            list.appendChild(row);

            rank++;

        });

    } catch (error) {

        console.error(
            "Load players error:",
            error
        );

        list.innerHTML =
            "Could not load players.";

    }
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

    if (!error) {
        return "Unknown error.";
    }

    switch (error.code) {

        case "auth/invalid-credential":
            return "Invalid email or password.";

        case "auth/user-not-found":
            return "No account exists with this email.";

        case "auth/wrong-password":
            return "Incorrect password.";

        case "auth/invalid-email":
            return "Invalid email address.";

        case "auth/too-many-requests":
            return "Too many attempts. Try again later.";

        case "permission-denied":
            return "Firebase permission denied.";

        default:
            return error.message || "Something went wrong.";
    }
}
