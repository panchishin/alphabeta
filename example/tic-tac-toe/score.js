module.exports = function( modelParameter ) {

	var model = modelParameter

	return function( move , callback ) {

		// if the move is a winning move then return the best score, positive infinity
		if ( model.checkWinConditions(move) ) {
			return callback( Number.POSITIVE_INFINITY );
		}

		// Tic-tac-toe is such a small game that we can afford to not have any
		// scoring function other than the win condition.  In a game that is
		// not so trivial it is important to insert a good scoring function

		// return callback( 0 );

		// even so, we are not going to return 0 because but we don't want the computer to just
		// play exactly the same each time. So we return a very very small score
		// so that the computer guides itself slightly differently each time it plays.

		return callback( Math.random() );

		// If we wanted to learn game-after-game then we'd keep track of the
		// moves we made each game in some database and then slightly change our
		// return score based on if that move led to a win or loss.

	}
}

