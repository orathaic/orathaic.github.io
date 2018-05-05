"use strict";
class Community {
    constructor (x,y,neighbourhood, pixelsPerCommunity) {
	this.x = x
	this.y = y
	this.neighbourhood = neighbourhood 

	this.pixelsPerCommunity = pixelsPerCommunity

	this.centerX = (pixelsPerCommunity*(x + 0.5))
	this.centerY = (pixelsPerCommunity*(y + 0.5))
//	center () { return {(200*this.x + 100), (200*this.y + 100)} }

	this.lowerBound = this.centerX + pixelsPerCommunity/2
	this.upperBound = this.centerX - pixelsPerCommunity/2
	this.rightBound = this.centerY - pixelsPerCommunity/2
	this.leftBound = this.centerY + pixelsPerCommunity/2

	this.Creatures = {'green':[], 'blue':[], 'red':[]}
	this.neighbour = []
	this.getNeighbours()

	}

	getNeighbours () {
			this.neighbourhood.forEach(
		        candidate => {
					if(candidate.x == this.x) {
						if(candidate.y == this.y + 1) {this.neighbour['lower'] = candidate; candidate.neighbour['upper'] = this; }
						else if(candidate.y == this.y - 1) {this.neighbour['upper'] = candidate; candidate.neighbour['lower'] = this; }
					}
					else if(candidate.y == this.y) {
						if(candidate.x == this.x + 1) {this.neighbour['right'] = candidate; candidate.neighbour['left'] = this; }
						else if(candidate.x == this.x - 1) {this.neighbour['left'] = candidate; candidate.neighbour['right'] = this; }
					}
				}
			)
	}

	getCreatures () { 
		return [...this.Creatures.green, ...this.Creatures.blue, ...this.Creatures.red]
	}

	  toString () {
        return `This community: : ${this.x},${this.y} with ${this.Creatures['green'].length} Plants and ${this.Creatures['blue'].length} Herbivores. (${this.upperBound}, ${this.lowerBound}, ${this.rightBound}, ${this.leftBound})`
	}
}
