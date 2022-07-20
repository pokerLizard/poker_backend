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
  console.log('a user connected');
  const players = [];
  for (let [id, socket] of io.of("/").sockets) {
    players.push({
        id: id,
        name: socket.name,
    });
    if (game == null)
      game = new Game();
    game.takeSeat(new Player(socket, socket.name, game));
  }
});

httpServer.listen(3000, () => {
  console.log('listening on *:3000');
});