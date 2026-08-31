const googleLogin =
    document.getElementById("googleLogin");

const loginMessage =
    document.getElementById("loginMessage");


const provider =
    new firebase.auth.GoogleAuthProvider();


googleLogin.addEventListener("click", async () => {

    googleLogin.disabled = true;

    googleLogin.textContent =
        "Signing in...";


    try {

        const result =
            await auth.signInWithPopup(provider);


        const user =
            result.user;


        await db
            .collection("users")
            .doc(user.uid)
            .set({

                uid: user.uid,

                email:
                    user.email || "",

                displayName:
                    user.displayName || "",

                photoURL:
                    user.photoURL || "",

                updatedAt:
                    firebase.firestore
                        .FieldValue
                        .serverTimestamp()

            }, {

                merge: true

            });


        window.location.href =
            "account.html";


    } catch (error) {

        console.error(error);

        loginMessage.textContent =
            error.message;

        loginMessage.className =
            "message error";

        googleLogin.disabled = false;

        googleLogin.textContent =
            "Continue with Google";

    }

});
