const API_URL =
    "https://spicytiersapi.strahinjapile2013.workers.dev";


let currentMode =
    "overall";


const leaderboardList =
    document.getElementById(
        "leaderboardList"
    );


const searchInput =
    document.getElementById(
        "searchInput"
    );


const modeSelect =
    document.getElementById(
        "modeSelect"
    );


let allPlayers = [];


/*
=========================
LOAD LEADERBOARD
=========================
*/

async function loadLeaderboard() {

    leaderboardList.innerHTML =
        `
        <div class="loading">
            Loading leaderboard...
        </div>
        `;


    try {


        let endpoint;


        if (
            currentMode ===
            "overall"
        ) {

            endpoint =
                "/leaderboard";

        } else {

            endpoint =
                "/leaderboard/" +
                currentMode;

        }


        const response =
            await fetch(

                API_URL +
                endpoint

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


        allPlayers =
            data.players;


        renderLeaderboard();


    } catch (error) {


        console.error(error);


        leaderboardList.innerHTML =
            `
            <div class="empty">
                Could not load leaderboard.
            </div>
            `;

    }

}


/*
=========================
RENDER
=========================
*/

function renderLeaderboard() {


    const search =
        searchInput.value
            .trim()
            .toLowerCase();


    const players =
        allPlayers.filter(
            player =>
                player.username
                    ?.toLowerCase()
                    .includes(search)
        );


    leaderboardList.innerHTML =
        "";


    if (
        players.length === 0
    ) {

        leaderboardList.innerHTML =
            `
            <div class="empty">
                No players found.
            </div>
            `;

        return;

    }


    players.forEach(
        (
            player,
            index
        ) => {


            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "player-row";


            /*
            RANK
            */

            const rank =
                document.createElement(
                    "div"
                );


            rank.className =
                "rank";


            rank.textContent =
                "#" +
                (
                    index +
                    1
                );


            /*
            PLAYER
            */

            const name =
                document.createElement(
                    "div"
                );


            name.className =
                "player-name";


            const avatar =
                document.createElement(
                    "img"
                );


            avatar.className =
                "player-avatar";


            avatar.src =
                "https://mc-heads.net/avatar/" +

                encodeURIComponent(
                    player.username
                ) +

                "/100";


            avatar.alt =
                player.username;


            const username =
                document.createElement(
                    "span"
                );


            username.textContent =
                player.username;


            name.appendChild(
                avatar
            );


            name.appendChild(
                username
            );


            /*
            TIER
            */

            const tier =
                document.createElement(
                    "div"
                );


            tier.className =
                "player-tier " +

                getTierClass(
                    player.tier
                );


            tier.textContent =
                player.tier ||
                "OVERALL";


            /*
            ELO
            */

            const elo =
                document.createElement(
                    "div"
                );


            elo.className =
                "player-elo";


            elo.innerHTML =
                `
                <strong>
                    ${player.elo}
                </strong>
                ELO
                `;


            /*
            ADD
            */

            row.appendChild(
                rank
            );


            row.appendChild(
                name
            );


            row.appendChild(
                tier
            );


            row.appendChild(
                elo
            );


            /*
            PLAYER PAGE
            */

            row.addEventListener(
                "click",

                () => {

                    window.location.href =
                        "player.html?uuid=" +

                        encodeURIComponent(
                            player.uuid
                        );

                }

            );


            leaderboardList.appendChild(
                row
            );


        }

    );

}


/*
=========================
TIER CLASS
=========================
*/

function getTierClass(
    tier
) {

    if (!tier) {

        return "tier-unranked";

    }


    return (

        "tier-" +

        tier
            .toLowerCase()

    );

}


/*
=========================
MODE SELECT
=========================
*/

if (modeSelect) {


    modeSelect.addEventListener(

        "change",

        () => {


            currentMode =
                modeSelect.value;


            loadLeaderboard();


        }

    );

}


/*
=========================
SEARCH
=========================
*/

if (searchInput) {


    searchInput.addEventListener(

        "input",

        renderLeaderboard

    );

}


/*
=========================
START
=========================
*/

loadLeaderboard();
