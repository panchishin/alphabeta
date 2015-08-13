module.exports = function() {

var INVALID = "invalid" , EMPTY = "____" , RED = "red" , BLUE = "blue"

return {

	EMPTY : EMPTY,

	_placement_rules : [
		{ 
			name : "not on an occupied space",
			test : function( move ) {
				// move = { board : board , i : i , j : j , color : color , previous : previous }
				return move.previous.board[move.i][move.j] != EMPTY
			}
		},
		{ 
			name : "not the same color twice in a row",
			test : function( move ) {
				// move = { board : board , i : i , j : j , color : color , previous : previous }
				return move.previous != undefined && move.color == move.previous.color
			}
		}
	],

	_win_conditions : [
		{
			name : "a line of 3 in a row or column",
			test : function( move ) {
				for( var i in move.board ) {
					var rowCount = 0
					var columnCount = 0
					for( var j in move.board ) {
						rowCount += move.color == move.board[i][j] ? 1 : 0
						columnCount += move.color == move.board[j][i] ? 1 : 0
					}
					if ( rowCount == 3 || columnCount == 3 ) { return true }
				}
				return false
			}
		},
		{
			name : "a diagonal",
			test : function( move ) {
				var rowCount = 0
				var columnCount = 0
				for( var i in move.board ) {
					rowCount += move.color == move.board[i][i] ? 1 : 0
					columnCount += move.color == move.board[i][2 - i] ? 1 : 0
				}
				if ( rowCount == 3 || columnCount == 3 ) { return true }
				return false
			}
		}
	],

	createEmptyBoard : function() {
		
		var board = [ 
			[ EMPTY , EMPTY , EMPTY ],
			[ EMPTY , EMPTY , EMPTY ],
			[ EMPTY , EMPTY , EMPTY ]
		]
		return board
	},

	checkPlacementRules : function( move ) {
		// check placement rules
		for( var index = 0 ; index < this._placement_rules.length ; index++) {
			var rule = this._placement_rules[index]
			if ( !rule.disabled && rule.test && rule.test( move ) ) {
				return rule
			}
		}
		return undefined
	},

	checkWinConditions : function( move ) {
		for( var index in this._win_conditions ) {
			if ( this._win_conditions[index].test(move) ) {
				return this._win_conditions[index]
			}
		}
		return undefined
	},

	_copyBoard : function( board ) {
		return JSON.parse(JSON.stringify(board))
	},
	
	createMove : function( i , j , previous ) {
		var result = { 
			board : JSON.parse(JSON.stringify(previous.board)),
			i : i , 
			j : j , 
			color : this.oppositeColor(previous.color) , 
			previous : previous
		}
		result.board[i][j] = result.color
		return result
	},

	createFirstMove : function() {
		return { board : this.createEmptyBoard() , color: BLUE }
	},

	oppositeColor : function( color ) {
		return color == RED ? BLUE : RED
	}

}

}
