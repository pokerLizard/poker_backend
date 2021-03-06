import { io } from "socket.io-client";
var socket = io('http://localhost:3000', {
  auth: {
    name: 'fish'
  }});

socket.on('connect', function(){
    console.log('[%s]on connect...', socket.id);
    socket.emit('buy_in', 10);
});
socket.on('action_notify', (availActions, ack) => {
  ack();
  console.log('my turn');
  socket.emit('call');
});

socket.on('disconnect', function(){
    console.log('[%s]on disconnect....', socket.id);
});