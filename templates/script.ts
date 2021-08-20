import { io }  from "./socket.io";

var socket = io();
socket.on('connect', function() {
    socket.emit('custom_event_1', {data: 'I\'m connected!'});
});
socket.on('custom_event_2', function() {
    socket.emit('custom_event_3', {data: 'I\'m connected!'});
});
socket.on('custom_event_4', function() {
    socket.emit('custom_event_5', "The end.");
});
