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

/* =========================================
HIDE ALL PANELS
========================================= */

function hideEverything() {

```
loginPanel.style.display = "none";
deniedPanel.style.display = "none";
adminPanel.style.display = "none";
```

}

/* =========================================
FIREBASE AUTH STATE
========================================= */

auth.onAuthStateChanged(async (user) => {

```
hideEverything();

currentUser = user;
isAdmin = false;


/* NOT LOGGED IN */

if (!user) {

    loginPanel.style.display = "block";

    return;
}


/* CHECK ADMIN */

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

        await loadAdminPlayers();

    } else {

        isAdmin = false;

        deniedPanel.style.display = "block";

    }

} catch (error) {

    console.error(
        "Admin check error:",
        error
    );

    loginPanel.style.display = "block";

    showLoginMessage(
        "Could not check admin permissions.",
        false
    );

}
```

});

/* =========================================
LOGIN
========================================= */

loginButton.addEventListener(
"click",
async () => {

```
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


    try {

        await auth
            .signInWithEmailAndPassword(
                email,
                password
            );


        showLoginMessage(
            "Logged in successfully!",
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
```

);

/* =========================================
LOGOUT
========================================= */

logoutButton.addEventListener(
"click",
async () => {

```
    try {

        await auth.signOut();

    } catch (error) {

        console.error(error);

    }

}
```

);

logoutDenied.addEventListener(
"click",
async () => {

```
    try {

        await auth.signOut();

    } catch (error) {

        console.error(error);

    }

}
```

);

/* =========================================
SAVE / UPDATE PLAYER
========================================= */

savePlayerButton.addEventListener(
"click",
async () => {

```
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


    const eloInput = document
        .getElementById("elo")
        .value
        .trim();


    const elo = Number(eloInput);


    const tier = document
        .getElementById("tier")
        .value;


    /* VALIDATION */

    if (!username) {

        showAdminMessage(
            "Enter a Minecraft username.",
            false
        );

        return;
    }


    if (
        eloInput === "" ||
        !Number.isFinite(elo) ||
        elo < 0
    ) {

        showAdminMessage(
            "Enter a valid ELO.",
            false
        );

        return;
    }


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
            username +
            " saved successfully!",
            true
        );


        await loadAdminPlayers();

    } catch (error) {

        console.error(
            "Save player error:",
            error
        );


        showAdminMessage(
            error.message,
            false
        );

    }

}
```

);

/* =========================================
DELETE PLAYER
========================================= */

deletePlayerButton.addEventListener(
"click",
async () => {

```
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
            "Enter the username to delete.",
            false
        );

        return;
    }


    const confirmed = confirm(
        "Are you sure you want to delete " +
        username +
        "?"
    );


    if (!confirmed) {
        return;
    }


    try {

        await db
            .collection("players")
            .doc(username.toLowerCase())
            .delete();


        showAdminMessage(
            username +
            " deleted successfully!",
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
            error.message,
            false
        );

    }

}
```

);

/* =========================================
LOAD PLAYERS
========================================= */

async function loadAdminPlayers() {

```
const list =
    document.getElementById(
        "adminPlayerList"
    );


list.innerHTML = "Loading...";


try {

    const snapshot = await db
        .collection("players")
        .orderBy("elo", "desc")
        .get();


    list.innerHTML = "";


    if (snapshot.empty) {

        list.innerHTML =
            "No players yet.";

        return;
    }


    snapshot.forEach((doc) => {

        const player = doc.data();


        const row =
            document.createElement("div");


        row.className =
            "admin-player";


        /* PLAYER NAME */

        const name =
            document.createElement("div");

        name.textContent =
            player.username ||
            "Unknown";


        /* TIER */

        const tier =
            document.createElement("div");

        tier.textContent =
            player.tier ||
            "UNRANKED";


        /* ELO */

        const elo =
            document.createElement("div");

        elo.textContent =
            (player.elo || 0) +
            " ELO";


        row.appendChild(name);
        row.appendChild(tier);
        row.appendChild(elo);


        row.style.cursor =
            "pointer";


        /* CLICK PLAYER */

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

            }
        );


        list.appendChild(row);

    });

} catch (error) {

    console.error(
        "Load players error:",
        error
    );


    list.innerHTML =
        "Could not load players.";

}
```

}

/* =========================================
LOGIN MESSAGE
========================================= */

function showLoginMessage(
message,
success
) {

```
loginMessage.textContent =
    message;


loginMessage.className =
    success
        ? "message success"
        : "message error";
```

}

/* =========================================
ADMIN MESSAGE
========================================= */

function showAdminMessage(
message,
success
) {

```
adminMessage.textContent =
    message;


adminMessage.className =
    success
        ? "message success"
        : "message error";
```

}
