"use strict";
class Creature {
    constructor (community,type,x,y,birthmark) {
       	//,['red','green','blue'][Math.floor(Math.random()*3)]
        if (['green','red','blue'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Creature type`)
        if (typeof x != 'number') throw new TypeError(`x: ${x} is not a number`)
        if (typeof y != 'number') throw new TypeError(`y: ${y} is not a number`)

        this.community = community
        this.type = type
        this.x = x
        this.y = y
        this.birthmark = birthmark

        this.energy = 90
    }

    ///////////////////////////////////////////////
    // Creature-Oriented //////////////////////////
    ///////////////////////////////////////////////
    step () {
        this.move()
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
		if (Math.floor(this.x/this.community.pixelsPerCommunity) != this.community.x || Math.floor(this.y/this.community.pixelsPerCommunity) != this.community.y) 
		{
			this.newCommunity = this.findCommunity( this.x, this.y ); 
			if(!this.newCommunity) this.die() 
			else this.relocate(this.newCommunity) } 
	}

	findCommunity (CreatureX, CreatureY) {
		var x,y
		x = Math.floor(CreatureX/this.community.pixelsPerCommunity)
		y = Math.floor(CreatureY/this.community.pixelsPerCommunity)
		for(var i = 0, l = mainNeighbourhood.length; i < l; i++)
			{ if(mainNeighbourhood[i].x == x && mainNeighbourhood[i].y == y) return mainNeighbourhood[i]}
		return false
	}
	
	edgeEffect (range) {
		var nextTargetCommunities = []
		//range // should be pushed into the constructor
		var communityWidth = this.community.pixelsPerCommunity
		if( (communityWidth * (this.community.x+1) - this.x)  < range)
			{
				nextTargetCommunities.push( this.findCommunity(this.community.x + range + 1, this.community.y) )
			}
		else if ( (this.x - communityWidth * (this.community.x-1))  < range)
			{
				nextTargetCommunities.push( this.findCommunity(this.community.x - range - 1, this.community.y) )
			}
		if( (communityWidth * (this.community.y+1) - this.y)  < range)
			{
				nextTargetCommunities.push( this.findCommunity(this.community.x, this.community.y + range + 1) )
			}
		else if ( (this.y - communityWidth * (this.community.y-1))  < range)
			{
				nextTargetCommunities.push( this.findCommunity(this.community.x, this.community.y - range - 1) )
			}
		// edge effects 
		if(nextTargetCommunities) return nextTargetCommunities 
		else return false
	}
}

class Carnivore extends Creature {
    constructor (community,type,x,y,birthmark) {
        if (['red'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Carnivore-Creature type`)
		
		super(community,type,x,y,birthmark)
        this.energy = 80

        community.Carnivores.push(this)

	}

    move () {
        if (this.energy > 0) {
            this.x += Math.round(( Math.random() - 0.5 ) * (22))
            this.y += Math.round(( Math.random() - 0.5 ) * (22))
            this.energy -= 1
        } 
        else {
            this.energy -= 1
        }
        if (this.energy < -100) {
            this.die()
        }
    }

    eat () {
		const range = 12 // should be in constructor.
		var target = this.community.Herbis

		var extraTargetCommunities = this.edgeEffect(range)
		while(extraTargetCommunities[0]) { var next = extraTargetCommunities.shift(); target.concat(next.Herbis) } 
		
        target.filter(
            candidate => Math.abs(candidate.x - this.x) < range && Math.abs(candidate.y - this.y) < range
        ).forEach(prey => {
            prey.die()
            this.energy += 45
        })
    }

    reproduce () {
        if (this.energy > 100) {
            new Carnivore(this.community,this.type,Math.floor(this.x+((Math.random()-0.5)*8) ),Math.floor(this.y+(Math.random()-0.5)*8),this.energy)
            this.energy -= 100
        }
    }

    die () {
        var index = this.community.Carnivores.indexOf(this)
        if (index >= 0) {
            this.community.Carnivores.splice(index,1)
        }
        else {
            throw new Error('Creature community corruption error.')
        }
    }

	relocate (newNeighbourhood) {
		    var index = this.community.Carnivores.indexOf(this)
		    if (index >= 0) {
		        this.community.Carnivores.splice(index,1)
		    }
		    else {
		        throw new Error('Creature community corruption error.')
		    }
		newNeighbourhood.Carnivores.push(this)
		this.community = newNeighbourhood
		this.die()
	}
}

class Herbi extends Creature {
    constructor (community,type,x,y,birthmark) {
        if (['blue'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Herbi-Creature type`)
		
		super(community,type,x,y,birthmark)
        this.energy = 40

        community.Herbis.push(this)

	}

    move () {
        if (this.energy > 0) {
            this.x += Math.round(( Math.random() - 0.5 ) * (20))
            this.y += Math.round(( Math.random() - 0.5 ) * (20))
            this.energy -= 1
        } 
        else {
            this.energy -= 1
        }
        if (this.energy < -100) {
            this.die()
        }
    }

    eat () {
		const range = 10 // should be in constructor.
		var target = this.community.Plants

		var extraTargetCommunities = this.edgeEffect(range)
		while(extraTargetCommunities[0]) { var next = extraTargetCommunities.shift(); target.concat(next.Plants) } 

        target.filter(
            candidate => Math.abs(candidate.x - this.x) < range && Math.abs(candidate.y - this.y) < range
        ).forEach(prey => {
            prey.die()
            this.energy += 30
        })
    }

    reproduce () {
        if (this.energy > 100) {
			if(Math.random() * 100 > 0.05) {
            new Herbi(this.community,this.type,Math.floor(this.x+Math.random()*4-2),Math.floor(this.y+Math.random()*4-2),this.energy)
            this.energy -= 100
			}
			else {new Carnivore(this.community,"red",Math.floor(this.x+Math.random()*4-2),Math.floor(this.y+Math.random()*4-2),this.energy)
			}
        }
    }

    die () {
        var index = this.community.Herbis.indexOf(this)
        if (index >= 0) {
            this.community.Herbis.splice(index,1)
        }
        else {
            throw new Error('Creature community corruption error.')
        }
    }
	relocate (newNeighbourhood) {
		    var index = this.community.Herbis.indexOf(this)
		    if (index >= 0) {
		        this.community.Herbis.splice(index,1)
		    }
		    else {
		        throw new Error('Creature community corruption error.')
		    }
		newNeighbourhood.Herbis.push(this)
		this.community = newNeighbourhood
	}
}

class Plant extends Creature {
    constructor (community,type,x,y,birthmark) {
        if (['green'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Plant-Creature type`)
		
		super(community,type,x,y,birthmark)

        this.energy = 40

        community.Plants.push(this)
    }

    eat () {
			const range = 12 // should be in constructor.
			var target = this.community.Plants

			var extraTargetCommunities = this.edgeEffect(range)
			while(extraTargetCommunities[0]) { 
											var next = extraTargetCommunities.shift(); 
											target.concat(next.Plants) 
										} 


			this.energy +=11 // mmm solar power
			target.filter(
            candidate => Math.abs(candidate.x - this.x) < range && Math.abs(candidate.y - this.y) < range && this.distanceTo(candidate) < range*range && candidate != this
        	).forEach(competition => {
            this.energy -= 2
        })
	}

    move () {
        if (this.energy < -100) {
            this.die()
        }
    }

    reproduce () {
        if (this.energy > 120) { 
			{if(Math.random() * 100 > 0.1) 
	            new Plant(this.community,this.type,Math.round(this.x+(Math.random() - 0.5 )*64),Math.floor(this.y+(Math.random() - 0.5)*64),this.energy)
			else new Herbi (this.community,"blue",Math.round(this.x+(Math.random() - 0.5 )*64),Math.floor(this.y+(Math.random() - 0.5)*64),this.energy)
			}            
			this.energy -= 100
        }
	}

    die () {
        var index = this.community.Plants.indexOf(this)
        if (index >= 0) {
            this.community.Plants.splice(index,1)
        }
        else {
            throw new Error('Creature community corruption error.')
        }
    }

	relocate (newNeighbourhood) {
		newNeighbourhood.Plants.push(this)
		    var index = this.community.Plants.indexOf(this)
		    if (index >= 0) {
		        this.community.Plants.splice(index,1)
		    }
		    else {
		        throw new Error('Creature community corruption error.')
		    }
		this.community = newNeighbourhood
	}
}
