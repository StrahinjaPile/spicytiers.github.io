async function loadLeaderboard() {

```
const leaderboard =
    document.getElementById("leaderboard");


try {

    const snapshot =
        await db
            .collection("players")
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


        const rankDiv =
            document.createElement("div");

        rankDiv.className = "rank";

        rankDiv.textContent =
            "#" + rank;


        const nameDiv =
            document.createElement("div");

        nameDiv.className = "name";

        nameDiv.textContent =
            player.username || "Unknown";


        const tierDiv =
            document.createElement("div");

        tierDiv.className = "tier";

        tierDiv.textContent =
            player.tier || "Unranked";


        const eloDiv =
            document.createElement("div");

        eloDiv.className = "elo";

        eloDiv.textContent =
            (player.elo || 0) + " ELO";


        row.appendChild(rankDiv);
        row.appendChild(nameDiv);
        row.appendChild(tierDiv);
        row.appendChild(eloDiv);


        leaderboard.appendChild(row);


        rank++;

    });


    if (rank === 1) {

        leaderboard.innerHTML = `

            <div class="loading">
                No players yet.
            </div>

        `;

    }

}

catch (error) {

    console.error(error);


    leaderboard.innerHTML = `

        <div class="loading">
            Could not load leaderboard.
        </div>

    `;

}
```

}

loadLeaderboard();
