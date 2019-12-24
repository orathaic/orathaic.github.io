"use strict";
class Room {
    constructor (name) { 
	this.RoomName = name
	this.Users = []	
	}

	addUser ( username ) {
	this.Users.push (username) 
	}
}

class Lobby extends Room {
	constructor (name) {
	super (name)
	document.Lobby = this
	}

	display() {
//		console.log('dispalying lobby')
		document.getElementById('Menu').hide()
		let TheLobby = document.getElementById('Lobby')

	const markup = `
	<div class="list">
	Currently online:	
	 <ul>
	  ${this.Users.map(user=> `<li>${user}</li>`).join('')}
	 </ul>	
	</div>
	`;

	TheLobby.innerHTML = markup;
	TheLobby.show()
	}

}
