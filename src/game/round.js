import { Deck } from "./deck.js";

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

export class Round {
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

    leave(player) {
        this.fold(player);
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