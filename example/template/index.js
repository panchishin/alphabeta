function createInitialState() {
	var someState = {};

	// TODO populate someState with important info about the problem or game

	return someState;
}


function scoreFunction( state , callback ) {
	var score = 0;

	// TODO update score based on state

	callback( score );
}


function generateMoves( state ) {
	var possibleStates = [];

	// TODO use logic and data from the current state to generate other possible states.

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

	var depth = 1;	// TODO decide on how many moves to look ahead.  For now it is set to 2
	alphabeta.setup( state , depth )

	alphabeta.allSteps( function ( bestNextState ) {
		if ( bestNextState && ! checkWinConditions( bestNextState ) ) { 
			doAnotherRound(bestNextState);
		} else if ( bestNextState && checkWinConditions( bestNextState ) ) {
			doAnotherRound( bestNextState );
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
