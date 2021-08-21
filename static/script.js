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
////g_canvas TEST BEGIN
var Point = /** @class */ (function () {
    function Point(x, y, lineWidth, color, visibleLineToIt) {
        this.x = x;
        this.y = y;
        this.lineWidth = lineWidth;
        this.color = color;
        this.visibleLineToIt = visibleLineToIt;
    }
    return Point;
}());
var g_canvas = document.querySelectorAll('canvas')[0];
var g_context = g_canvas.getContext('2d');
var g_isMousedown = false;
var g_points = [];
var g_pointsHistory = [];
var g_startPoint;
var g_isLocked = false;
g_canvas.width = 500;
g_canvas.height = 500;
function clear_canvas() {
    // g_context.beginPath()
    g_context.clearRect(0, 0, g_canvas.width, g_canvas.height);
    // g_context.closePath()
    // g_context.stroke()
    g_points = [];
    g_pointsHistory = [];
}
function moveAll(xMove, yMove) {
    for (var i = 0; i < g_pointsHistory.length; i++) {
        g_pointsHistory[i].x += xMove;
        g_pointsHistory[i].y += yMove;
    }
    g_context.clearRect(0, 0, g_canvas.width, g_canvas.height);
    drawPointsOnCanvas(g_pointsHistory);
}
function resizeCanvas() {
    var newWidth = parseInt(document.forms.namedItem("canvasSize").canvasWidth.value);
    var newHeight = parseInt(document.forms.namedItem("canvasSize").canvasHeight.value);
    if (newWidth != NaN) {
        g_canvas.width = newWidth;
    }
    if (newHeight != NaN) {
        g_canvas.height = newHeight;
    }
    drawPointsOnCanvas(g_pointsHistory);
}
function drawPointsOnCanvas(points) {
    g_context.lineCap = "round";
    g_context.lineJoin = "round";
    for (var right_index = 1; right_index < points.length; right_index++) {
        g_context.strokeStyle = points[right_index].color;
        g_context.lineWidth = points[right_index].lineWidth;
        g_context.beginPath();
        g_context.moveTo(points[right_index - 1].x, points[right_index - 1].y);
        if (points[right_index].visibleLineToIt) {
            g_context.lineTo(points[right_index].x, points[right_index].y);
        }
        g_context.closePath();
        g_context.stroke();
    }
    g_points.reverse();
    while (g_points.length > 1) {
        g_points.pop();
    }
}
function addPoint(event, visibleLineToIt, setStartPoint) {
    var pressure;
    var x;
    var y;
    var selectedDrawmode;
    if (!setStartPoint) {
        selectedDrawmode = document.forms.namedItem("drawmodeRadios").drawmode.value;
    }
    else {
        selectedDrawmode = "free";
    }
    var pageXYhandler;
    if (event.touches && event.touches[0] && typeof event.touches[0]["force"] !== "undefined") {
        if (event.touches[0]["force"] > 0) {
            var checkbox = document.getElementById("pressure");
            if (checkbox.checked) {
                pressure = event.touches[0]["force"];
            }
            else {
                pressure = 1.0;
            }
        }
        else {
            pressure = 1.0;
        }
        pageXYhandler = event.touches[0];
    }
    else {
        pressure = 1.0;
        pageXYhandler = event;
    }
    if (selectedDrawmode == "free") {
        x = pageXYhandler.pageX - g_canvas.offsetLeft;
        y = pageXYhandler.pageY - g_canvas.offsetTop;
    }
    else if (selectedDrawmode == "horizontal") {
        x = pageXYhandler.pageX - g_canvas.offsetLeft;
        y = g_startPoint.y;
    }
    else if (selectedDrawmode == "vertical") {
        x = g_startPoint.x;
        y = pageXYhandler.pageY - g_canvas.offsetTop;
    }
    else if (selectedDrawmode == "rising") {
        x = pageXYhandler.pageX - g_canvas.offsetLeft;
        y = g_startPoint.y - (x - g_startPoint.x);
    }
    else if (selectedDrawmode == "falling") {
        x = pageXYhandler.pageX - g_canvas.offsetLeft;
        y = g_startPoint.y + (x - g_startPoint.x);
    }
    var selectedColor = document.forms.namedItem("colorRadios").color.value;
    var selectedLineWidth = document.forms.namedItem("widthRadios").width.value;
    var resultingLineWidth = Math.log(pressure + 1);
    if (selectedLineWidth == "thin") {
        resultingLineWidth *= 5.0;
    }
    else if (selectedLineWidth == "medium") {
        resultingLineWidth *= 10.0;
    }
    else if (selectedLineWidth == "thick") {
        resultingLineWidth *= 100.0;
    }
    var newPoint = new Point(x, y, resultingLineWidth, selectedColor, visibleLineToIt);
    g_points.push(newPoint);
    g_pointsHistory.push(newPoint);
    if (setStartPoint) {
        g_startPoint = newPoint;
    }
    drawPointsOnCanvas(g_points);
}
for (var _i = 0, _a = ["touchstart", "mousedown"]; _i < _a.length; _i++) {
    var events = _a[_i];
    g_canvas.addEventListener(events, function (event) {
        if (!g_isLocked) {
            g_isMousedown = true;
            g_points = [];
            addPoint(event, false, true);
        }
    });
}
for (var _b = 0, _c = ["touchmove", "mousemove"]; _b < _c.length; _b++) {
    var events = _c[_b];
    g_canvas.addEventListener(events, function (event) {
        if (!g_isLocked) {
            if (!g_isMousedown) {
                return;
            }
            event.preventDefault();
            addPoint(event, true, false);
        }
    });
}
for (var _d = 0, _e = ["touchend", "touchleave", "mouseup"]; _d < _e.length; _d++) {
    var events = _e[_d];
    g_canvas.addEventListener(events, function (event) {
        if (!g_isLocked) {
            g_isMousedown = false;
            // addPoints does not work correctly here as a very
            // high pressure is detected with these events.
        }
    });
}
function lock_canvas() {
    g_isLocked = !g_isLocked;
}
////g_canvas TEST END
