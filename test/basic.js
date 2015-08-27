var alphabetaConstructor = require("../alphabeta.js")

module.exports = {


	'alphabeta is a function' : function(beforeExit, assert) {
		assert.equal('function', typeof alphabetaConstructor)
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

		var n = 0;
		alphabeta.allSteps( function( bestMove ) {
			n++;
			assert.equal( false , bestMove )
		})

	    beforeExit(function() {
	        assert.equal(1, n, 'Ensure timeout is called');
	    });
	},


	'complete successfully for no available moves via setup' : function(beforeExit, assert) {

		var alphabeta = alphabetaConstructor( {} )

		alphabeta.setup( { 
			scoreFunction : function(state , callback) { callback(0) },
			generateMoves : function(state) { return [] },
			checkWinConditions : function(state) { return false }
		} );

		var n = 0;
		alphabeta.allSteps( function( bestMove ) {
			n++;
			assert.equal( false , bestMove )
		})

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

		var n = 0;
		alphabeta.allSteps( function( bestMove ) {
			n++;
			assert.equal( onlyMove , bestMove )
		})

	    beforeExit(function() {
	        assert.equal(1, n, 'Ensure timeout is called');
	    });
	},


	'complete successfully for second call to allSteps' : function(beforeExit, assert) {

		var onlyMove = { move : "only" }

		var alphabeta = alphabetaConstructor( { 
			scoreFunction : function(state , callback) { return callback(0) },
			generateMoves : function(state) { return [ onlyMove ] },
			checkWinConditions : function(state) { return JSON.toString(state) == JSON.toString(onlyMove) }
		} );

		var n = 0;
		alphabeta.allSteps( function( bestMove ) {
			n++;
			assert.equal( onlyMove , bestMove )
			alphabeta.allSteps( function( bestMove ) {
				n++;
				assert.equal( onlyMove , bestMove )
			})
		})

	    beforeExit(function() {
	        assert.equal(2, n, 'Ensure timeout is called');
	    });
	}
}