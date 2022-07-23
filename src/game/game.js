import { Deck } from "./deck.js";

export class Player {
    constructor(socket, name, game) {
        this.active = true
        this.socket = socket;
        this.name = name;
        this.game = game;
        this.pocket = 0.0
        this.actionResolve = null;

        this.socket.on('start_game', () => {
            game.start();
        });
        this.socket.on('buy_in', this.buyIn);
        this.socket.on('call', this.call);
        this.socket.on('bet', this.bet);
        this.socket.on('fold', this.fold);
        this.socket.on('temp_leave', this.tempLeave);
    }

    newRound = (round) => {
        this.curRound = round;
    }

    buyIn = (amount) => {
        this.pocket += parseFloat(amount);
        console.log(`${this.name} buyIn: ${amount}bb, pocket: ${this.pocket}`);
    }

    call = (amount) => {
        console.log(`${this.name} try to call`)
        this.curRound.call(this);
        this.actionResolve();
    }

    bet = (amount) => {
        console.log(`${this.name} try to bet ${amount}bb`)
        this.curRound.bet(this, parseFloat(amount));
        this.actionResolve();
    }

    fold = () => {
        this.curRound.fold(this);
        this.actionResolve();
    }

    tempLeave = () => {
        this.curRound.tempLeave(this);
    }

    actionNotify = (availActions, resolve) => {
        this.actionResolve = resolve;
        this.socket.emit('action_notify', availActions,
            () => {
                console.log(`waiting for ${this.name}'s action...`);
            }
        );
    }
}

export class Game {
    constructor() {
        this.curRound = null;
        this.players = [];
        console.log("new game created");
    }

    takeSeat = (player) => {
        this.players.push(player);
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
}

class RoundPlayerState {
    constructor(hand) {
        this.hand = hand;
        this.folded = false;
        this.curBet = 0.0;
    }
}

class Round {
    constructor(players) {
        this.pot = 0.0;
        this.lastBet = 0.0;
        this.raiseAmount = 0.0;
        this.deck = new Deck();
        // 0 is sb
        this.players = players;
        this.playerStates = {};
    }

    start() {
        this.deck.shuffle();
        this.players.forEach((player) => {
            player.newRound(this);
            this.playerStates[player.name] =
                new RoundPlayerState(this.deck.getCards(2));
        });
        this.preflop();
        this.flop();
        this.turn();
        this.river();
    }

    call(player) {
        let playerState = this.playerStates[player.name];
        console.assert(this.lastBet > playerState.curBet);
        this.pot += this.lastBet - playerState.curBet;
        playerState.curBet = this.lastBet;
    }

    bet(player, amount) {
        let playerState = this.playerStates[player.name];
        this.pot += amount;    
        this.raiseAmount = amount - this.lastBet;
        this.lastBet = amount;
        playerState.curBet = amount;
        player.pocket -= amount;
        console.log(`${player.name} bet: ${amount}bb, pocket left: ${player.pocket}`);
    }

    fold(player) {
        let playerState = this.playerStates[player.name];
        playerState.folded = true;
        console.log(`${player.name} fold!`);
    }

    canEndTurn() {
        console.log(`cur table state pot: ${this.pot}, rasieAmt: ${this.raiseAmount}`);
        if (this.raiseAmount != 0)
            return false;
        return true;
    }

    availActions(player) {
        return {};
    }

    async playersAction(startId) {
        let numPlayers = this.players.length;
        for (let i = startId % numPlayers; !this.canEndTurn(); i = (i + 1) % numPlayers){
            let player = this.players[i];
            console.log(`on player ${player.name}`)
            let playerState = this.playerStates[player.name];
            if (!playerState.folded) {
                await new Promise(resolve => {
                    player.actionNotify(this.availActions(), resolve);
                    setTimeout(resolve, 60000);
                });
            }
        }
    }

    preflop() {
        let sb = this.players[0]
        this.bet(sb, 0.5);

        let bb = this.players[1]
        this.bet(bb, 1);

        this.playersAction(2);
    }
    flop() {}
    turn() {}
    river() {}
}