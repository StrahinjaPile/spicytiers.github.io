let currentMode = "sword";

let allPlayers = [];

const leaderboardList =
    document.getElementById("leaderboardList");

const searchInput =
    document.getElementById("searchInput");

const modeButton =
    document.getElementById("modeButton");

const modeSelector =
    document.querySelector(".mode-selector");

const selectedMode =
    document.getElementById("selectedMode");

const selectedModeIcon =
    document.getElementById("selectedModeIcon");

const currentModeText =
    document.getElementById("currentModeText");


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
                    player[currentMode] || {};

                return {

                    ...player,

                    elo:
                        Number(stats.elo) || 0,

                    tier:
                        stats.tier || "UNRANKED"

                };

            });


    players.sort(
        (a, b) =>
            b.elo - a.elo
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


        /* CLICK PLAYER */

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
            .replace(" ", "-")
    );
}


/* =========================
OPEN / CLOSE MODE MENU
========================= */

modeButton.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        modeSelector.classList.toggle(
            "open"
        );

    }
);


/* =========================
MODE OPTIONS
========================= */

document
    .querySelectorAll(".mode-option")
    .forEach(option => {

        option.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".mode-option")
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                option.classList.add(
                    "active"
                );


                currentMode =
                    option.dataset.mode;


                selectedMode.textContent =
                    option.dataset.name;


                selectedModeIcon.textContent =
                    option.dataset.icon;


                currentModeText.textContent =
                    option.dataset.icon +
                    " " +
                    option.dataset.name +
                    " Rankings";


                modeSelector.classList.remove(
                    "open"
                );


                renderLeaderboard();

            }
        );

    });


/* =========================
CLICK OUTSIDE
========================= */

document.addEventListener(
    "click",
    () => {

        modeSelector.classList.remove(
            "open"
        );

    }
);


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
