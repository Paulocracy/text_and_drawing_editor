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
////CANVAS TEST BEGIN
var Point = /** @class */ (function () {
    function Point(x, y, lineWidth, color) {
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
        this.color = color;
    }
    return Point;
}());
var $force = document.querySelectorAll('#force')[0];
var $touches = document.querySelectorAll('#touches')[0];
var canvas = document.querySelectorAll('canvas')[0];
var context = canvas.getContext('2d');
var lineWidth = 0;
var isMousedown = false;
var points = [];
canvas.width = window.innerWidth * 2;
canvas.height = window.innerHeight * 2;
var strokeHistory = [];
function drawOnCanvas(stroke) {
    context.strokeStyle = 'black';
    context.lineCap = 'round';
    context.lineJoin = 'round';
    var l = stroke.length - 1;
    if (stroke.length >= 3) {
        var xc = (stroke[l].x + stroke[l - 1].x) / 2;
        var yc = (stroke[l].y + stroke[l - 1].y) / 2;
        context.lineWidth = stroke[l - 1].lineWidth;
        context.quadraticCurveTo(stroke[l - 1].x, stroke[l - 1].y, xc, yc);
        context.stroke();
        context.beginPath();
        context.moveTo(xc, yc);
    }
    else {
        var point = stroke[l];
        context.lineWidth = point.lineWidth;
        context.strokeStyle = point.color;
        context.beginPath();
        context.moveTo(point.x, point.y);
        context.stroke();
    }
}
/**
 * Remove the previous stroke from history and repaint the entire canvas based on history
 * @return {void}
 */
function undoDraw() {
    strokeHistory.pop();
    context.clearRect(0, 0, canvas.width, canvas.height);
    strokeHistory.map(function (stroke) {
        if (strokeHistory.length === 0)
            return;
        context.beginPath();
        var strokePath = [];
        stroke.map(function (point) {
            strokePath.push(point);
            drawOnCanvas(strokePath);
        });
    });
}
for (var _i = 0, _a = ["touchstart", "mousedown"]; _i < _a.length; _i++) {
    var ev = _a[_i];
    canvas.addEventListener(ev, function (e) {
        var pressure = 0.1;
        var x, y;
        if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
            if (e.touches[0]["force"] > 0) {
                pressure = e.touches[0]["force"];
            }
            x = e.touches[0].pageX * 2;
            y = e.touches[0].pageY * 2;
        }
        else {
            pressure = 1.0;
            x = e.pageX * 2;
            y = e.pageY * 2;
        }
        isMousedown = true;
        lineWidth = Math.log(pressure + 1) * 40;
        context.lineWidth = lineWidth; // pressure * 50;
        points.push({ x: x, y: y, lineWidth: lineWidth });
        drawOnCanvas(points);
    });
}
for (var _b = 0, _c = ['touchmove', 'mousemove']; _b < _c.length; _b++) {
    var ev = _c[_b];
    canvas.addEventListener(ev, function (e) {
        if (!isMousedown)
            return;
        e.preventDefault();
        var pressure = 0.1;
        var x, y;
        if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
            if (e.touches[0]["force"] > 0) {
                pressure = e.touches[0]["force"];
            }
            x = e.touches[0].pageX * 2;
            y = e.touches[0].pageY * 2;
        }
        else {
            pressure = 1.0;
            x = e.pageX * 2;
            y = e.pageY * 2;
        }
        // smoothen line width
        lineWidth = (Math.log(pressure + 1) * 40 * 0.2 + lineWidth * 0.8);
        points.push({ x: x, y: y, lineWidth: lineWidth });
        drawOnCanvas(points);
    });
}
for (var _d = 0, _e = ['touchend', 'touchleave', 'mouseup']; _d < _e.length; _d++) {
    var ev = _e[_d];
    canvas.addEventListener(ev, function (e) {
        var pressure = 0.1;
        var x, y;
        if (e.touches && e.touches[0] && typeof e.touches[0]["force"] !== "undefined") {
            if (e.touches[0]["force"] > 0) {
                pressure = e.touches[0]["force"];
            }
            x = e.touches[0].pageX * 2;
            y = e.touches[0].pageY * 2;
        }
        else {
            pressure = 1.0;
            x = e.pageX * 2;
            y = e.pageY * 2;
        }
        isMousedown = false;
        strokeHistory.push(__spreadArray([], points));
        points = [];
        lineWidth = 0;
    });
}
;
////CANVAS TEST END
