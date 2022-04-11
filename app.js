// set up the board

const playerNames = {
    PLAYER1: "Player 1",
    PLAYER2: "Player 2",
    p1color: "blue",
    p2color: "red"
}

let gameState = {
    // the Player 1 store is at 6, the Player 2 store at 13
    board: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0],
    turn: playerNames.PLAYER1,
    winner: ""
};

// retrieve the elements needed from the html
let board = document.getElementById("board");
let boardPits = [];
let currentTurn = document.getElementById("turn");
let restartButton = document.getElementById("restart-game");
let nameButton = document.getElementById("name-update");
let player1Name = document.getElementById("player1");
let player2Name = document.getElementById("player2");

// this retrieves each pit/store on the board in the same order as the gameState.board array is set up
for (let i = 0; i < 14; i++) {
    let pit = document.getElementById(i.toString());
    boardPits.push(pit);
}

// function to create the stones in each pit at the start of the game
function fillStones(pit, index) {
    // find the number of stones that should be in that pit
    let numStones = gameState.board[index];

    // once for every number up to the value of the stones in the current pit, create a stone div and add it to the pit div as a child
    for (let i = 0; i < numStones; i++) {
        let stone = document.createElement("div");
        stone.className = "stone";
        pit.appendChild(stone);
    }
    
}

// use foreach to actually fill stones in each pit to start the game
boardPits.forEach(fillStones);

//
// function to do the basic move
//

function basicMove(chosenPit) {

    // use the "turn" property of the gameState to set up which store needs to be skipped;
    let skip = 0;

    if (gameState.turn === playerNames.PLAYER1) {
        skip = 13;
    } else {
        skip = 6;
    }

    // copy the value at that index, then set it to 0 (pick up the stones)
    let hand = gameState.board[chosenPit];
    gameState.board[chosenPit] = 0;

    // use a loop to go through the hand 1 at a time, each time adding 1 to the next index in the array
    let currentPit = 0;

    for (let i = 1; i <= hand; i++) {
        currentPit = chosenPit + i;
        //first check if currentPit is greater than 13; if it is, use modulo to wrap around the array
        if (currentPit > 13) {
            currentPit = (currentPit % 13) - 1;
        }
        //if the currentPit is equal to the index that should be skipped, add 1 to the hand to allow you to skip past that spot and increase the loop length so you can continue to drop stones
        if (currentPit === skip) {
            hand++;
        } else {
            gameState.board[currentPit]++;
        }
        
    }

    // return the index of the last space updated
    return currentPit;
}

// function to determine whether a special rule was met, do those actions, then set the next turn (or end the game); take in the last space that had a stone placed (returned from basicmove function)
function specialRules(lastMove) {

    // check whether it is the current turn's store/bowl, and if so exit the function; no turn change
    if (gameState.turn === playerNames.PLAYER1) {
        if (lastMove === 6) {
            return;
        }
    } else {
        if (lastMove === 13) {
            return;
        }
    }    

    function runSpecial(turn, move) {
        // add a reference to the index of the current player's store
        let store = 0;
        if (turn === playerNames.PLAYER1) {
            store = 6;
        } else {
            store = 13;
        }

        // find the opposite spot on the board
        let opposite = 12 - move;

        // take the value from the last move and the opposite and add them to the hand, then set the values of those spots to 0; then add the hand to the store that was set earlier
        let hand = 1;
        gameState.board[move] = 0;
        hand += gameState.board[opposite];
        gameState.board[opposite] = 0;
        gameState.board[store] += hand;
    }

    // check whether the turn is on their own side
    if (gameState.turn === playerNames.PLAYER1 && lastMove >= 0 && lastMove < 6 && gameState.board[lastMove] === 1) {
        // if yes, use the runSpecial function to steal the stones from the opposite side of the board
        // also set 
        runSpecial(gameState.turn, lastMove);
    } else if (gameState.turn === playerNames.PLAYER2 && lastMove > 6 && lastMove < 13 && gameState.board[lastMove] === 1) {
        runSpecial(gameState.turn, lastMove);
    }
    

    // set the next turn (if we met a rule that ends the game or repeats the turn, we don't get this far);
    if (gameState.turn === playerNames.PLAYER1) {
        gameState.turn = playerNames.PLAYER2;
    } else {
        gameState.turn = playerNames.PLAYER1;
    }
    
}

// check if the game is over
function isGameOver() {
    let gameOver = false;
    for (let i = 0; i < 6; i++) {
        // check if the current pit is empty; if not, end the loop and move on
        if (gameState.board[i] !== 0) {
            break;
        }
        // if we've reached the last pit on this side of the board and it's also empty, set gameOver to true
        if (i === 5 && gameState.board[i] === 0) {
            gameOver = true;
        }
    }
    for (let i = 7; i < 13; i++) {
        if (gameState.board[i] !== 0) {
            break;
        }
        if (i === 12 && gameState.board[i] === 0) {
            gameOver = true;
        }
    }
    // use the gameOver boolean to determine whether to run the setWinner function and end the game
    if (gameOver) {
        for (let i = 0; i < 6; i++) {
            gameState.board[6] += gameState.board[i]
            gameState.board[i] = 0;
        }
        for (let i = 7; i < 13; i++) {
            gameState.board[13] += gameState.board[i]
            gameState.board[i] = 0;
        }
        
        // set the gameState to show the correct winner
        if (gameState.board[6] > gameState.board[13]) {
            gameState.winner = playerNames.PLAYER1;
        } else {
            gameState.winner = playerNames.PLAYER2;
        }
    }

    // return the gameOver state so the showWinner function has some input to know whether it needs to run
    return gameOver;

}

