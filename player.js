const API_URL =
    "https://spicytiersapi.strahinjapile2013.workers.dev";


const params =
    new URLSearchParams(
        window.location.search
    );


const uuid =
    params.get(
        "uuid"
    );


const profileContent =
    document.getElementById(
        "profileContent"
    );


async function loadPlayer() {


    if (!uuid) {

        profileContent.innerHTML =
            `
            <div class="empty">
                Player not found.
            </div>
            `;

        return;

    }


    try {


        const response =
            await fetch(

                API_URL +

                "/player/" +

                encodeURIComponent(
                    uuid
                )

            );


        const data =
            await response.json();


        if (
            !data.success
        ) {

            throw new Error(
                data.error
            );

        }


        renderPlayer(
            data.player
        );


    } catch (error) {


        profileContent.innerHTML =
            `
            <div class="empty">

                Could not load player.

            </div>
            `;


        console.error(error);

    }

}


function renderPlayer(
    player
) {


    let statsHTML =
        "";


    Object.entries(
        player.stats
    ).forEach(

        (
            [
                mode,
                stats
            ]
        ) => {


            statsHTML +=
                `

                <div class="mode-card">

                    <div class="mode-name">

                        ${mode.toUpperCase()}

                    </div>


                    <div
                    class="mode-tier ${getTierClass(
                        stats.tier
                    )}">

                        ${stats.tier}

                    </div>


                    <div
                    class="mode-elo">

                        ${stats.elo} ELO

                    </div>


                    <div
                    class="mode-elo">

                        ${stats.wins}W

                        /

                        ${stats.losses}L

                    </div>

                </div>

                `;

        }

    );


    profileContent.innerHTML =
        `

        <section
        class="profile-header">


            <div
            class="profile-user">


                <img

                class="profile-avatar"

                src="https://mc-heads.net/avatar/${encodeURIComponent(
                    player.username
                )}/160"


                alt="${player.username}">


                <div>


                    <h1>

                        ${player.username}

                    </h1>


                    <p>

                        SpicyTiers Player

                    </p>


                </div>


            </div>


        </section>


        <div
        class="stats-grid">

            ${statsHTML}

        </div>

        `;

}


function getTierClass(
    tier
) {

    return (

        "tier-" +

        tier
            .toLowerCase()

    );

}


loadPlayer();
