//var assert = require("assert")
var alphabetaConstructor = require("../alphabeta.js")

module.exports = {


	'alphabeta is a function' : function(beforeExit, assert) {
		assert.equal('function', typeof alphabetaConstructor)
	},

	'constructor creates object' : function(beforeExit, assert) {

		var alphabeta = alphabetaConstructor( { } );

		assert.equal('object' , typeof alphabeta )
	},


	'constructor creates object' : function(beforeExit, assert) {

		var alphabeta = alphabetaConstructor( { } );

		assert.equal('object' , typeof alphabeta )
	},


	'complete successfully for no available moves' : function(beforeExit, assert) {

		var alphabeta = alphabetaConstructor( { 
			scoreFunction : function(state , callback) { callback(0) },
			generateMoves : function(state) { return [] },
			checkWinConditions : function(state) { return false }
		} );

		alphabeta.setup( {} , 3 )
		var n = 0;
		alphabeta.allSteps( function( bestMove ) {
			n++;
			assert.equal( false , bestMove )
		})

	    // Alternatively, you can use the beforeExit shortcut.
	    beforeExit(function() {
	        assert.equal(1, n, 'Ensure timeout is called');
	    });
	},


	'complete successfully for instant win condition' : function(beforeExit, assert) {

		var onlyMove = { move : "only" }

		var alphabeta = alphabetaConstructor( { 
			scoreFunction : function(state , callback) { return callback(0) },
			generateMoves : function(state) { return [ onlyMove ] },
			checkWinConditions : function(state) { return JSON.toString(state) == JSON.toString(onlyMove) }
		} );

		alphabeta.setup( {} , 3 )
		var n = 0;
		alphabeta.allSteps( function( bestMove ) {
			n++;
			assert.equal( onlyMove , bestMove )
		})

	    // Alternatively, you can use the beforeExit shortcut.
	    beforeExit(function() {
	        assert.equal(1, n, 'Ensure timeout is called');
	    });
	}

}
