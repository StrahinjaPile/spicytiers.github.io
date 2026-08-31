const params =
    new URLSearchParams(window.location.search);

const playerId =
    params.get("player");

const profile =
    document.getElementById("profile");


const modes = [
    ["sword", "Sword"],
    ["axe", "Axe"],
    ["vanilla", "Vanilla"],
    ["uhc", "UHC"],
    ["smp", "SMP"],
    ["netheriteop", "Netherite OP"],
    ["pot", "Pot"],
    ["mace", "Mace"]
];


async function loadPlayer() {

    if (!playerId) {

        profile.innerHTML =
            '<div class="empty">Player not found.</div>';

        return;
    }


    try {

        const doc =
            await db
                .collection("players")
                .doc(playerId)
                .get();


        if (!doc.exists) {

            profile.innerHTML =
                '<div class="empty">Player not found.</div>';

            return;
        }


        const player =
            doc.data();


        const uuid =
            player.uuid || "";


        let cards = "";


        modes.forEach(([key, name]) => {

            const stats =
                player[key] || {};


            const elo =
                Number(stats.elo) || 0;


            const tier =
                stats.tier || "UNRANKED";


            cards += `

                <div class="mode-card">

                    <div class="mode-name">
                        ${name}
                    </div>

                    <div class="mode-tier ${getTierClass(tier)}">
                        ${tier}
                    </div>

                    <div class="mode-elo">
                        ${elo.toLocaleString()} ELO
                    </div>

                </div>

            `;

        });


        profile.innerHTML = `

            <div class="profile-header">

                <div class="profile-user">

                    <img
                        class="profile-avatar-image"
                        src="${
                            uuid
                            ? "https://mc-heads.net/avatar/" + uuid + "/160"
                            : "https://mc-heads.net/avatar/" +
                              encodeURIComponent(player.username) +
                              "/160"
                        }"
                    >

                    <div>

                        <div class="profile-label">
                            MINECRAFT PLAYER
                        </div>

                        <h1>
                            ${escapeHtml(player.username)}
                        </h1>

                        <p>
                            SpicyTiers Competitive Profile
                        </p>

                    </div>

                </div>

            </div>


            <div class="stats-header">

                <div>
                    <div class="section-label">
                        PLAYER STATS
                    </div>

                    <h2>
                        Game Modes
                    </h2>
                </div>

            </div>


            <div class="stats-grid">

                ${cards}

            </div>

        `;


        document.title =
            player.username +
            " — SpicyTiers";


    } catch (error) {

        console.error(error);

        profile.innerHTML =
            '<div class="empty">Could not load player.</div>';

    }

}


loadPlayer();
