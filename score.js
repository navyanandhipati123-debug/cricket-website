let matchData = {           //match data
    team1: "",
    team2: "",
    tossWinner: "",
    tossDecision: "",
    battingFirst: "",
    battingSecond: "",
    currentInnings: 1,
    target: 0,
    overs: 2,
    overruns:0,
    currentBall: 0,
    currentBowler: "",
    strikers: [],
    batters: {},
    bowlers: {},
    team1Score: { runs: 0, wickets: 0, balls: 0 },
    team2Score: { runs: 0, wickets: 0, balls: 0 }
};


if (document.getElementById("setupForm")) {                      //setup page and saving data
    document.getElementById("setupForm").addEventListener("submit", function(e) {
        e.preventDefault();
        matchData.team1 = document.getElementById("team1").value;
        matchData.team2 = document.getElementById("team2").value;
        matchData.tossWinner = document.getElementById("tossWinner").value;
        matchData.tossDecision = document.getElementById("tossDecision").value;

        if(matchData.team1 === matchData.team2) {
            alert("Team names cannot be the same!");
            return;
        }

        
        if ((matchData.tossWinner === "Team 1" && matchData.tossDecision === "Bat") || //batting team
            (matchData.tossWinner === "Team 2" && matchData.tossDecision === "Bowl")) {
            matchData.battingFirst = matchData.team1;
            matchData.battingSecond = matchData.team2;
        } else {
            matchData.battingFirst = matchData.team2;
            matchData.battingSecond = matchData.team1;
        }

        localStorage.setItem("matchData", JSON.stringify(matchData));
        window.location.href = "live.html";
    });
}

//--------------------------------------------------------------------------------------------------------

if (window.location.pathname.includes("live.html")) {                           //live page         
    if (!localStorage.getItem("matchData")) {
        alert("Match Setup Not Found!");
        window.location.href = "setup.html";
    }
    matchData = JSON.parse(localStorage.getItem("matchData"));
    
    if (!matchData.strikers.length) {
        let striker = prompt("Enter Strike Batter's Name:");
        let nonStriker = prompt("Enter Non-Strike Batter's Name:");
        let bowler = prompt("Enter Bowler's Name:");

        matchData.strikers = [striker, nonStriker];
        matchData.currentBowler = bowler;

        matchData.batters[striker] = { team:matchData.battingFirst,runs: 0, balls: 0, fours: 0, sixes: 0, out: false };    //intially zero values
        matchData.batters[nonStriker] = { team:matchData.battingFirst,runs: 0, balls: 0, fours: 0, sixes: 0, out: false };
        matchData.bowlers[bowler] = {team:matchData.battingSecond, balls: 0,maidens:0, runs: 0, wickets: 0, overs: 0 };
    }

    updateDisplay();
}


function updateDisplay() {                                               //update display 
    let battingTeam = matchData.currentInnings === 1 ? matchData.battingFirst : matchData.battingSecond;
    let bowlingTeam = matchData.currentInnings === 1 ? matchData.battingSecond : matchData.battingFirst;
    let scoreData = matchData.currentInnings === 1 ? matchData.team1Score : matchData.team2Score;

    if(matchData.currentInnings===1)
    document.getElementById("overallScore").innerText = `${battingTeam} ${scoreData.runs}/${scoreData.wickets} (${Math.floor(scoreData.balls/6)}.${scoreData.balls%6}) vs ${bowlingTeam}`;
    else
    document.getElementById("overallScore").innerText = `${bowlingTeam} ${scoreData.runs}/${scoreData.wickets} (${Math.floor(scoreData.balls/6)}.${scoreData.balls%6}) vs ${battingTeam}(${matchData.team1Score.runs}/${matchData.team1Score.wickets}) (${matchData.team1Score.balls/6}/2)`;
    let batterHTML = '';
    matchData.strikers.forEach(batter => {
        let b = matchData.batters[batter];
        batterHTML += `<tr>
            <td>${batter}</td>
            <td>${b.runs}</td>
            <td>${b.balls}</td>
            <td>${b.fours}</td>
            <td>${b.sixes}</td>
            <td>${b.balls ? ((b.runs/b.balls)*100).toFixed(2) : 0}</td>
        </tr>`;
    });
    document.querySelector("#batterTable tbody").innerHTML = batterHTML;

    let bowler = matchData.bowlers[matchData.currentBowler];
    document.querySelector("#bowlerTable tbody").innerHTML = `<tr>
        <td>${matchData.currentBowler}</td>
        <td>${Math.floor(bowler.balls/6)}.${bowler.balls%6}</td>
        <td>${bowler.maidens}</td>
        <td>${bowler.runs}</td>
        <td>${bowler.wickets}</td>
        <td>${bowler.balls ? (bowler.runs/(bowler.balls/6)).toFixed(2) : 0}</td>
    </tr>`;

    localStorage.setItem("matchData", JSON.stringify(matchData));
    if (matchData.currentInnings === 2 ){
        let crr=0;
        if(matchData.team2Score.balls!==0) crr=(matchData.team2Score.runs/(matchData.team2Score.balls/6)).toFixed(2);
        let rrr=0;
        if(matchData.currentBall!==12) rrr=(6*(matchData.target-matchData.team2Score.runs)/(12-matchData.currentBall)).toFixed(2);
        document.getElementById("runrate").innerText = `CRR: ${crr}`+ `RRR: ${rrr}`;
      
    }
    }



