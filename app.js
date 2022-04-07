// set up the board
let gameState = {
    // the player store is at 6, the opponent store at 13
    board: [4, 4, 4, 4, 4, 4, 0, 4, 4, 4, 4, 4, 4, 0],
    turn: "player",
    winner: ""
};
// add in some constants as references to the playerstore and opponentstore

console.log(gameState);

// retrieve the elements needed from the html
let board = document.getElementById("board");
let boardPits = [];
let currentTurn = document.getElementById("turn");

//this retrieves each pit/store on the board in the same order as the gameState.board array is set up
for (let i = 0; i < 14; i++) {
    let pit = document.getElementById(i.toString());
    boardPits.push(pit);
}

// function to do the basic move - empty the chosen spot and add 1 to each spot after it in the array until there are none left; pass in the chosen pit/index
function basicMove(chosenPit) {

    // use the "turn" property of the gameState to set up which store needs to be skipped;
    let skip = 0;

    if (gameState.turn === "player") {
        skip = 13;
    } else {
        skip = 6;
    }

    // copy the value at that index, then set it to 0 (pick up the stones)
    let hand = gameState.board[chosenPit];
    gameState.board[chosenPit] = 0;

    // use a loop to decrement through the copied value 1 at a time, each time adding 1 to the next index in the array
    let currentPit = 0;

    for (let i = 1; i <= hand; i++) {
        currentPit = chosenPit + i;
        //first check if currentPit is greater than 13; if it is, use modulo to wrap around the array
        if (currentPit > 13) {
            currentPit = currentPit % 13;
        }
        //if the currentPit is equal to the index that should be skipped, add 1 to the hand to allow you to skip past that spot and increase the loop length so you can continue to drop stones
        if (currentPit === skip) {
            hand++;
        } else {
            gameState.board[currentPit]++;
        }
        
    }
    console.log(gameState);

    // run the basic move renderer
    // return the index of the last space updated
    return currentPit;
}

// function to determine whether a special rule was met, do those actions, then set the next turn (or end the game); take in the last space that had a stone placed (returned from basicmove function)
function specialRules(lastMove) {

    // check whether it is the current turn's store/bowl, and if so exit the function; no turn change
    if (gameState.turn === "player") {
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
        if (turn === "player") {
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
    if (gameState.turn === "player" && lastMove >= 0 && lastMove < 6 && gameState.board[lastMove] === 1) {
        // if yes, use the runSpecial function to steal the stones from the opposite side of the board
        runSpecial(gameState.turn, lastMove);
    } else if (gameState.turn === "opponent" && lastMove > 6 && lastMove < 13 && gameState.board[lastMove] === 1) {
        runSpecial(gameState.turn, lastMove);
    }
    

    // set the next turn (if we met a rule that ends the game or repeats the turn, we don't get this far);
    if (gameState.turn === "player") {
        gameState.turn = "opponent";
    } else {
        gameState.turn = "player";
    }

    console.log(gameState);

    // need to return something to tell showSpecial what to do


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
        }
        for (let i = 7; i < 13; i++) {
            gameState.board[13] += gameState.board[i]
        }
        
        // set the gameState to show the correct winner
        if (gameState.board[6] > gameState.board[13]) {
            gameState.winner = "player";
        } else {
            gameState.winner = "opponent";
        }
    }

    // return the gameOver state so the showWinner function has some input to know whether it needs to run
    return gameOver;

}

// functions to render the changes

function showMove(startPoint) {

    // use for loop to go through each of the boardPits in order starting at the passed in "startPoint" (the clicked pit) and update the amount shown on screen

    // go as long as i isn't the same as the start index, and use modulo to increment i while keeping it less than the length of the board array
    // change the startpoint before entering the loop (tried a few things, couldn't get it to work otherwise)

    boardPits[startPoint].innerText = gameState.board[startPoint];
    for (let i = startPoint + 1; i !== startPoint; i = (i + 1) % 14) {
        boardPits[i].innerText = gameState.board[i];
    }

}

function showSpecial(endMove) {
    // updates the screen again after any special rules are met; also updates the turn display after all checks are completed
    
    // find opposite spot on the board
    let opposite = 12 - endMove;

    // update the innerText of the elements to show the new values; update the last move the player made, the opposite spot on the board, and both of the pits(just to make sure it accounts for either player without writing a bunch of checks)
    boardPits[endMove].innerText = gameState.board[endMove];
    boardPits[opposite].innerText = gameState.board[opposite];
    boardPits[6].innerText = gameState.board[6];
    boardPits[6].innerText = gameState.board[13];

    // change the turn display to show the next turn
    currentTurn.innerText = gameState.turn;
}

function showWinner(gameIsOver) {
    // updates the screen to show the game winner

    // first, exit the function if the game isn't over
    if (!gameIsOver) {
        return;
    }






    // update a hidden div to be visible or create a new div to show the winner and directions/button for restartin the game
}



// function for the click event; this will use the other functions to make the game move on after each click
function makeMove(move) {
    // get the id of the pit that was clicked on
    let clickedPit = Number(move.target.id);

    // prevent any clicks after a winner is set from doing anything
    if (gameState.winner) {
        return;
    }

    // check the turn and make sure that the clicked pit belongs to the player
    if (gameState.turn === "player" && clickedPit >= 0 && clickedPit < 6) {
        let lastPit = basicMove(clickedPit);
        showMove(clickedPit);
        specialRules(lastPit);
        showSpecial(lastPit);
        showWinner(isGameOver());

    } else if (gameState.turn === "opponent" && clickedPit >= 6 && clickedPit < 13){
        let lastPit = basicMove(clickedPit);
        showMove(clickedPit);
        specialRules(lastPit);
        showSpecial();
    }

}

board.addEventListener("click", makeMove);


// add setTimeout() to the display functions to give a bit of delay while moving between pits
    // this may turn out not to work - do more research

// need to add a way to restart the game
