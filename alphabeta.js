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

function expandWorkItem( generateMoves , workItem , workQueue ) {

	if ( workItem.previous ) {
		workItem.alpha = workItem.previous.alpha
		workItem.beta = workItem.previous.beta
	}

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

module.exports = function alphabeta( initialization ) {

	var scoreFunction = initialization.scoreFunction
	var generateMoves = initialization.generateMoves
	var checkWinConditions = initialization.checkWinConditions

	var workQueue = []
	var depth = 0
	var top = {}
	var start = {}

	function scoreWorkItem( workItem , callback ) {
		scoreFunction( workItem.state , function( score ) { 
			workItem.score = score * scoreModifier( workItem.depth )				
			workQueue.unshift(workItem)
			callback(true);
		})
	}
	
	
	return {
		setup : function setup( params ) {
			params = typeof params == "object" ? params : { state : {} }
			start = params.state
			params.alpha = params.alpha == undefined ? Number.NEGATIVE_INFINITY : params.alpha
			params.beta  = params.beta  == undefined ? Number.POSITIVE_INFINITY : params.beta
			workQueue = [ { state : params.state , depth : 0 , alpha : params.alpha , beta : params.beta } ]
			depth = params.depth ? params.depth : 1
			top = workQueue[0]
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
			if ( ! workItem ) { callback(false); return }

			if ( workItem.score != undefined ) {

				updateAllParentsAlphaBetaBasedOnScore( workItem , workQueue );
				callback(true); return

			} else if ( workItem.depth > 0 && checkWinConditions( workItem.state ) ) {

				workItem.score = MAX_SCORE * scoreModifier( workItem.depth )
				workQueue.unshift(workItem)
				callback(true); return
				
			} else if ( workItem.depth < depth ) {
				
				if ( expandWorkItem( generateMoves , workItem , workQueue) == 0 ) {
					scoreWorkItem( workItem , callback )
					return;
				} else {
					callback(true); return
				}
				
			} else if ( workItem.depth == depth ) {

				scoreWorkItem( workItem , callback )
				return;
				
			}
			callback(false)
		},
		
		_stepUntilTime : function stepUntilTime( callback , timeout , count ) {
			var that = this
			that.step( function( hasMore ) {
				if ( hasMore && timeout > (new Date()).getTime() ) {
					if ( count > 20 ) {
						setTimeout( function() { that._stepUntilTime( callback , timeout , 0 ) } , 1 )
					} else {
						that._stepUntilTime( callback, timeout , count+1 )
					}
				} else {
					callback(that.best())
				}
			})
		},

		stepForMilliseconds : function stepForMilliseconds( milliseconds , callback ) {
			this._stepUntilTime( callback , (new Date()).getTime() + milliseconds , 0 )
		},

		allSteps : function allSteps( callback ) {
			this._stepUntilTime( callback , Number.POSITIVE_INFINITY , 0 )
		}
	}
}

})();