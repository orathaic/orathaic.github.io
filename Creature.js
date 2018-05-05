"use strict";
class Creature {
    constructor (type,x,y,birthmark) {
        if (['green','red','blue'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Creature type`)
        if (typeof x != 'number') throw new TypeError(`x: ${x} is not a number`)
        if (typeof y != 'number') throw new TypeError(`y: ${y} is not a number`)

        this.community = this.findCommunity(x, y)
        this.type = type

		if(this.community) this.community.Creatures[this.type].push(this)		

        this.moveDistance = 0

        this.x = x
        this.y = y

        this.birthmark = birthmark
    }

    step () {
        this.move( this.moveDistance )
        this.eat()
        this.reproduce()
		this.boundTest()
    }

	distanceTo (target) {
		return (Math.pow(Math.abs(target.x - this.x),2) + Math.pow(Math.abs(target.y - this.y),2)) //euclidean distance squared
	}
    ///////////////////////////////////////////////
    ///////////////////////////////////////////////
    // Debug //////////////////////////////////////
    ///////////////////////////////////////////////
    toString () {
        return `Behold: ${this.type} creature, at (${Math.round(this.x)},${Math.round(this.y)}), feeling ${Math.round(this.energy)}.` + (typeof this.birthmark != 'undefined' ? ` ((( ${Math.round(this.birthmark)} )))` : '')
    }
    ///////////////////////////////////////////////
	boundTest () {
		if (Math.floor(this.x/pixelsPerCommunity) != this.community.x || Math.floor(this.y/pixelsPerCommunity) != this.community.y) 
		{
			this.newCommunity = this.findCommunity( this.x, this.y ); 
			if(!this.newCommunity) this.die() 
			else this.relocate(this.newCommunity) } 
	}
	
	move ( distance ) {
        if (this.energy > 0) {
            this.x += Math.round(( Math.random() - 0.5 ) * (distance))
            this.y += Math.round(( Math.random() - 0.5 ) * (distance))
            this.energy -= 10
        } 
        else {
            this.energy -= 1
        }
        if (this.energy < -100) {
            this.die()
        }
    }

	relocate (newNeighbourhood) {
	//	var type = this.typeName
	    var index = this.community.Creatures[this.type].indexOf(this)
	    if (index >= 0) {
	        this.community.Creatures[this.type].splice(index,1)
	    }
	    else {
	        throw new Error('Creature community corruption error.')
	    }
	newNeighbourhood.Creatures[this.type].push(this)
	this.community = newNeighbourhood
	}

    die () {
        var index = this.community.Creatures[this.type].indexOf(this)
        if (index >= 0) {
            this.community.Creatures[this.type].splice(index,1)
        }
        else {
            throw new Error('Creature community corruption error.')
        }
    }
	
	findCommunity (CreatureX, CreatureY) {
		var x,y
		x = Math.floor(CreatureX/pixelsPerCommunity)
		y = Math.floor(CreatureY/pixelsPerCommunity)
		for(var i = 0, l = mainNeighbourhood.length; i < l; i++)
			{ if(mainNeighbourhood[i].x == x && mainNeighbourhood[i].y == y) return mainNeighbourhood[i]}
		return false
	}
	
	addEdgeCommunities (range, targetArray) { 		// edge effects 
		var next, communityWidth = pixelsPerCommunity 
		if( (communityWidth * (this.community.x+1) - this.x)  < range)
			{
				next =  this.findCommunity(this.community.x + range + 1, this.community.y)
				if(next) targetArray.push(next)
			}
		else if ( (this.x - communityWidth * (this.community.x))  < range)
			{
				next = this.findCommunity(this.community.x - range - 1, this.community.y)
				if(next) targetArray.push(next)
			}
		if( (communityWidth * (this.community.y+1) - this.y)  < range)
			{
				next = this.findCommunity(this.community.x, this.community.y + range + 1)
				if(next) targetArray.push(next)
			}
		else if ( (this.y - communityWidth * (this.community.y))  < range)
			{
				next = this.findCommunity(this.community.x, this.community.y - range - 1) 
				if(next) targetArray.push(next)
			}
	}
}

class Carnivore extends Creature {
    constructor (type,x,y,birthmark) {
        if (['red'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Carnivore-Creature type`)
		
		super(type,x,y,birthmark)	
        this.energy = 80
		this.moveDistance = 22
		this.range=12
	}

    eat () {
		const range = this.range
		var targetCommunities = [this.community]
		this.addEdgeCommunities(range, targetCommunities) 

		for(var i = 0, l = targetCommunities.length; i < l; i++)
		{
			targetCommunities[i].Creatures['blue'].filter(
				candidate => Math.abs(candidate.x - this.x) < range && Math.abs(candidate.y - this.y) < range
			).forEach(prey => {
		
				prey.energy -= 80
				this.energy -= 20
				if(prey.energy < -10)            
				{
					this.energy += 50
				}
			})
		}
    }

    reproduce () {
        if (this.energy > 100) {
            new Carnivore(this.type,Math.floor(this.x+((Math.random()-0.5)*8) ),Math.floor(this.y+(Math.random()-0.5)*8),this.energy)
            this.energy -= 90
        }
    }
}

class Herbi extends Creature {
    constructor (type,x,y,birthmark) {
        if (['blue'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Herbi-Creature type`)
		
		super(type,x,y,birthmark)
        this.energy = 80
		this.moveDistance = 20
		this.range = 10		
	}

    eat () {
		const range = this.range
		var targetCommunities = [this.community]
		this.addEdgeCommunities(range, targetCommunities)

		for(var i = 0, l = targetCommunities.length; i < l; i++)
		{
			targetCommunities[i].Creatures['green'].filter(
				candidate => Math.abs(candidate.x - this.x) < range && Math.abs(candidate.y - this.y) < range
			).forEach(prey => {
				prey.energy -= 40
				this.energy += 10
			})
		}
	}

    reproduce () {
        if (this.energy > 100) {
			if(Math.random() * 100 > 0.2) {
            new Herbi(this.type,Math.floor(this.x+Math.random()*4-2),Math.floor(this.y+Math.random()*4-2),this.energy)
            this.energy -= 90
			}
			else {new Carnivore("red",Math.floor(this.x+Math.random()*4-2),Math.floor(this.y+Math.random()*4-2),this.energy)
			}
        }
    }
}

class Plant extends Creature {
    constructor (type,x,y,birthmark) {
        if (['green'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Plant-Creature type`)
		
		super(type,x,y,birthmark)

        this.energy = 45
		this.moveDistance = 0
		this.range = 12
    }

    eat () {
			const range = this.range
			var targetCommunities = [this.community]
			this.addEdgeCommunities(range, targetCommunities)

			this.energy +=11 // mmm solar power

			for(var i = 0, l = targetCommunities.length; i < l; i++)
			{
				targetCommunities[i].Creatures['green'].filter(
		        	candidate => Math.abs(candidate.x - this.x) < range && Math.abs(candidate.y - this.y) < range 
					&& this.distanceTo(candidate) < range*range && candidate != this
		    	).forEach(competition => {
		        	this.energy -= 2
				})
			}
	}

    move ( ) {
        if (this.energy < -100) {
            this.die()
        }
    }

    reproduce () {
        if (this.energy > 120) { 
			{if(Math.random() * 100 > 0.1) 
	            new Plant(this.type,Math.round(this.x+(Math.random() - 0.5 )*64),Math.floor(this.y+(Math.random() - 0.5)*64),this.energy)
			else new Herbi ("blue",Math.round(this.x+(Math.random() - 0.5 )*64),Math.floor(this.y+(Math.random() - 0.5)*64),this.energy)
			}            
			this.energy -= 90
        }
	}
}
