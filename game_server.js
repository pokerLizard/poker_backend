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
  socket.on("disconnecting", (reason) => {
    console.log(`${socket.name} disconnect`);
  });
  if (game == null) {
    game = new Game(io);
    game.takeSeat(new Player(null, 'debug', game))
  }
  if (!game.isPlayerInGame(socket.name)) {
    game.takeSeat(new Player(socket, socket.name, game));
    console.log(`player ${socket.name} connected`);
  }
  else
    console.log(`player ${socket.name} reconnected`);
});

io.on('start_game', (socket) => {
  console.assert(game != null);
  game.start();
});

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});