function recordRun(run) {                                         //to handle run and wicket buttons
    
    if(matchData.currentInnings === 2 && (matchData.team2Score>=matchData.target || matchData.currentBall>=12)) {
        window.location.href = "summary.html";
        return;
    }
    matchData.currentBall++;
    let striker = matchData.strikers[0];
    let bowler = matchData.currentBowler;
    if(matchData.team2Score>=matchData.target) {
        alert("match completed redirecting to summary");
        window.location.href = "summary.html";
        }
   

    matchData.overruns+=run;
    if(matchData.currentBall%6===0 && matchData.currentBall!==0 && matchData.overruns===0){ //maidens 
        matchData.bowlers[bowler].maidens++;
        matchData.overruns=0;
    }
    matchData.batters[striker].runs += run;
    matchData.batters[striker].balls++;
    if (run === 4) matchData.batters[striker].fours++;
    if (run === 6) matchData.batters[striker].sixes++;

    matchData.bowlers[bowler].runs += run;
    matchData.bowlers[bowler].balls++;

    let scoreData = matchData.currentInnings === 1 ? matchData.team1Score : matchData.team2Score;
    scoreData.runs += run;
    scoreData.balls++;

    
    if (run % 2 !== 0) {                              //handling strike changes
        matchData.strikers.reverse(); 
    }

    checkOverCompletion();
    checkInningsEnd();
    updateDisplay();
}


function handleWicket() {                      //handling wicket
    let striker = matchData.strikers[0];
    matchData.batters[striker].out = true;

    matchData.bowlers[matchData.currentBowler].wickets++;
    let scoreData = matchData.currentInnings === 1 ? matchData.team1Score : matchData.team2Score;
    scoreData.wickets++;
    scoreData.balls++;
    
    matchData.currentBall++;

    let nextBatter = prompt("Enter Next Batter's Name:");
    matchData.batters[nextBatter] = {team:matchData.battingFirst, runs: 0, balls: 0, fours: 0, sixes: 0, out: false };
    matchData.strikers[0] = nextBatter;

    checkOverCompletion();
    checkInningsEnd();
    updateDisplay();
}


function checkOverCompletion() {                               //over check
    if (matchData.currentBall % 6 === 0 && matchData.currentBall <12) {
        let newBowler =  prompt("Enter New Bowler's Name:");  
        matchData.currentBowler = newBowler;
        if (!matchData.bowlers[newBowler]&& matchData.currentInnings === 1) {
            matchData.bowlers[newBowler] = {team:matchData.battingSecond, balls: 0,maidens:0, runs: 0, wickets: 0, overs: 0 };
        }
        else  matchData.bowlers[newBowler] = {team:matchData.battingFirst, balls: 0,maidens:0, runs: 0, wickets: 0, overs: 0 };
        matchData.strikers.reverse(); 
    }
}

