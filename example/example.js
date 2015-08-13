var model = require("./model.js")()

var scoreFunction = require("./score.js")(model);

var randomScoreFunction = function(move,callback) {
	scoreFunction(move, function(score) {
		callback( score + Math.random() * .1 )
	})

}

var minimax = require("../alphabeta.js")({
	scoreFunction : randomScoreFunction,
	generateMoves : require("./generateMoves.js")(model),
	checkWinConditions : function ( move ) {
		return model.checkWinConditions(move)
	}
})



var next = function( depth , tag , minimax , callback ) {
	minimax.setup( move , depth )
	
	minimax.allSteps( function (nextmove) {
		move = nextmove
		if ( move ) {
			var win = model.checkWinConditions(move)
			if ( win ) {
				wins[move.color]++
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
var move = model.createFirstMove()

function doThisManyGames( count ) {

	move = model.createFirstMove()

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
