import { io } from "socket.io-client";
var socket = io('http://localhost:3000', {
  auth: {
    name: 'fish1'
  }});

socket.on('connect', function(){
    console.log('[%s]on connect...', socket.id);
    socket.emit('buy_in', 10);
    setTimeout(() => {socket.emit('start_game', {})}, 1000);
});

socket.on('disconnect', function(){
    console.log('[%s]on disconnect....', socket.id);
});