function checkInningsEnd() {                                   //innings check
    let scoreData = matchData.currentInnings === 1 ? matchData.team1Score : matchData.team2Score;
    
    if (scoreData.wickets === 10 || scoreData.balls === 12) {
        if (matchData.currentInnings === 1) {
            matchData.currentInnings = 2;
            matchData.target = matchData.team1Score.runs + 1;
            alert("Innings Over! Target: " + matchData.target);
            
            
            matchData.currentBall = 0;                         // reset for 2nd innings
            matchData.strikers = [];
            let striker = prompt("Enter Strike Batter's Name:");
            let nonStriker = prompt("Enter Non-Strike Batter's Name:");
            let bowler = prompt("Enter Bowler's Name:");
            matchData.strikers = [striker, nonStriker];
            matchData.currentBowler = bowler;

            if (!matchData.batters[striker]) matchData.batters[striker] = { team:matchData.battingSecond,runs: 0, balls: 0, fours: 0, sixes: 0, out: false };
            if (!matchData.batters[nonStriker]) matchData.batters[nonStriker] = { team:matchData.battingSecond,runs: 0, balls: 0, fours: 0, sixes: 0, out: false };
            if (!matchData.bowlers[bowler]) matchData.bowlers[bowler] = { team:matchData.battingFirst,balls: 0, runs: 0,maidens:0, wickets: 0, overs: 0 };
        } else {
            window.location.href = "summary.html";
        }
    }

    if (matchData.currentInnings === 2 && scoreData.runs >= matchData.target) {
        window.location.href = "summary.html";
    }
}

//------------------------------- ----------------------------- ---------------------------------- Scorecard Page
if (window.location.pathname.includes("scorecard.html")) {
    matchData = JSON.parse(localStorage.getItem("matchData"));
    let battingTable = document.getElementById("battingCard").querySelector("tbody");
    let bowlingTable = document.getElementById("bowlingCard").querySelector("tbody");


    for (let player in matchData.batters) {
        let b = matchData.batters[player];
        battingTable.innerHTML += `<tr>
            <td>${b.team}</td>
            <td>${player} ${b.out ? "(out)" : "(not out)"}</td>
            <td>${b.runs}</td>
            <td>${b.balls}</td>
            <td>${b.fours}</td>
            <td>${b.sixes}</td>
            <td>${b.balls ? ((b.runs/b.balls)*100).toFixed(2) : 0}</td>
        </tr>`;
    }

    for (let bowler in matchData.bowlers) {
        let b = matchData.bowlers[bowler];
        bowlingTable.innerHTML += `<tr>
            <td>${b.team}</td>
            <td>${bowler}</td>
            <td>${Math.floor(b.balls/6)}.${b.balls%6}</td>
            <td>${b.maidens}</td>
            <td>${b.runs}</td>
            <td>${b.wickets}</td>
            <td>${b.balls ? (b.runs/(b.balls/6)).toFixed(2) : 0}</td>
        </tr>`;
    }
    
}

//---------------------------------------------------------------------------------      summary page
if (window.location.pathname.includes("summary.html")) {
    matchData = JSON.parse(localStorage.getItem("matchData"));
    let resultDiv = document.getElementById("result");
    let team=document.getElementById("team1");
    

    let team1runs = matchData.team1Score.runs;
    let team2Runs = matchData.team2Score.runs;
    let team2Wickets = matchData.team2Score.wickets;
    let team2Balls = matchData.team2Score.balls;


    let team1=matchData.battingSecond+" "+matchData.team2Score.runs+"/"+matchData.team2Score.wickets+" ("+Math.floor(matchData.team2Score.balls/6)+"."+matchData.team2Score.balls%6+")";
    let team2=matchData.battingFirst+" "+matchData.team1Score.runs+"/"+matchData.team1Score.wickets+" ("+Math.floor(matchData.team1Score.balls/6)+"."+matchData.team1Score.balls%6+")";
  

    if (team2Runs >= matchData.target) {
        let ballsLeft = 12 - team2Balls;
        resultDiv.innerText = `${matchData.battingSecond} won by ${10-team2Wickets} wickets (${ballsLeft} balls left)!`;
        team.innerText="🏆"+team1+"             vs                    "+team2;
    }
    else if(team1runs === team2Runs) {
        team.innerText = team1+"                                "+team2;
        resultDiv.innerText = "Match Tied!";
    }
    else {
        let margin = matchData.target - team2Runs ;
        resultDiv.innerText = `${matchData.battingFirst} won by ${margin} runs!`;
        team.innerText=team1+"             vs                    "+team2+"🏆";
    }
}


function resetMatch() {                                       //reset macth
    localStorage.clear();
    window.location.href = "setup.html";
}
