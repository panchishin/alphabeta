(function(){

var MAX_SCORE = Math.pow(10,50);

function scoreModifier( moveDepth ) {
	return ( moveDepth % 2 ) * 2 - 1  // odd levels are players move, even are opponent
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
	var prefer = workItem

	function updateParentAlphaBeta( score , parent ) {
		var logic = parent.depth % 2 == 0 ? maximizeLogic : minimizeLogic
		
		if ( logic.isPrune(score,parent) ) {
			topLevel = prune( parent.depth , workQueue )
		} 
		if ( logic.isUpdate(score,parent) ) {
			logic.doUpdate(score,parent)
			parent.best = workItem
			parent.prefer = prefer
		} else {
			score = logic.getElseScore(parent)
			workItem = parent.best
		}
		return score
	}

	while( parent && parent.depth >= topLevel ) {
		score = updateParentAlphaBeta(score,parent)
		prefer = parent
		parent = parent.previous					
	}

}

function expandWorkItem( generateMoves , workItem , workQueue ) {

	if ( workItem.previous ) {
		workItem.alpha = workItem.previous.alpha
		workItem.beta = workItem.previous.beta
	}

	var moves = generateMoves( workItem.move )
	for ( var i = moves.length - 1 ; i >= 0 ; i-- ) {
		var move = moves[i]
		workQueue.unshift({ 
			move : move , 
			depth : workItem.depth + 1 , 
			previous : workItem , 
			alpha : workItem.alpha , 
			beta : workItem.beta ,
			best : workItem.best
		})
	}
	return moves.length;
	
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
		scoreFunction( workItem.move , function( score ) { 
			workItem.score = score * scoreModifier( workItem.depth )				
			workQueue.unshift(workItem)
			callback(true);
		})
	}
	
	
	return {
		setup : function setup( move , depthParameter , alpha , beta ) {
			start = move
			alpha = alpha == undefined ? Number.NEGATIVE_INFINITY : alpha
			beta  = beta  == undefined ? Number.POSITIVE_INFINITY : beta
			workQueue = [ { move : move , depth : 0 , alpha : alpha , beta : beta } ]
			depth = depthParameter ? depthParameter : 1
			top = workQueue[0]
		},

		prediction : function prediction() {
			return top.best || {}
		},

		best : function best() {
			if ( ! top.best || ! top.best.move ) { return false }
			if ( ! top.prefer || ! top.prefer.move ) { return false }
			return top.prefer.move;
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

			} else if ( workItem.depth > 0 && checkWinConditions( workItem.move ) ) {

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
		
		allSteps : function allSteps( callback , count ) {
			count = count ? count : 0
			var that = this
			that.step( function( hasMore ) {
				if ( hasMore ) {
					if ( count > 20 ) {
						setTimeout( function() { that.allSteps(callback) } , 1 )
					} else {
						that.allSteps(callback,count+1)
					}
				} else {
					callback(that.best())
				}
			})
		}
	}
}

})();