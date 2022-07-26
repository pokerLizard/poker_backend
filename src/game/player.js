export class Player {
    constructor(socket, name, game) {
        this.active = true
        this.socket = socket;
        this.name = name;
        this.game = game;
        this.pocket = 0.0
        this.actionResolve = null;

        if (socket != null) {
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
        this.socket?.emit('action_notify', availActions,
            () => {
                console.log(`waiting for ${this.name}'s action...`);
            }
        );
    }
}