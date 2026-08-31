let currentMode = "sword";

let allPlayers = [];


const leaderboardList =
    document.getElementById("leaderboardList");

const searchInput =
    document.getElementById("searchInput");

const selectButton =
    document.getElementById("selectButton");

const selectMenu =
    document.getElementById("selectMenu");

const selectText =
    document.getElementById("selectText");

const selectIcon =
    document.getElementById("selectIcon");

const currentModeText =
    document.getElementById("currentMode");


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

            allPlayers.push({
                id: doc.id,
                ...doc.data()
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
RENDER
========================= */

function renderLeaderboard() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    let players =
        allPlayers
            .filter(player => {

                return (
                    player.username || ""
                )
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

        row.className = "player-row";


        const rank =
            document.createElement("div");

        rank.className = "rank";

        rank.textContent =
            "#" + (index + 1);


        const name =
            document.createElement("div");

        name.className =
            "player-name";


        const avatar =
            document.createElement("div");

        avatar.className =
            "player-avatar";

        avatar.textContent =
            player.username
                .charAt(0)
                .toUpperCase();


        const username =
            document.createElement("span");

        username.textContent =
            player.username;


        name.appendChild(avatar);

        name.appendChild(username);


        const tier =
            document.createElement("div");

        tier.className =
            "player-tier " +
            getTierClass(player.tier);

        tier.textContent =
            player.tier;


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
TIER COLORS
========================= */

function getTierClass(tier) {

    if (!tier) {
        return "tier-unranked";
    }


    return (
        "tier-" +
        tier
            .toLowerCase()
            .replaceAll(" ", "-")
    );

}


/* =========================
DROPDOWN
========================= */

selectButton.addEventListener(
    "click",
    (event) => {

        event.stopPropagation();

        selectMenu.classList.toggle("open");

        selectButton.classList.toggle(
            "open"
        );

    }
);


document
    .querySelectorAll(".select-option")
    .forEach(option => {

        option.addEventListener(
            "click",
            () => {

                currentMode =
                    option.dataset.mode;


                selectText.textContent =
                    option.querySelector(
                        "strong"
                    ).textContent;


                selectIcon.textContent =
                    option.dataset.icon;


                currentModeText.textContent =
                    currentMode.toUpperCase();


                document
                    .querySelectorAll(
                        ".select-option"
                    )
                    .forEach(item => {

                        item.classList.remove(
                            "active"
                        );

                    });


                option.classList.add(
                    "active"
                );


                selectMenu.classList.remove(
                    "open"
                );


                selectButton.classList.remove(
                    "open"
                );


                renderLeaderboard();

            }
        );

    });


document.addEventListener(
    "click",
    () => {

        selectMenu.classList.remove(
            "open"
        );

        selectButton.classList.remove(
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
