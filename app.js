let currentMode = "sword";
let allPlayers = [];

const leaderboardList =
    document.getElementById("leaderboardList");

const searchInput =
    document.getElementById("searchInput");


/* =========================
LOAD PLAYERS
========================= */

async function loadPlayers() {

    leaderboardList.innerHTML =
        '<div class="loading">Loading players...</div>';

    try {

        const snapshot =
            await db
                .collection("players")
                .get();

        allPlayers = [];

        snapshot.forEach((doc) => {

            const data = doc.data();

            allPlayers.push({
                id: doc.id,
                ...data
            });

        });

        renderLeaderboard();

    } catch (error) {

        console.error(error);

        leaderboardList.innerHTML =
            '<div class="empty">Could not load leaderboard.</div>';
    }
}


/* =========================
GET PLAYER STATS
========================= */

function getPlayerStats(player) {

    /*
        Ako Firebase ima:

        sword: {
            elo: 1200,
            tier: "LT4"
        }

        koristi podatke za izabrani gamemode.
    */

    if (
        player[currentMode] &&
        typeof player[currentMode] === "object"
    ) {

        return {

            elo:
                Number(player[currentMode].elo) || 0,

            tier:
                player[currentMode].tier || "UNRANKED"

        };

    }


    /*
        Ako player još nema gamemode podatke,
        koristimo stare elo/tier vrednosti
        koje admin trenutno upisuje.
    */

    return {

        elo:
            Number(player.elo) || 0,

        tier:
            player.tier || "UNRANKED"

    };
}


/* =========================
RENDER LEADERBOARD
========================= */

function renderLeaderboard() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    let players =
        allPlayers
            .filter(player => {

                const username =
                    player.username || "";

                return username
                    .toLowerCase()
                    .includes(search);

            })
            .map(player => {

                const stats =
                    getPlayerStats(player);

                return {

                    ...player,

                    elo: stats.elo,

                    tier: stats.tier

                };

            });


    /*
        Najveći ELO ide prvi.
    */

    players.sort(
        (a, b) => b.elo - a.elo
    );


    leaderboardList.innerHTML = "";


    if (players.length === 0) {

        leaderboardList.innerHTML =
            '<div class="empty">No players found.</div>';

        return;
    }


    players.forEach((player, index) => {

        const row =
            document.createElement("div");

        row.className =
            "player-row";


        /* =========================
        RANK
        ========================= */

        const rank =
            document.createElement("div");

        rank.className =
            "rank";

        rank.textContent =
            "#" + (index + 1);


        /* =========================
        PLAYER NAME
        ========================= */

        const name =
            document.createElement("div");

        name.className =
            "player-name";


        const avatar =
            document.createElement("div");

        avatar.className =
            "player-avatar";

        avatar.textContent =
            (player.username || "?")
                .charAt(0)
                .toUpperCase();


        const username =
            document.createElement("span");

        username.textContent =
            player.username || "Unknown";


        name.appendChild(avatar);
        name.appendChild(username);


        /* =========================
        TIER
        ========================= */

        const tier =
            document.createElement("div");

        tier.className =
            "player-tier " +
            getTierClass(player.tier);

        tier.textContent =
            player.tier;


        /* =========================
        ELO
        ========================= */

        const elo =
            document.createElement("div");

        elo.className =
            "player-elo";

        elo.textContent =
            player.elo + " ELO";


        /* =========================
        ADD TO ROW
        ========================= */

        row.appendChild(rank);
        row.appendChild(name);
        row.appendChild(tier);
        row.appendChild(elo);


        /* =========================
        CLICK PLAYER
        ========================= */

        row.addEventListener(
            "click",
            () => {

                window.location.href =
                    "player.html?player=" +
                    encodeURIComponent(
                        player.id
                    );

            }
        );


        leaderboardList.appendChild(row);

    });
}


/* =========================
TIER CLASS
========================= */

function getTierClass(tier) {

    if (!tier) {

        return "tier-unranked";

    }

    return (
        "tier-" +
        tier
            .toLowerCase()
            .replace(/\s+/g, "-")
    );
}


/* =========================
GAME MODE BUTTONS
========================= */

document
    .querySelectorAll(".mode")
    .forEach(button => {

        button.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".mode")
                    .forEach(btn => {

                        btn.classList.remove(
                            "active"
                        );

                    });


                button.classList.add(
                    "active"
                );


                currentMode =
                    button.dataset.mode;


                renderLeaderboard();

            }
        );

    });


/* =========================
SEARCH
========================= */

searchInput.addEventListener(
    "input",
    renderLeaderboard
);


/* =========================
START
========================= */

loadPlayers();
