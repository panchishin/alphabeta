module.exports = function( modelParameter ) {

	var model = modelParameter

	return function( move , callback ) {

		if ( model.checkWinConditions(move) ) {
			return callback(1);
		}
		return callback(0);
	}
}

