let currentMode = "sword";

let allPlayers = [];

const leaderboardList =
    document.getElementById("leaderboardList");

const searchInput =
    document.getElementById("searchInput");


async function loadPlayers() {

    leaderboardList.innerHTML =
        '<div class="loading">Loading players...</div>';

    try {

        const snapshot =
            await db.collection("players").get();

        allPlayers = [];

        snapshot.forEach(doc => {

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


function getPlayerStats(player) {

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


    return {

        elo:
            Number(player.elo) || 0,

        tier:
            player.tier || "UNRANKED"

    };

}


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


function renderLeaderboard() {

    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    let players =
        allPlayers
            .filter(player => {

                return (player.username || "")
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


        const rank =
            document.createElement("div");

        rank.className =
            "rank";

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
            (player.username || "?")
                .charAt(0)
                .toUpperCase();


        const username =
            document.createElement("span");

        username.textContent =
            player.username || "Unknown";


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


        row.addEventListener("click", () => {

            window.location.href =
                "player.html?player=" +
                encodeURIComponent(player.id);

        });


        leaderboardList.appendChild(row);

    });

}


document
    .querySelectorAll(".mode")
    .forEach(button => {

        button.addEventListener("click", () => {

            document
                .querySelectorAll(".mode")
                .forEach(btn =>
                    btn.classList.remove("active")
                );

            button.classList.add("active");

            currentMode =
                button.dataset.mode;

            renderLeaderboard();

        });

    });


searchInput.addEventListener(
    "input",
    renderLeaderboard
);


loadPlayers();
