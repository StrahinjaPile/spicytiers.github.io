const params =
    new URLSearchParams(
        window.location.search
    );

const playerId =
    params.get("player");


const profileHeader =
    document.getElementById(
        "profileHeader"
    );


const statsGrid =
    document.getElementById(
        "statsGrid"
    );


const gameModes = [

    {
        id: "sword",
        name: "SWORD",
        icon: "⚔"
    },

    {
        id: "axe",
        name: "AXE",
        icon: "🪓"
    },

    {
        id: "vanilla",
        name: "VANILLA",
        icon: "◆"
    },

    {
        id: "uhc",
        name: "UHC",
        icon: "💥"
    },

    {
        id: "smp",
        name: "SMP",
        icon: "◆"
    },

    {
        id: "netheriteop",
        name: "NETHERITE OP",
        icon: "◆"
    },

    {
        id: "pot",
        name: "POT",
        icon: "🧪"
    },

    {
        id: "mace",
        name: "MACE",
        icon: "🔨"
    }

];


async function loadPlayer() {

    if (!playerId) {

        profileHeader.innerHTML =
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

            profileHeader.innerHTML =
                '<div class="empty">Player not found.</div>';

            return;
        }


        const player =
            doc.data();


        document.title =
            player.username +
            " — SpicyTiers";


        profileHeader.innerHTML = `

            <div class="profile-user">

                <div class="profile-avatar">
                    ${escapeHtml(
                        (player.username || "?")
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <div>

                    <h1>
                        ${escapeHtml(
                            player.username ||
                            "Unknown"
                        )}
                    </h1>

                    <p>
                        SpicyTiers PvP Profile
                    </p>

                </div>

            </div>

        `;


        statsGrid.innerHTML = "";


        gameModes.forEach(mode => {

            const stats =
                player[mode.id] || {};


            const tier =
                stats.tier ||
                "UNRANKED";


            const elo =
                Number(stats.elo) ||
                0;


            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "mode-card";


            card.innerHTML = `

                <div class="mode-name">
                    ${mode.icon}
                    &nbsp;
                    ${mode.name}
                </div>

                <div class="
                    mode-tier
                    ${getTierClass(tier)}
                ">
                    ${escapeHtml(tier)}
                </div>

                <div class="mode-elo">
                    ${elo} ELO
                </div>

            `;


            statsGrid.appendChild(card);

        });


    } catch (error) {

        console.error(error);

        profileHeader.innerHTML =
            '<div class="empty">Could not load player.</div>';

    }

}


/* =========================
TIER CLASS
========================= */

function getTierClass(tier) {

    return (
        "tier-" +
        String(tier)
            .toLowerCase()
            .replace(" ", "-")
    );

}


/* =========================
HTML SAFETY
========================= */

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;

}


loadPlayer();
