
var model = require("./model.js")()

var scoreFunction = require("./score.js")(model)

var generateMoves = require("./generateMoves.js")(model)

var checkWinConditions = function ( state ) {
	return model.checkWinConditions( state )
}

var minimax = require("../../alphabeta.js")({
	scoreFunction : scoreFunction,
	generateMoves : generateMoves,
	checkWinConditions : checkWinConditions
})


var next = function( depth , tag , minimax , callback ) {
	minimax.setup( { state : state , depth : depth } )
	
	minimax.allSteps( function (nextstate) {
		state = nextstate
		if ( state ) {
			var win = model.checkWinConditions(state)
			if ( win ) {
				wins[state.color]++
				callback( false )
				return
			} else {
				callback( true )
				return 
			}
		} else {
			wins.draw++
			callback( false )
			return
		}
	})
}


function roundByRoundTillThereIsAWinner(callback) {
	next(Adepth,"A", minimax , function( finished ) {
		if ( !finished ) {
			callback(wins)
		} else {
			next(Bdepth,"B", minimax , function( finished ) {
				if ( !finished ) {
					callback(wins)
				} else {
					roundByRoundTillThereIsAWinner(callback)
				}
			})
		}
	})
}


var wins = { red : 0 , blue : 0 , draw : 0 }
var state = model.createFirstMove()

function doThisManyGames( count ) {

	state = model.createFirstMove()

	roundByRoundTillThereIsAWinner( function(wins) { 
		process.stdout.write( JSON.stringify(wins) + "\n")

		count--
		if ( count <= 0 ) {
			process.stdout.write("\nFinished\n")
		} else {
			doThisManyGames( count )
		}
	})
}

var Adepth = process.argv[2] ? process.argv[2] : 6;
var Bdepth = process.argv[3] ? process.argv[3] : 6;

process.stdout.write("\nUsage :\n")
process.stdout.write(process.argv[0] + " " + process.argv[1] + " [red depth] [blue depth]\n")
process.stdout.write("Red moves first, blue second.  The default depth is 6 if not specified.\n")
process.stdout.write("A depth of more than 9 is meaningless for this game because there are only 9 moves.\n\n")

process.stdout.write("10 games of tic-tac-toe are played and the results are displayed\n\n")


doThisManyGames( 10 )