//
// functions to render the changes
//

// helper function specifically for showing the stones in each pit individually
function showStones(pitIndex) {
    boardPits[pitIndex].innerHTML = "";
    let pitValue = gameState.board[pitIndex];
    for (let i = 0; i < pitValue; i++) {
        let stone = document.createElement("div");
        stone.className = "stone";
        boardPits[pitIndex].appendChild(stone);
    }
}

// show the correct stones after the basic move is done
function showMove() {

    // use for loop to go through each of the boardPits to update the stones in each using the showStones function
    for (let i = 0; i < boardPits.length; i++) {
        showStones(i);
    }

}

// updates the screen again after any special rules are met; also updates the turn display after all checks are completed
function showSpecial(endMove) {
   
    if (endMove !== 6 && endMove !== 13) {
        // find opposite spot on the board
        let opposite = 12 - endMove;

        // update the elements to show the new values; update the last move the player made, the opposite spot on the board, and both of the pits(just to make sure it accounts for either player without writing a bunch of checks)
        showStones(endMove);
        showStones(opposite);
        showStones(6);
        showStones(13);
    }
    
    // change the turn display to show the next turn
    currentTurn.innerText = gameState.turn;
    if (gameState.turn === playerNames.PLAYER2) {
        currentTurn.style.setProperty("color",playerNames.p2color);
    } else {
        currentTurn.style.setProperty("color",playerNames.p1color);
    }
    
}

// updates the screen to show the game winner
function showWinner(gameIsOver) {

    // first, exit the function if the game isn't over
    if (!gameIsOver) {
        return;
    }

    // run showMove again to update the board to show the correct stones in each pit and store
    showMove();

    // create a new div to show the winner and directions/button for restarting the game
    let winnerBox = document.createElement("div");
    winnerBox.id = "winner";
    let color = "";

    // find the color to use for the winner's name (based on the player color)
    if (gameState.winner === playerNames.PLAYER1) {
        color = playerNames.p1color;
    } else {
        color = playerNames.p2color;
    }


    winnerBox.innerHTML = `<p>The winner is...</p><h1 id="winname" style="color: ${color}">${gameState.winner}!</h1><p>Please click the "Restart" button below to play again.</p>`;
    // add the new div to the page
    let gameBoard = document.getElementById("game");
    gameBoard.appendChild(winnerBox);

}

//
// function for the gameplay click event; this will use the other functions to make the game move on after each click
//

function makeMove(move) {
    // get the id of the pit that was clicked on
    let clickedPit = Number(move.target.id);
    
    // prevent any clicks after a winner is set from doing anything
    if (gameState.winner) {
        return;
    }

    // if the value of that pit is 0, prevent the click from doing anything
    if (gameState.board[clickedPit] === 0){
        return;
    }

    // helper function to clean up the if/else statement below a bit
    function moveAndDisplay() {
        let lastPit = basicMove(clickedPit);
        showMove();
        specialRules(lastPit);
        showSpecial(lastPit);
        showWinner(isGameOver());
    }

    // check the turn and make sure that the clicked pit belongs to the player
    // run the state changes and visual changes separately
    if (gameState.turn === playerNames.PLAYER1 && clickedPit >= 0 && clickedPit < 6) {
        moveAndDisplay();
    } else if (gameState.turn === playerNames.PLAYER2 && clickedPit >= 6 && clickedPit < 13){
        moveAndDisplay();
    }
}

// event listener for making moves during the game
board.addEventListener("click", makeMove);

//
// function for updating player names
//

function updateNames() {

    // check the current turn before updating the gameState, so that the display of the current turn can be updated properly (if we updated the gamestate first, we can't tell how to update the displayed turn and the gamestate for the turn
    if (gameState.turn === playerNames.PLAYER1) {
        playerNames.PLAYER1 = player1Name.value;
        playerNames.PLAYER2 = player2Name.value;
        gameState.turn = playerNames.PLAYER1;
        currentTurn.innerText = playerNames.PLAYER1;
    } else {
        playerNames.PLAYER1 = player1Name.value;
        playerNames.PLAYER2 = player2Name.value;
        gameState.turn = playerNames.PLAYER2;
        currentTurn.innerText = playerNames.PLAYER2;
    }
}

// event listener for updating the playerNames
nameButton.addEventListener("click", updateNames);

//
// function to reset the gameState and display for restarting the game
//

function restartGame() {

    // check if there is a winner, and if there is, remove the displayed winner box
    if (gameState.winner) {
        let winBox = document.getElementById("winner");
        winBox.remove();
    }

    // reset the player names
    playerNames.PLAYER1 = "Player 1";
    playerNames.PLAYER2 = "Player 2";
    player1Name.value = playerNames.PLAYER1;
    player2Name.value = playerNames.PLAYER2;

    // reset the gameState properties
    gameState.board = [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0];
    gameState.turn = playerNames.PLAYER1;
    gameState.winner = "";

    // update the current turn display
    currentTurn.innerText = playerNames.PLAYER1;
    currentTurn.style.setProperty("color",playerNames.p1color);

    // update the board (can use the showMove function since it updates all pits on the board - pass in 0 to start at the beginning of the board
    showMove();
}

// event listener for the button to restart the game
restartButton.addEventListener("click", restartGame);

// currently having an issue where clicks sometimes aren't registered correctly
// also sometimes it seems to register the click, but only changes the turn - this may be related to just not registering correctly and thinking I clicked on an empty pit for the move or something
