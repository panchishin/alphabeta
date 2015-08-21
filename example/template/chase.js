
var STARTING_DISTANCE = 40

var initialState = { 
	preditor : { energy : 60 , location : 0 , maxSpeed : 10 , move : 0 },
	prey	 : { energy : 10 , location : STARTING_DISTANCE , maxSpeed : 8 , move : 0 },
	current	 : "prey",
	time : STARTING_DISTANCE * 3
}






function clone( state ) {
	return JSON.parse(JSON.stringify(state))
}

function nextMove( state ) {
	var move = clone(state)
	move.current = move.current == "prey" ? "preditor" : "prey"
	move.preditor.move = 0
	move.prey.move = 0
	move.time -= 1
	return move
}

function calculateDistance(state) {
	return Math.max( 0 , state.prey.location - state.preditor.location )
}

function scoreFunction( state , callback ) {
	var distance = calculateDistance(state)

	// preditor wins if they touch
	if ( distance == 0 ) {
		return callback( Number.POSITIVE_INFINITY * ( state.current == "preditor" ? 1 : -1 ) )
	}

	// prey wins if the distance is doubled
	if ( distance > STARTING_DISTANCE * 2 ) {
		return callback( Number.POSITIVE_INFINITY * ( state.current == "prey" ? 1 : -1 ) )
	}

	// preditor loses if their energy is not enough to reach the prey
	if ( distance > state.preditor.energy ) {
		return callback( Number.POSITIVE_INFINITY * ( state.current == "prey" ? 1 : -1 ) )	
	}

	distance -= STARTING_DISTANCE 
	distance *= Math.pow( Math.abs(distance) , 0.4 )
	distance += state.prey.energy - state.preditor.energy

	return callback( distance * ( state.current == "prey" ? 1 : -1 ) )
}



function generateMoves( state ) {
	var possibleStates = [];

	if ( nextMove(state).current == "prey" && calculateDistance(state) <= 0 ) {
		return [nextMove(state)]
	}

	// the animal can move up to its maxSpeed, if it has the energy
	var maxSpeed = state[nextMove(state).current].maxSpeed
	for( var speed = nextMove(state).current == "prey" ? 0 : 1 ; speed <= maxSpeed ; speed++ ) {
		var move = nextMove(state)
		var cost = Math.round(Math.pow(speed , 1.4 ))
		if ( move[move.current].energy >= cost ) {
			move[move.current].energy -= cost
			move[move.current].location += speed
			move[move.current].move = speed
			possibleStates.push(move)
		}
	}
	if (nextMove(state).current == "prey") {
		possibleStates.push( nextMove(state) )
	}

	return possibleStates;
}

function checkWinConditions( state ) {
	var distance = calculateDistance(state)

	if ( state.current == "preditor" && distance == 0 ) {
		return "Preditor ate the prey"
	}

	if ( state.current == "prey" && distance > STARTING_DISTANCE * 2 ) {
		return "Prey got away from the Preditor"
	}

	if ( state.current == "prey" && state.preditor.energy <= 1 ) {
		return "Preditor got too tired and gave up.  Prey wins."
	}

	if ( state.current == "prey" && state.time <= 0 ) {
		return "Times up, Prey wins."
	}
	// preditor loses if their energy is not enough to reach the prey
	if ( state.current == "prey" && distance > state.preditor.energy ) {
		return "Preditor doesn't have enough energy to cross the distance.  Prey wins."
	}


	return false;
}


var alphabeta = require("../../alphabeta.js")({
	scoreFunction : scoreFunction,
	generateMoves : generateMoves,
	checkWinConditions : checkWinConditions
})



function doOneRound( state ) {


	for( var i = 0 ; i < state.preditor.location ; i++ ) process.stdout.write(" ")
	process.stdout.write("C")
	for( var i = state.preditor.location ; i < state.prey.location ; i++ ) process.stdout.write(" ")
	process.stdout.write("o\n")
	

//	console.log("There is " + calculateDistance(state) + " distance between the Prey (energy="+state.prey.energy+") and Preditor (energy="+state.preditor.energy+")")

	alphabeta.setup( { state : state , depth : DEPTH } )

	alphabeta.allSteps( function ( bestNextState ) {
		var win = bestNextState ? checkWinConditions( bestNextState ) : false
		win = win != false ? true : false
		if ( bestNextState && ! win ) { 
			doAnotherRound(bestNextState);
		} else if ( bestNextState && win ) {
			handleWin( bestNextState );
		} else {
			handleNotWinAndNoValidMoves( state );
		}
	})
}

function doAnotherRound( state ) {
	setTimeout( function() { 
		doOneRound( state ); 
	} , 1);
}

function handleWin( state ) {
	console.log("Win condition found.")
	console.log(checkWinConditions( state ))
	console.log(state)
}

function handleNotWinAndNoValidMoves( previousState ) {
	console.log("No moves found. Finished")
	console.log( checkWinConditions(previousState ) )
	console.log(previousState)
}





console.log("\nPreditor Vs Prey\n")
var DEPTH = process.argv[2] ? Math.round( process.argv[2] * 1.0 ) : 0
if ( DEPTH < 1 || DEPTH > 8 ) {
	console.log("There are two entities, a preditor that can run fast, and a prey that notices the preditor at some distance")
	console.log("Each entity can choose what speed to run at on their round but faster speeds use up a lot more energy than slower speeds")
	console.log("Here is an example of the 'State' data structure")
	console.log(initialState)
	console.log("\nThe prey is doomed as long as the preditor conserves energy and slowly approaches.  Play with the depth of AlphaBeta search to see how it makes a difference.")
	console.log("The depth must be at least 1 and at most 8.")
	console.log("\nUsage : " + process.argv[0] + " " + process.argv[1] + " [depth]\n")
	process.exit(1)
}


console.log("Preditor = 'C' , Prey = 'o'\n")
console.log("Start____________________");
doOneRound( initialState )
