let currentUser = null;


const displayName =
    document.getElementById("displayName");

const email =
    document.getElementById("email");

const profileImage =
    document.getElementById("profileImage");

const minecraftName =
    document.getElementById("minecraftName");

const minecraftStatus =
    document.getElementById("minecraftStatus");

const verificationBox =
    document.getElementById("verificationBox");

const verificationCode =
    document.getElementById("verificationCode");

const connectMinecraft =
    document.getElementById("connectMinecraft");

const logoutButton =
    document.getElementById("logoutButton");


/* =========================
AUTH
========================= */

auth.onAuthStateChanged(async user => {

    if (!user) {

        window.location.href =
            "login.html";

        return;

    }


    currentUser = user;


    displayName.textContent =
        user.displayName || "SpicyTiers User";

    email.textContent =
        user.email || "";


    if (user.photoURL) {

        profileImage.src =
            user.photoURL;

    }


    await loadAccount();

});


/* =========================
LOAD ACCOUNT
========================= */

async function loadAccount() {

    try {

        const doc =
            await db
                .collection("users")
                .doc(currentUser.uid)
                .get();


        if (!doc.exists) {

            return;

        }


        const data =
            doc.data();


        if (data.minecraft) {

            minecraftName.textContent =
                data.minecraft.username;

            minecraftStatus.textContent =
                "✓ Minecraft account connected";

            connectMinecraft.style.display =
                "none";

            verificationBox.style.display =
                "none";

        }

    } catch (error) {

        console.error(error);

    }

}


/* =========================
CONNECT MINECRAFT
========================= */

connectMinecraft.addEventListener(
    "click",
    async () => {

        connectMinecraft.disabled =
            true;

        connectMinecraft.textContent =
            "GENERATING CODE...";


        try {

            const code =
                generateCode();


            await db
                .collection("minecraftVerifications")
                .doc(code)
                .set({

                    uid:
                        currentUser.uid,

                    code:
                        code,

                    createdAt:
                        firebase.firestore
                            .FieldValue
                            .serverTimestamp(),

                    used:
                        false

                });


            verificationCode.textContent =
                code;


            verificationBox.style.display =
                "block";


            connectMinecraft.style.display =
                "none";


        } catch (error) {

            console.error(error);

            connectMinecraft.disabled =
                false;

            connectMinecraft.textContent =
                "CONNECT MINECRAFT";

        }

    }
);


/* =========================
GENERATE CODE
========================= */

function generateCode() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let result =
        "SPICY-";


    for (let i = 0; i < 5; i++) {

        result +=
            chars.charAt(
                Math.floor(
                    Math.random() *
                    chars.length
                )
            );

    }


    return result;

}


/* =========================
LOGOUT
========================= */

logoutButton.addEventListener(
    "click",
    async () => {

        await auth.signOut();

        window.location.href =
            "index.html";

    }
);
