var socket = io()
// ...THIS LINE (END OF LINES WHICH MUST NOT BE CHANGED)
// The reason for why this is done: Otherwise, run.py's transformation
// for a working static import wouldn't work correctly
socket.on('connect', function () {
    alert("B");
});
socket.on('custom_event_2', function () {
    socket.emit('custom_event_3', { data: 'I\'m connected!' });
});
socket.on('custom_event_4', function () {
    socket.emit('custom_event_5', "The end.");
});
function button_function() {
    socket.emit('custom_event_1', { data: 'I\'m connected!' });
}
