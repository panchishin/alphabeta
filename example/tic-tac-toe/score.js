module.exports = function( modelParameter ) {

	var model = modelParameter

	return function( move , callback ) {

		if ( model.checkWinConditions(move) ) {
			return callback( Number.POSITIVE_INFINITY );
		}
		return callback( Math.random() );
	}
}

