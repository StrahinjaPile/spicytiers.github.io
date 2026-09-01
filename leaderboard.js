const API_URL =
    "https://spicytiersapi.strahinjapile2013.workers.dev";


let currentMode =
    "overall";


let allPlayers =
    [];


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


const currentModeTitle =
    document.getElementById(
        "currentModeTitle"
    );


/*
=================================
LOAD LEADERBOARD
=================================
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


        /*
        =========================
        OVERALL
        =========================
        */


        if (
            currentMode ===
            "overall"
        ) {


            endpoint =
                "/leaderboard";


        }


        /*
        =========================
        GAMEMODE
        =========================
        */


        else {


            endpoint =

                "/leaderboard/" +

                encodeURIComponent(
                    currentMode
                );


        }


        const url =

            API_URL +

            endpoint;


        console.log(
            "[SpicyTiers] Requesting:",
            url
        );


        const response =

            await fetch(
                url,
                {
                    method: "GET",

                    headers: {

                        "Accept":
                            "application/json"

                    }

                }
            );


        if (
            !response.ok
        ) {


            throw new Error(

                "HTTP Error " +

                response.status

            );


        }


        const data =

            await response.json();


        console.log(
            "[SpicyTiers] Response:",
            data
        );


        if (
            !data.success
        ) {


            throw new Error(

                data.error ||

                "API returned an error"

            );


        }


        allPlayers =

            data.players ||

            [];


        renderLeaderboard();


    }


    catch (
        error
    ) {


        console.error(
            "[SpicyTiers] Error:",
            error
        );


        leaderboardList.innerHTML =

            `
            <div class="empty">

                <strong>

                    Could not load leaderboard.

                </strong>

                <br>

                <span>

                    Please try again later.

                </span>

            </div>
            `;


    }


}



/*
=================================
RENDER LEADERBOARD
=================================
*/

function renderLeaderboard() {


    const search =

        searchInput

            ? searchInput
                .value
                .trim()
                .toLowerCase()

            : "";


    let players =

        allPlayers

            .filter(
                player =>
                {


                    const username =

                        player.username ||

                        "";


                    return

                        username
                            .toLowerCase()
                            .includes(
                                search
                            );


                }
            )


            .map(
                player =>
                {


                    const elo =

                        Number(
                            player.elo
                        )

                        ||

                        0;


                    const tier =

                        player.tier

                        ||

                        getTierFromElo(
                            elo
                        );


                    return {


                        ...player,


                        elo:


                            elo,


                        tier:


                            tier


                    };


                }
            );


    /*
    =========================
    SORT BY ELO
    =========================
    */


    players.sort(

        (
            a,
            b
        )

        =>

        b.elo -

        a.elo

    );


    leaderboardList.innerHTML =
        "";


    /*
    =========================
    NO PLAYERS
    =========================
    */


    if (
        players.length ===
        0
    ) {


        leaderboardList.innerHTML =

            `
            <div class="empty">

                No players found.

            </div>
            `;


        return;


    }


    /*
    =========================
    CREATE PLAYERS
    =========================
    */


    players.forEach(

        (
            player,
            index
        )

        =>
        {


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


            const playerName =

                player.username ||

                "Unknown";


            avatar.src =

                "https://mc-heads.net/avatar/" +

                encodeURIComponent(
                    playerName
                ) +

                "/100";


            avatar.alt =
                playerName;


            avatar.onerror =
                function () {


                    this.src =

                        "https://mc-heads.net/avatar/MHF_Steve/100";


                };


            const username =

                document.createElement(
                    "span"
                );


            username.textContent =
                playerName;


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
                player.tier;


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

                `<strong>

                    ${player.elo}

                </strong>

                ELO`;


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

                () =>
                {


                    if (
                        player.uuid
                    ) {


                        window.location.href =

                            "player.html?uuid=" +

                            encodeURIComponent(
                                player.uuid
                            );


                    }


                }

            );


            leaderboardList.appendChild(
                row
            );


        }

    );


}



/*
=================================
TIER CLASS
=================================
*/

function getTierClass(
    tier
) {


    if (
        !tier
    ) {


        return
            "tier-unranked";


    }


    return

        "tier-" +

        tier

            .toLowerCase()

            .replace(
                /\s+/g,
                "-"
            );


}



/*
=================================
ELO TO TIER
=================================
*/

function getTierFromElo(
    elo
) {


    if (
        elo >=
        2250
    ) {

        return "HT1";

    }


    if (
        elo >=
        2000
    ) {

        return "LT1";

    }


    if (
        elo >=
        1900
    ) {

        return "HT2";

    }


    if (
        elo >=
        1800
    ) {

        return "LT2";

    }


    if (
        elo >=
        1650
    ) {

        return "HT3";

    }


    if (
        elo >=
        1500
    ) {

        return "LT3";

    }


    if (
        elo >=
        1300
    ) {

        return "HT4";

    }


    if (
        elo >=
        1200
    ) {

        return "LT4";

    }


    if (
        elo >=
        1100
    ) {

        return "HT5";

    }


    if (
        elo >=
        1000
    ) {

        return "LT5";

    }


    return
        "UNRANKED";


}



/*
=================================
MODE NAME
=================================
*/

function getModeName(
    mode
) {


    const modes = {


        overall:
            "Overall",


        sword:
            "Sword",


        axe:
            "Axe",


        mace:
            "Mace",


        pot:
            "Pot",


        uhc:
            "UHC",


        vanilla:
            "Vanilla",


        smp:
            "SMP",


        nethop:
            "Netherite OP"


    };


    return

        modes[mode]

        ||

        mode;


}



/*
=================================
MODE CHANGE
=================================
*/

if (
    modeSelect
) {


    modeSelect.addEventListener(

        "change",

        () =>
        {


            currentMode =

                modeSelect.value;


            if (
                currentModeTitle
            ) {


                currentModeTitle.textContent =

                    getModeName(
                        currentMode
                    );


            }


            loadLeaderboard();


        }

    );


}



/*
=================================
SEARCH
=================================
*/

if (
    searchInput
) {


    searchInput.addEventListener(

        "input",

        () =>
        {


            renderLeaderboard();


        }

    );


}



/*
=================================
START
=================================
*/


loadLeaderboard();
