import { createServer } from "http";
import { Server } from "socket.io";
const httpServer = createServer();
const io = new Server(httpServer, {});
import {Game, Player} from "./src/game/game.js";


io.use((socket, next) => {
    const name = socket.handshake.auth.name;
    if (!name) {
        return next(new Error("invalid username"))
    }
    socket.name = name
    next();
});

var game = null;
io.on('connection', (socket) => {
  console.log(`player ${socket.name} connected`);
  if (game == null)
    game = new Game(io);
  game.takeSeat(new Player(socket, socket.name, game));
});

io.on('start_game', (socket) => {
  console.assert(game != null);
  game.start();
});

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});