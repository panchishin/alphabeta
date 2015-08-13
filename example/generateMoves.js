module.exports = function( modelParameter ) {

	var model = modelParameter

	return function generateMoves( previous ) {

		var result = []
		for( var i in previous.board ) for( var j in previous.board ) {
			if ( previous.board[i][j] == model.EMPTY ) {
				var move = model.createMove( i , j , previous )
				if (! model.checkPlacementRules(move) ) {
					result.push(move)
				}
			}
		}
		return result
	
	}

}

