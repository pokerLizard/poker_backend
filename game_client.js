import { io } from "socket.io-client";
var socket = io('http://localhost:3000', {
  auth: {
    name: 'fish'
  }});

socket.on('connect', function(){
    console.log('[%s]on connect...', socket.id);
    socket.emit('start_game', {});
});

socket.on('disconnect', function(){
    console.log('[%s]on disconnect....', socket.id);
});