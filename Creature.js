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
		this.community.boundTest(this)
    }

	distanceTo (target) {
		return (Math.pow(Math.abs(target.x - this.x),2) + Math.pow(Math.abs(target.y - this.y),2)) //euclidean distance squared
	}
    ///////////////////////////////////////////////

    ///////////////////////////////////////////////
    // Debug //////////////////////////////////////
    ///////////////////////////////////////////////
    toString () {
        return `Behold: ${this.type} creature, at (${Math.round(this.x)}x${Math.round(this.y)}), feeling ${Math.round(this.energy)}.` + (typeof this.birthmark != 'undefined' ? ` ((( ${Math.round(this.birthmark)} )))` : '')
    }
    ///////////////////////////////////////////////
}

class Carnivore extends Creature {
    constructor (community,type,x,y,birthmark) {
        if (['red'].indexOf(type) < 0) throw new TypeError(`type: ${type} is not a valid Carnivore-Creature type`)
		
		super(community,type,x,y,birthmark)
        this.energy = 40

        community.Carnivores.push(this)

	}

    move () {
        if (this.energy > 0) {
            this.x += Math.round(( Math.random() - 0.5 ) * (10))
            this.y += Math.round(( Math.random() - 0.5 ) * (10))
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
        this.community.Herbis.filter(
            candidate => Math.abs(candidate.x - this.x) < 2 && Math.abs(candidate.y - this.y) < 2
        ).forEach(prey => {
            prey.die()
            this.energy += 90
        })
    }

    reproduce () {
        if (this.energy > 100) {
            new Carnivore(this.community,this.type,Math.floor(this.x+Math.random()*4-2),Math.floor(this.y+Math.random()*4-2),this.energy)
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

	relocate (oldNeighbourhood, newNeighbourhood) {
		this.newNeighbourhood.Carnivores.push(this)
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
            this.x += Math.round(( Math.random() - 0.5 ) * (10))
            this.y += Math.round(( Math.random() - 0.5 ) * (10))
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
        this.community.Plants.filter(
            candidate => Math.abs(candidate.x - this.x) < 2 && Math.abs(candidate.y - this.y) < 2
        ).forEach(prey => {
            prey.die()
            this.energy += 90
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
	relocate (oldNeighbourhood, newNeighbourhood) {
		this.newNeighbourhood.Herbis.push(this)
		this.community = newNeighbourhood
		this.die()
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
			this.energy +=11 // mmm solar power
			this.community.Plants.filter(
            candidate => Math.abs(candidate.x - this.x) < 12 && Math.abs(candidate.y - this.y) < 12 && this.distanceTo(candidate) < 144 && candidate != this
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
	            new Plant(this.community,this.type,Math.round(this.x+(Math.random() - 0.5 )*36),Math.floor(this.y+(Math.random() - 0.5)*24),this.energy)
			else new Herbi (this.community,"blue",Math.round(this.x+(Math.random() - 0.5 )*36),Math.floor(this.y+(Math.random() - 0.5)*24),this.energy)
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
	relocate (oldNeighbourhood, newNeighbourhood) {
		this.newNeighbourhood.Plants.push(this)
		this.community = newNeighbourhood
		this.die()
	}
}

class Community {
    constructor (x,y,neighbourhood) {
	this.x = x
	this.y = y
	this.neighbourhood = neighbourhood 


	this.centerX = (200*x + 100)
	this.centerY = (200*y + 100)
//	center () { return {(200*this.x + 100), (200*this.y + 100)} }

	this.lowerBound = this.centerX + 100
	this.upperBound = this.centerX - 100
	this.rightBound = this.centerY - 100
	this.leftBound = this.centerY + 100

	this.Plants = []
	this.Herbis = []
	this.Carnivores = []
	this.neighbour = []
	this.getNeighbours()

	}

	getNeighbours () {
			this.neighbourhood.forEach(
		        candidate => {
					if(candidate.x == this.x) {
						if(candidate.y == this.y + 1) this.neighbour['upper'] = candidate; 
						else if(candidate.y == this.y - 1) this.neighbour['lower'] = candidate;
					}
					else if(candidate.y == this.y) {
						if(candidate.x == this.x + 1) this.neighbour['right'] = candidate; 
						else if(candidate.x == this.x - 1) this.neighbour['left'] = candidate;
						
					}
				}
			)

	}

	getCreatures () { 
		return this.Plants.concat(this.Herbis).concat(this.Carnivores)
	}

	boundTest (creature) {
		if (creature.x > this.lowerBound)
		{ if(this.neighbour['lower'] == undefined) creature.die(); else { creature.relocate(this, this.neighbour['lower']) } 
		}
		else if (creature.x < this.upperBound)
		{ if(this.neighbour['upper'] == undefined) creature.die(); else { creature.relocate(this, this.neighbour['upper']) } 
		}
		else if (creature.y > this.leftBound)
		{ if(this.neighbour['left'] == undefined) creature.die(); else { creature.relocate(this, this.neighbour['left']) } 
		}
		else if (creature.y < this.rightBound)
		{ if(this.neighbour['right'] == undefined) creature.die(); else { creature.relocate(this, this.neighbour['right']) } 
		}
	}
}
