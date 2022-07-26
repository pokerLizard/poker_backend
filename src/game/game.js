import { Round } from "./round.js";

export class Game {
    constructor(io) {
        this.io = io;
        this.curRound = null;
        this.players = [];
        console.log("new game created");
        setInterval(()=>{
            io.emit('state_update', this.state());
        }, 100);
    }

    state = () => {
        return {
            'players': this.players.map(player => player.state()),
            'curRound': this.curRound != null ? this.curRound.state() : null,
        }
    }

    takeSeat = (player) => {
        this.players.push(player);
    }

    leave = (player) => {
        console.log(`${player.name} leave the game`);
        this.players.splice(this.players.indexOf(player), 1);
        this.curRound?.leave(player);
    }

    start = () => {
        this.newRound()
    }

    newRound = () => {
        console.log('new round')
        this.curRound = new Round(
            this.players.filter((player) => player.active));
        this.curRound.start();
    }

    isPlayerInGame = (playerName) => {
        return this.players.find(player => player.name == playerName);
    }
}