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

let currentUser = null;
let isAdmin = false;

/* ================= AUTH STATE ================= */

auth.onAuthStateChanged(async user => {

```
hideEverything();


currentUser = user;


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

    }

    else {

        isAdmin = false;


        deniedPanel.style.display =
            "block";

    }

}

catch (error) {

    console.error(error);


    showLoginMessage(
        "Error checking account.",
        false
    );

}
```

});

function hideEverything() {

```
loginPanel.style.display =
    "none";

deniedPanel.style.display =
    "none";

adminPanel.style.display =
    "none";
```

}

/* ================= LOGIN ================= */

loginButton.addEventListener(
"click",
async () => {

```
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
            "Enter email and password.",
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
            "Logged in!",
            true
        );

    }

    catch (error) {

        console.error(error);


        showLoginMessage(
            error.message,
            false
        );

    }

}
```

);

/* ================= LOGOUT ================= */

logoutButton.addEventListener(
"click",
async () => {

```
    await auth.signOut();

}
```

);

logoutDenied.addEventListener(
"click",
async () => {

```
    await auth.signOut();

}
```

);

/* ================= SAVE PLAYER ================= */

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


    const tier =
        document
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


    try {

        await db
            .collection("players")
            .doc(
                username.toLowerCase()
            )
            .set({

                username: username,

                elo: elo,

                tier: tier,

                updatedAt:
                    firebase.firestore.FieldValue
                        .serverTimestamp()

            });


        showAdminMessage(
            username + " saved!",
            true
        );


        loadAdminPlayers();

    }

    catch (error) {

        console.error(error);


        showAdminMessage(
            error.message,
            false
        );

    }

}
```

);

/* ================= DELETE PLAYER ================= */

deletePlayerButton.addEventListener(
"click",
async () => {

```
    if (!isAdmin) return;


    const username =
        document
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


    const confirmed =
        confirm(
            "Delete " +
            username +
            "?"
        );


    if (!confirmed) return;


    try {

        await db
            .collection("players")
            .doc(
                username.toLowerCase()
            )
            .delete();


        showAdminMessage(
            username + " deleted!",
            true
        );


        document
            .getElementById("username")
            .value = "";


        document
            .getElementById("elo")
            .value = "";


        loadAdminPlayers();

    }

    catch (error) {

        console.error(error);


        showAdminMessage(
            error.message,
            false
        );

    }

}
```

);

/* ================= LOAD PLAYERS ================= */

async function loadAdminPlayers() {

```
const list =
    document.getElementById(
        "adminPlayerList"
    );


try {

    const snapshot =
        await db
            .collection("players")
            .orderBy("elo", "desc")
            .get();


    list.innerHTML = "";


    snapshot.forEach(doc => {

        const player =
            doc.data();


        const row =
            document.createElement("div");


        row.className =
            "admin-player";


        const name =
            document.createElement("div");

        name.textContent =
            player.username;


        const tier =
            document.createElement("div");

        tier.textContent =
            player.tier;


        const elo =
            document.createElement("div");

        elo.textContent =
            player.elo + " ELO";


        row.appendChild(name);

        row.appendChild(tier);

        row.appendChild(elo);


        row.style.cursor =
            "pointer";


        row.addEventListener(
            "click",
            () => {

                document
                    .getElementById("username")
                    .value =
                    player.username;


                document
                    .getElementById("elo")
                    .value =
                    player.elo;


                document
                    .getElementById("tier")
                    .value =
                    player.tier;


                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }
        );


        list.appendChild(row);

    });


    if (snapshot.empty) {

        list.innerHTML =
            "No players yet.";

    }

}

catch (error) {

    console.error(error);


    list.innerHTML =
        "Could not load players.";

}
```

}

/* ================= MESSAGES ================= */

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
