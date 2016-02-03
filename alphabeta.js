(function(){

var MAX_SCORE = Math.pow(10,50);

function scoreModifier( stateDepth ) {
	return ( stateDepth % 2 ) * 2 - 1  // odd levels are players state, even are opponent
}

function calculateTopLevel( workQueue ) { 
	return workQueue[0] ? Math.max( workQueue[0].depth - 1 , 0 ) : 0
}

function prune( depth , workQueue ) {
	while( workQueue[0] && workQueue[0].depth > depth ) {
		workQueue.shift()
	}
	return calculateTopLevel(workQueue)
}

var maximizeLogic = {
	isPrune : function( score , parent ) { return score >= parent.beta },
	isUpdate : function( score , parent ) { return score > parent.alpha },
	doUpdate : function( score , parent ) { parent.alpha = score },
	getElseScore : function( parent ) { return parent.alpha }
}

var minimizeLogic = {
	isPrune : function( score , parent ) { return score <= parent.alpha },
	isUpdate : function( score , parent ) { return score < parent.beta },
	doUpdate : function( score , parent ) { parent.beta = score },
	getElseScore : function( parent ) { return parent.beta }
}

function updateAllParentsAlphaBetaBasedOnScore( workItem , workQueue ) {

	// update the previous minimax scores
	var topLevel = calculateTopLevel(workQueue)
	var score = workItem.score
	var parent = workItem.previous
	var best = workItem

	function updateParentAlphaBeta( score , parent ) {
		var logic = parent.depth % 2 == 0 ? maximizeLogic : minimizeLogic
		
		if ( logic.isPrune(score,parent) ) {
			topLevel = prune( parent.depth , workQueue )
		} 
		if ( logic.isUpdate(score,parent) ) {
			logic.doUpdate(score,parent)
			parent.prediction = workItem
			parent.best = best
		} else {
			score = logic.getElseScore(parent)
			workItem = parent.prediction
		}
		return score
	}

	while( parent && parent.depth >= topLevel ) {
		score = updateParentAlphaBeta(score,parent)
		best = parent
		parent = parent.previous					
	}

}

function expandWorkItem( generateMoves , workItem , workQueue , uniqueKey , keyList ) {

	if ( workItem.previous ) {
		workItem.alpha = workItem.previous.alpha
		workItem.beta = workItem.previous.beta
	}

	if ( uniqueKey != undefined && keyList[uniqueKey(workItem.state)] == true ) {
		return 0
	}
	if ( uniqueKey ) keyList[uniqueKey(workItem.state)] = true

	var stateList = generateMoves( workItem.state )
	for ( var i = stateList.length - 1 ; i >= 0 ; i-- ) {
		var state = stateList[i]
		workQueue.unshift({ 
			state : state , 
			depth : workItem.depth + 1 , 
			previous : workItem , 
			alpha : workItem.alpha , 
			beta : workItem.beta ,
			prediction : workItem.prediction
		})
	}
	return stateList.length;
	
}

function alphabetaConstructor( initialization ) {

	var scoreFunction = function(callback) { callback(0) }
	var generateMoves = function() { return [] }
	var checkWinConditions = function() { return false }
	var uniqueKey = undefined
	var keyList = {}
	var start = {}
	var depth = 1
	var startAlpha = Number.NEGATIVE_INFINITY
	var startBeta = Number.POSITIVE_INFINITY
	var workQueue = []
	var top = {}

	function valueOr( value , _default ) {
		return value ? value : _default
	}

	function setInitialization( initialization ) {
		initialization = valueOr( initialization , {} )
		scoreFunction = valueOr( initialization.scoreFunction , scoreFunction )
		generateMoves = valueOr( initialization.generateMoves , generateMoves )
		uniqueKey = valueOr( initialization.uniqueKey , uniqueKey )
		keyList = {}

		checkWinConditions = valueOr( initialization.checkWinConditions , checkWinConditions )
		start = valueOr( initialization.state , start )
		depth = valueOr( initialization.depth , depth )
		startAlpha = valueOr( initialization.alpha , startAlpha )
		startBeta = valueOr( initialization.beta , startBeta )

		workQueue = [ { state : start , depth : 0 , alpha : startAlpha , beta : startBeta } ]
		top = workQueue[0]
	}

	setInitialization( initialization )


	function scoreWorkItem( workItem , callback ) {
		scoreFunction( workItem.state , function( score ) { 
			workItem.score = score * scoreModifier( workItem.depth )				
			workQueue.unshift(workItem)
			callback();
		})
	}
	
	
	return {
		clone : function setup( initialization ) {
			return alphabetaConstructor( {
				initialization : initialization,
				scoreFunction : scoreFunction,
				generateMoves : generateMoves,
				checkWinConditions : checkWinConditions,
				uniqueKey : uniqueKey,
				state : start,
				depth : depth,
				startAlpha : startAlpha,
				startBeta : startBeta
			}).setup( initialization )
		},

		setup : function setup( initialization ) {
			setInitialization( initialization )
			return this
		},

		prediction : function prediction() {
			return top.prediction || {}
		},

		best : function best() {
			if ( ! top.prediction || ! top.prediction.state ) { return false }
			if ( ! top.best || ! top.best.state ) { return false }
			return top.best.state;
		},

		alpha : function alpha() {
			return top.alpha 
		},
		
		step : function step( callback ) {
			var workItem = workQueue.shift()
			if ( ! workItem ) { 
				callback( this.best() ) 
				return this 
			}

			if ( workItem.score != undefined ) {

				updateAllParentsAlphaBetaBasedOnScore( workItem , workQueue )
				callback()
				return this

			} else if ( workItem.depth > 0 && checkWinConditions( workItem.state ) ) {

				workItem.score = MAX_SCORE * scoreModifier( workItem.depth )
				workQueue.unshift(workItem)
				callback()
				return this
				
			} else if ( workItem.depth < depth ) {
				
				if ( expandWorkItem( generateMoves , workItem , workQueue , uniqueKey , keyList ) == 0 ) {
					scoreWorkItem( workItem , callback )
					return this
				} else {
					callback()
					return this
				}
				
			} else { // if ( workItem.depth >= depth ) {

				scoreWorkItem( workItem , callback )
				return this
				
			}
		},
		
		_stepUntilTime : function stepUntilTime( timeout , callback , count ) {
			count = count ? count : 0
			var that = this
			return this.step( function( bestMove ) {
				if ( bestMove === undefined && timeout > (new Date()).getTime() ) {
					if ( count > 20 ) {
						setTimeout( function() { that._stepUntilTime( timeout , callback , 0 ) } , 1 )
					} else {
						that._stepUntilTime( timeout , callback, count+1 )
					}
				} else {
					callback(bestMove)
				}
			})
		},

		stepForMilliseconds : function stepForMilliseconds( milliseconds , callback ) {
			return this._stepUntilTime( (new Date()).getTime() + milliseconds , callback )
		},

		incrimentDepthForMilliseconds : function incrimentDepthForMilliseconds( milliseconds , callback , previous ) {
			var that = this
			previous = previous ? previous : {
				alphabeta : this,
				depth : depth - 1
			}

			var endTime = (new Date()).getTime() + milliseconds

			// create a new 
			var alphabeta = that.clone( { depth : previous.depth + 1 } )
			
			return alphabeta._stepUntilTime( endTime , function( bestState ) {
				var timeLeft = endTime - (new Date()).getTime()
				var result = { alphabeta : alphabeta , depth : previous.depth + 1 }
				if ( timeLeft > 0 && bestState != undefined ) {
					setTimeout( function() {
						alphabeta.incrimentDepthForMilliseconds( 
							timeLeft , callback , result
						)
					}, 1)
				} else if ( bestState != undefined ) {
					return callback( result )
				} else {
					previous["incomplete"] = result
					return callback( previous )
				}
			})
		},

		allSteps : function allSteps( callback ) {
			return this._stepUntilTime( Number.POSITIVE_INFINITY , callback )
		}
	}
}

module.exports = alphabetaConstructor

})();
