let currentMode = "sword";
let allPlayers = [];

const leaderboardList =
    document.getElementById("leaderboardList");

const searchInput =
    document.getElementById("searchInput");


// =========================
// LOAD PLAYERS
// =========================

async function loadPlayers() {

    leaderboardList.innerHTML =
        '<div class="loading">Loading leaderboard...</div>';

    try {

        const snapshot =
            await db.collection("players").get();

        allPlayers = [];

        snapshot.forEach(doc => {

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


// =========================
// RENDER
// =========================

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
                    player[currentMode] || {};

                return {
                    ...player,

                    elo: Number(stats.elo) || 0,

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

        row.className = "player-row";


        const rank =
            document.createElement("div");

        rank.className = "rank";

        rank.textContent =
            "#" + (index + 1);


        const name =
            document.createElement("div");

        name.className = "player-name";


        const avatar =
            document.createElement("img");

        avatar.className =
            "player-avatar";


        if (player.uuid) {

            avatar.src =
                "https://mc-heads.net/avatar/" +
                player.uuid +
                "/64";

        } else {

            avatar.src =
                "https://mc-heads.net/avatar/" +
                encodeURIComponent(player.username) +
                "/64";

        }


        avatar.onerror = function () {

            this.src =
                "https://mc-heads.net/avatar/MHF_Steve/64";

        };


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
            player.elo.toLocaleString() +
            " ELO";


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


// =========================
// TIER COLORS
// =========================

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


// =========================
// MODE BUTTONS
// =========================

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


// =========================
// SEARCH
// =========================

searchInput.addEventListener(
    "input",
    renderLeaderboard
);


// =========================
// ACCOUNT
// =========================

async function loadAccountArea() {

    const accountArea =
        document.getElementById("accountArea");

    if (!accountArea) return;


    const user =
        auth.currentUser;

    if (!user) {

        accountArea.innerHTML = `
            <a href="connect.html" class="account-button">
                Connect Account
            </a>
        `;

        return;
    }


    try {

        const doc =
            await db
                .collection("accounts")
                .doc(user.uid)
                .get();

        if (!doc.exists) {

            accountArea.innerHTML = `
                <a href="connect.html" class="account-button">
                    Connect Minecraft
                </a>
            `;

            return;
        }


        const account =
            doc.data();


        accountArea.innerHTML = `

            <a href="player.html?player=${encodeURIComponent(account.playerId)}"
               class="account-user">

                <img
                    src="https://mc-heads.net/avatar/${account.uuid}/64"
                    class="account-avatar"
                >

                <span>
                    ${escapeHtml(account.username)}
                </span>

                <b>⌄</b>

            </a>

        `;

    } catch (error) {

        console.error(error);

    }
}


// =========================
// ESCAPE HTML
// =========================

function escapeHtml(text) {

    const div =
        document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


auth.onAuthStateChanged(() => {

    loadAccountArea();

});


// =========================
// START
// =========================

loadPlayers();
