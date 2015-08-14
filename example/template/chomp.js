function createInitialState( ) {
	var someState = { linelength : 10 , player : "first" , move : "started" };
	return someState;
}


function scoreFunction( state , callback ) {
	// The score function guides alphabeta to search for a solution faster.
	var score = 10 - state.linelength;
	callback( score );
}


function generateMoves( state ) {
	var possibleStates = [  ];

	function createState( state , chompedLength ) {
		var someState = { 
			linelength : state.linelength - chompedLength , 
			player : ( state.player == "first" ? "second" : "first" ),
			move : "ate " + chompedLength + " units"
		};
		return someState;
	}

	for( var chomp = 1 ; chomp <= 3 ; chomp++ ) {
		if ( state.linelength >= chomp ) {
			possibleStates.push( createState( state , chomp ) );
		}
	}

	return possibleStates;
}


function checkWinConditions( state ) {
	var reasonForWin = false;

	if ( state.linelength == 0 ) {
		reasonForWin = "Ate the last of the line";
	}

	return reasonForWin;
}


var alphabeta = require("../../alphabeta.js")({
	scoreFunction : scoreFunction,
	generateMoves : generateMoves,
	checkWinConditions : checkWinConditions
})



function doOneRound( state ) {

	console.log("\nThe state is : length " + state.linelength + " because player " + state.player + " " + state.move );

	var depth = 10;	// TODO decide on how many moves to look ahead.  For now it is set to 2
	alphabeta.setup( { state : state , depth : depth } )

	alphabeta.allSteps( function ( bestNextState ) {
		if ( bestNextState && ! checkWinConditions( bestNextState ) ) { 
			doAnotherRound(bestNextState);
		} else if ( bestNextState && checkWinConditions( bestNextState ) ) {
			handleWin( bestNextState );
		} else {
			handleNotWinAndNoValidMoves( state );
		}
	})
}

function doAnotherRound( state ) {

	// TODO (optional) insert handling prior to queuing another round of simulation
	setTimeout( function() { 
		doOneRound( state ); 
	} , 1);

}

function handleWin( state ) {
	// TODO (optional) insert your handling of end-of-game or simulation here
	console.log("\nPlayer " + state.player + " won after she " + state.move );
	console.log("Win condition is : " + checkWinConditions( state ) );
	console.log("\nFinished.");
}

function handleNotWinAndNoValidMoves( previousState ) {
	// TODO (optional) insert your handling of no-viable-conclusion-found here
	console.log("No moves found. Finished");
}




console.log("Start");

doOneRound( createInitialState() )
