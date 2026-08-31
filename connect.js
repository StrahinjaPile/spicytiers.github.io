const generateButton =
    document.getElementById("generateCode");

const connectState =
    document.getElementById("connectState");


let unsubscribe = null;


generateButton.addEventListener("click", async () => {

    generateButton.disabled = true;

    generateButton.textContent =
        "Generating...";


    try {

        const user =
            await getCurrentUser();


        const code =
            generateCode();


        const expires =
            Date.now() + (10 * 60 * 1000);


        await db
            .collection("linkCodes")
            .doc(code)
            .set({

                code: code,

                userId: user.uid,

                status: "waiting",

                createdAt:
                    firebase.firestore.FieldValue.serverTimestamp(),

                expiresAt: expires

            });


        connectState.innerHTML = `

            <div class="verification-code">

                <div class="code-label">
                    YOUR VERIFICATION CODE
                </div>

                <div class="code">
                    ${code}
                </div>

                <div class="code-status">
                    Waiting for SpicyTiers Client...
                </div>

                <div class="code-expiry">
                    Expires in 10 minutes
                </div>

            </div>

        `;


        listenForConnection(code);


    } catch (error) {

        console.error(error);

        connectState.innerHTML = `

            <div class="message error">
                Could not create connection code.
            </div>

            <button
                class="primary-button"
                onclick="location.reload()"
            >
                Try Again
            </button>

        `;

    }

});


function generateCode() {

    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let result = "";

    for (let i = 0; i < 8; i++) {

        if (i === 4) {
            result += "-";
        }

        result +=
            chars.charAt(
                Math.floor(
                    Math.random() * chars.length
                )
            );

    }

    return result;
}


async function getCurrentUser() {

    return new Promise((resolve, reject) => {

        auth.onAuthStateChanged(user => {

            if (user) {

                resolve(user);

            } else {

                auth.signInAnonymously()
                    .then(result => {

                        resolve(result.user);

                    })
                    .catch(reject);

            }

        });

    });

}


function listenForConnection(code) {

    if (unsubscribe) {
        unsubscribe();
    }


    unsubscribe =
        db
            .collection("linkCodes")
            .doc(code)
            .onSnapshot(async snapshot => {

                if (!snapshot.exists) {
                    return;
                }


                const data =
                    snapshot.data();


                if (data.status !== "connected") {
                    return;
                }


                if (!data.playerId) {
                    return;
                }


                await db
                    .collection("accounts")
                    .doc(data.userId)
                    .set({

                        playerId: data.playerId,

                        username:
                            data.username,

                        uuid:
                            data.uuid,

                        connectedAt:
                            firebase.firestore.FieldValue.serverTimestamp()

                    });


                connectState.innerHTML = `

                    <div class="connected-box">

                        <div class="connected-check">
                            ✓
                        </div>

                        <div class="section-label">
                            CONNECTED
                        </div>

                        <h2>
                            ${escapeHtml(data.username)}
                        </h2>

                        <p>
                            Your Minecraft account is now
                            connected to SpicyTiers.
                        </p>

                        <a
                            href="player.html?player=${encodeURIComponent(data.playerId)}"
                            class="primary-button"
                        >
                            View My Profile
                        </a>

                    </div>

                `;


                if (unsubscribe) {
                    unsubscribe();
                }

            });

}


function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}
