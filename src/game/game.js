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
        this.socket.on('leave', this.leave);
    }

    state = () => {
        return {
            'name': this.name,
            'active': this.active,
            'pocket': this.pocket,
        }
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

    leave = () => {
        this.game.leave(this);
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
    constructor(player, hand) {
        this.player = player
        this.hand = hand;
        this.folded = false;
        this.curBet = 0.0;
        this.acted = false;
        console.log(`${player.name} got hand ${hand}`);
    }
    
    state = () => {
        return {
            'hand': this.hand.map(card => card.toString()),
            'folded': this.folded,
            'curBet': this.curBet,
            'acted': this.acted
        }
    }
}

const Turns = {
    Preflop: "preflop",
    Flop: "flop",
    Turn: "turn",
    River: "river",
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
        this.curTurn = null;
    }
    state() {
        let playerStates = {};
        for (const [name, state] of Object.entries(this.playerStates))
            playerStates[name] = state.state();
        return {
            'pot': this.pot,
            'lastBet': this.lastBet,
            'raiseAmount': this.raiseAmount,
            'playerStates': playerStates,
        }
    }

    start() {
        this.deck.shuffle();
        this.players.forEach((player) => {
            player.newRound(this);
            this.playerStates[player.name] =
                new RoundPlayerState(player, this.deck.getCards(2));
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
        console.log(`cur table state pot: ${this.pot}`);
        for (let player in this.players)
            if (!player.folded && player.curBet != this.lastBet)
                return false;
        for (let player in this.players)
            if (!player.acted)
                return false;
        return true;
    }

    availActions(player) {
        return {};
    }

    async playersAction(startId) {
        let numPlayers = this.players.length;
        for (let player in this.playerStates.values)
            player.acted = false;
        for (let i = startId % numPlayers; !this.canEndTurn(); i = (i + 1) % numPlayers) {
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
        this.curTurn = Turns.Preflop;
        console.log('start preflop');
        let sb = this.players[0]
        this.bet(sb, 0.5);

        let bb = this.players[1]
        this.bet(bb, 1);

        this.playersAction(2);
    }

    flop() {
        this.curTurn = Turns.Flop;
        console.log('start flop');
    }

    turn() {
        this.curTurn = Turns.Turn;
        console.log('start turn');
    }

    river() {
        this.curTurn = Turns.River;
        console.log('start river');
    }
}