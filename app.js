let currentMode = "sword";
let allPlayers = [];

const leaderboardList =
    document.getElementById("leaderboardList");

const searchInput =
    document.getElementById("searchInput");


/* =========================================================
   LOAD PLAYERS
========================================================= */

async function loadPlayers() {

    if (!leaderboardList) return;

    leaderboardList.innerHTML =
        '<div class="loading">Loading players...</div>';

    try {

        const snapshot =
            await db
                .collection("players")
                .get();

        allPlayers = [];

        snapshot.forEach((doc) => {

            allPlayers.push({
                id: doc.id,
                ...doc.data()
            });

        });

        renderLeaderboard();

    } catch (error) {

        console.error("Leaderboard error:", error);

        leaderboardList.innerHTML =
            '<div class="empty">Could not load leaderboard.</div>';
    }
}


/* =========================================================
   RENDER LEADERBOARD
========================================================= */

function renderLeaderboard() {

    if (!leaderboardList) return;

    const search =
        searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

    let players = allPlayers
        .filter(player => {

            const username =
                player.username || "";

            return username
                .toLowerCase()
                .includes(search);

        })
        .map(player => {

            const stats =
                player[currentMode] || {};

            return {
                ...player,

                elo:
                    Number(stats.elo) || 0,

                tier:
                    stats.tier || "UNRANKED"
            };

        });

    players.sort((a, b) => b.elo - a.elo);

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


        /* RANK */

        const rank =
            document.createElement("div");

        rank.className =
            "rank";

        rank.textContent =
            "#" + (index + 1);


        /* PLAYER */

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


        /* TIER */

        const tier =
            document.createElement("div");

        tier.className =
            "player-tier " +
            getTierClass(player.tier);

        tier.textContent =
            player.tier;


        /* ELO */

        const elo =
            document.createElement("div");

        elo.className =
            "player-elo";

        elo.textContent =
            player.elo + " ELO";


        row.appendChild(rank);
        row.appendChild(name);
        row.appendChild(tier);
        row.appendChild(elo);


        /* PLAYER PROFILE */

        row.addEventListener("click", () => {

            window.location.href =
                "player.html?player=" +
                encodeURIComponent(player.id);

        });


        leaderboardList.appendChild(row);

    });
}


/* =========================================================
   TIER CLASS
========================================================= */

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


/* =========================================================
   GAME MODE BUTTONS
========================================================= */

const modeButtons =
    document.querySelectorAll(".mode");

modeButtons.forEach(button => {

    button.addEventListener("click", () => {

        const selectedMode =
            button.dataset.mode;

        if (!selectedMode) return;

        currentMode =
            selectedMode;


        modeButtons.forEach(btn => {

            btn.classList.remove("active");

        });


        button.classList.add("active");


        renderLeaderboard();

    });

});


/* =========================================================
   SEARCH
========================================================= */

if (searchInput) {

    searchInput.addEventListener(
        "input",
        () => {

            renderLeaderboard();

        }
    );

}


/* =========================================================
   START
========================================================= */

loadPlayers();
