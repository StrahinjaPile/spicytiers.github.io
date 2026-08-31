async function loadLeaderboard() {

    const leaderboard =
        document.getElementById("leaderboard");


    try {

        const snapshot =
            await db.collection("players")
                .orderBy("elo", "desc")
                .get();


        leaderboard.innerHTML = "";


        let rank = 1;


        snapshot.forEach(doc => {

            const player = doc.data();


            const row =
                document.createElement("div");


            row.className =
                "player-row";


            row.innerHTML = `

                <div class="rank">

                    #${rank}

                </div>


                <div class="name">

                    ${player.username}

                </div>


                <div class="tier">

                    ${player.tier}

                </div>


                <div class="elo">

                    ${player.elo} ELO

                </div>

            `;


            leaderboard.appendChild(row);


            rank++;

        });


        if (rank === 1) {

            leaderboard.innerHTML =
                "<p>No players yet.</p>";

        }

    }

    catch (error) {

        console.error(error);

        leaderboard.innerHTML =
            "<p>Could not load leaderboard.</p>";

    }

}


loadLeaderboard();
