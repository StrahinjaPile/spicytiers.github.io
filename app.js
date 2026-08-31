const modes = {

    sword: {
        name: "⚔ Sword",
        short: "SWORD"
    },

    axe: {
        name: "🪓 Axe",
        short: "AXE"
    },

    vanilla: {
        name: "🟫 Vanilla",
        short: "VANILLA"
    },

    uhc: {
        name: "❤️ UHC",
        short: "UHC"
    },

    smp: {
        name: "🌍 SMP",
        short: "SMP"
    },

    netheriteop: {
        name: "💎 Netherite OP",
        short: "NETHERITE OP"
    },

    pot: {
        name: "🧪 Pot",
        short: "POT"
    },

    mace: {
        name: "🔨 Mace",
        short: "MACE"
    }

};


let players = [];
let selectedMode = "sword";


const modeSelect =
    document.getElementById("modeSelect");

const leaderboardRows =
    document.getElementById("leaderboardRows");

const playerCount =
    document.getElementById("playerCount");

const topElo =
    document.getElementById("topElo");

const modeTitle =
    document.getElementById("modeTitle");

const statMode =
    document.getElementById("statMode");


/* =========================
   LOAD PLAYERS
========================= */

async function loadPlayers() {

    leaderboardRows.innerHTML = `
        <div class="loading">
            Loading leaderboard...
        </div>
    `;

    try {

        const snapshot = await db
            .collection("players")
            .get();

        players = [];

        snapshot.forEach(doc => {

            const data = doc.data();

            players.push({
                id: doc.id,
                ...data
            });

        });

        renderLeaderboard();

    } catch (error) {

        console.error(
            "Leaderboard error:",
            error
        );

        leaderboardRows.innerHTML = `
            <div class="loading error">
                Could not load leaderboard.
            </div>
        `;

    }

}


/* =========================
   RENDER LEADERBOARD
========================= */

function renderLeaderboard() {

    const sorted = players
        .filter(player => {

            return player.modes &&
                   player.modes[selectedMode];

        })
        .sort((a, b) => {

            const eloA =
                Number(
                    a.modes[selectedMode].elo || 0
                );

            const eloB =
                Number(
                    b.modes[selectedMode].elo || 0
                );

            return eloB - eloA;

        });


    playerCount.textContent =
        sorted.length;


    topElo.textContent =
        sorted.length > 0
            ? Number(
                sorted[0]
                    .modes[selectedMode]
                    .elo || 0
              ).toLocaleString()
            : "0";


    modeTitle.textContent =
        modes[selectedMode].name;


    statMode.textContent =
        modes[selectedMode].short;


    if (sorted.length === 0) {

        leaderboardRows.innerHTML = `
            <div class="empty">
                No players have been ranked in this gamemode yet.
            </div>
        `;

        return;
    }


    leaderboardRows.innerHTML = "";


    sorted.forEach((player, index) => {

        const mode =
            player.modes[selectedMode];

        const elo =
            Number(mode.elo || 0);

        const tier =
            mode.tier || "UNRANKED";


        const row =
            document.createElement("div");

        row.className =
            "leaderboard-row";


        if (index === 0)
            row.classList.add("first");

        if (index === 1)
            row.classList.add("second");

        if (index === 2)
            row.classList.add("third");


        row.innerHTML = `

            <div class="rank">
                ${getRank(index)}
            </div>

            <div class="player">

                <div class="player-avatar">
                    ${escapeHTML(
                        (player.username || "?")
                            .charAt(0)
                            .toUpperCase()
                    )}
                </div>

                <div>

                    <strong>
                        ${escapeHTML(
                            player.username || "Unknown"
                        )}
                    </strong>

                    <small>
                        SpicyTiers Player
                    </small>

                </div>

            </div>

            <div class="tier">
                ${escapeHTML(tier)}
            </div>

            <div class="elo">
                ${elo.toLocaleString()}
            </div>

        `;


        row.addEventListener(
            "click",
            () => {

                openPlayer(
                    player
                );

            }
        );


        leaderboardRows.appendChild(row);

    });

}


/* =========================
   RANK
========================= */

function getRank(index) {

    if (index === 0)
        return "🥇";

    if (index === 1)
        return "🥈";

    if (index === 2)
        return "🥉";

    return "#" + (index + 1);

}


/* =========================
   MODE CHANGE
========================= */

modeSelect.addEventListener(
    "change",
    () => {

        selectedMode =
            modeSelect.value;

        renderLeaderboard();

    }
);


/* =========================
   PLAYER MODAL
========================= */

const playerModal =
    document.getElementById("playerModal");

const modalBackground =
    document.getElementById("modalBackground");

const modalClose =
    document.getElementById("modalClose");


function openPlayer(player) {

    const mode =
        player.modes &&
        player.modes[selectedMode]
            ? player.modes[selectedMode]
            : {
                elo: 0,
                tier: "UNRANKED"
            };


    document.getElementById(
        "modalPlayerName"
    ).textContent =
        player.username || "Unknown";


    document.getElementById(
        "modalPlayerSubtitle"
    ).textContent =
        "SpicyTiers Player";


    document.getElementById(
        "modalModeName"
    ).textContent =
        modes[selectedMode].name;


    document.getElementById(
        "modalTier"
    ).textContent =
        mode.tier || "UNRANKED";


    document.getElementById(
        "modalElo"
    ).textContent =
        Number(
            mode.elo || 0
        ).toLocaleString();


    renderAllModes(player);


    playerModal.classList.add("open");

    document.body.classList.add(
        "modal-open"
    );

}


function closePlayer() {

    playerModal.classList.remove(
        "open"
    );

    document.body.classList.remove(
        "modal-open"
    );

}


modalClose.addEventListener(
    "click",
    closePlayer
);


modalBackground.addEventListener(
    "click",
    closePlayer
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            playerModal.classList.contains("open")
        ) {

            closePlayer();

        }

    }
);


/* =========================
   ALL MODES IN MODAL
========================= */

function renderAllModes(player) {

    const container =
        document.getElementById(
            "modalModes"
        );

    container.innerHTML = "";


    Object.entries(modes)
        .forEach(([key, info]) => {

            const mode =
                player.modes &&
                player.modes[key]
                    ? player.modes[key]
                    : {
                        elo: 0,
                        tier: "UNRANKED"
                    };


            const card =
                document.createElement("div");

            card.className =
                "mode-row";


            card.innerHTML = `

                <div class="mode-row-name">
                    ${info.name}
                </div>

                <div class="mode-row-tier">
                    ${escapeHTML(
                        mode.tier || "UNRANKED"
                    )}
                </div>

                <div class="mode-row-elo">
                    ${Number(
                        mode.elo || 0
                    ).toLocaleString()} ELO
                </div>

            `;


            card.addEventListener(
                "click",
                () => {

                    selectedMode = key;

                    modeSelect.value = key;

                    renderLeaderboard();

                    openPlayer(player);

                }
            );


            container.appendChild(card);

        });

}


/* =========================
   SECURITY
========================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================
   START
========================= */

loadPlayers();
