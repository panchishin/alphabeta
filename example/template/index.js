function createInitialState() {
	var someState = {};

	// TODO populate someState with important info about the problem or game.
	// This could be a classic setup like chess where the beginning of the game
	// is always the same or it could be from a database of saved games.

	return someState;
}


function scoreFunction( state , callback ) {
	var score = 0;

	// TODO update score based on state
	// in your first implementation try just using a very simple scoring method
	// like number of pieces player one has minus number of pieces player two has.

	callback( score );
}


function generateMoves( state ) {
	var possibleStates = [];

	// TODO use logic and data from the current state to generate other possible states.
	// in your first implementation try just generating all possible moves from the current state.

	return possibleStates;
}


function checkWinConditions( state ) {
	var reasonForWin = false;

	// TODO populate reasonForWin with something meaningful like "reached the goal line"
	// or just set it to true if 'state' is a win condition.
	// If not a win condition set it to false or null or undefined.

	return reasonForWin;
}


var alphabeta = require("../../alphabeta.js")({
	scoreFunction : scoreFunction,
	generateMoves : generateMoves,
	checkWinConditions : checkWinConditions
})



function doOneRound( state ) {

	console.log("The state is:")
	console.log( state );

	var depth = 1;	// TODO decide on how many moves to look ahead.

	alphabeta.setup( { state : state , depth : depth } )

	alphabeta.allSteps( function ( bestNextState ) {
		if ( bestNextState && ! checkWinConditions( bestNextState ) ) { 
			doAnotherRound( bestNextState );
		} else if ( bestNextState && checkWinConditions( bestNextState ) ) {
			handleWin( bestNextState );
		} else {
			handleNotWinAndNoValidMoves( state );
		}
	})
}

function doAnotherRound( state ) {

	// TODO (optional) insert handling prior to queuing another round of simulation
	console.log("Found the best next state");

	setTimeout( function() { 
		doOneRound( bestNextState ); 
	} , 1);

}

function handleWin( state ) {
	// TODO (optional) insert your handling of end-of-game or simulation here
	console.log("Win condition found.");
	console.log("The winning state is:");
	console.log( bestNextState );
	console.log("Finished.");
}

function handleNotWinAndNoValidMoves( previousState ) {
	// TODO (optional) insert your handling of no-viable-conclusion-found here
	console.log("No moves found. Finished");
}




console.log("Start");

doOneRound( createInitialState() )
