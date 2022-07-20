import { Deck } from "./deck.js";

export class Player {
    constructor(socket, name, game) {
        this.active = true
        this.socket = socket;
        this.name = name;
        this.game = game;
        this.socket.on('start_game', () => {
            game.start();
        });
    }

    newRound(state) {
        this.state = state;
    }

    bet(amount) {
        this.state.curBet = amount;
    }

    fold() {
        this.state.folded = true;
    }

    tempLeave() {
        this.active = false;
    }
}

export class Game {
    constructor() {
        this.curRound = null;
        this.players = [];
        console.log("new game created");
    }

    takeSeat(player) {
        this.players.push(player);
    }

    start() {
        this.newRound()
    }

    newRound() {
        console.log('new round')
        this.curRound = new Round(
            this.players.filter((player) => player.active));
        this.curRound.start();
    }
}

class RoundPlayerState {
    constructor(hand) {
        this.hand = hand;
        this.folded = false;
        this.curBet = 0.0;
        console.log(`got hand ${hand}`)
    }
}

class Round {
    constructor(players) {
        this.pot = 0
        this.deck = new Deck();
        // 0 is dealer
        this.players = players
        this.curPlayerId = players.length >= 4 ? 3 : players.length - 1;
    }

    start() {
        this.deck.shuffle();
        this.players.forEach((player) => {
            player.newRound(new RoundPlayerState(this.deck.getCards(2)))
        });
    }
}