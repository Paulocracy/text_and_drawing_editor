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
function documentAddButton(id, onclick, text) {
    var button = document.createElement("button");
    button.id = id;
    button.onclick = onclick;
    button.textContent = text;
    return button;
}
function documentAddForm(id, method) {
    var form = document.createElement("form");
    form.name = id;
    form.method = method;
    return form;
}
function documentAddDiv(id) {
    var div = document.createElement("div");
    div.id = id;
    return div;
}
function documentAddLabel(htmlFor, text) {
    var label = document.createElement("label");
    label.htmlFor = htmlFor;
    label.innerText = text;
    return label;
}
function documentAddTextlineInput(id, value, size) {
    var input = document.createElement("input");
    input.type = "text";
    input.value = value;
    input.size = 2;
    input.id = id;
    input.name = id;
    input.required = true;
    return input;
}
function documentAddRadioInput(id, name, value, checked) {
    var input = document.createElement("input");
    input.type = "radio";
    input.id = id;
    input.name = name;
    input.checked = checked;
    return input;
}
function documentAddCheckboxInput(id, name, onclick) {
    var input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.name = name;
    input.onclick = onclick;
    return input;
}
////////
var g_widgets = [
    {
        id: "ABCDE",
        data: {
            pointsHistory: [],
            isLocked: false,
            isWithPressure: false
        }
    },
];
function canvasClear(id) { }
function canvasMove(id, x, y) { }
function canvasResize(id) { }
function canvasLock(id) { }
function renderCanvasDiv(widget) {
    var id = widget.id;
    var data = widget.classdata;
    var div = documentAddDiv("canvas" + id);
    // Canvas movement form
    var moveForm = documentAddForm("canvasMovement" + id, "dialog");
    var clearButton = documentAddButton("buttonClear" + id, function () { canvasClear(id); }, "Clear");
    moveForm.appendChild(clearButton);
    var leftButton = documentAddButton("buttonMoveLeft" + id, function () { canvasMove(id, -3, 0); }, "Move left");
    moveForm.appendChild(leftButton);
    var rightButton = documentAddButton("buttonMoveRight" + id, function () { canvasMove(id, 3, 0); }, "Move left");
    moveForm.appendChild(rightButton);
    var downButton = documentAddButton("buttonMoveDown" + id, function () { canvasMove(id, 0, 3); }, "Move left");
    moveForm.appendChild(downButton);
    div.appendChild(moveForm);
    // Canvas size form
    var sizeForm = documentAddForm("canvasSize" + id, "dialog");
    var widthLabel = documentAddLabel("canvasWidth" + id, "Width: ");
    var widthInput = documentAddTextlineInput("canvasWidth" + id, "500", "2");
    sizeForm.appendChild(widthLabel);
    sizeForm.appendChild(widthInput);
    var heightLabel = documentAddLabel("canvasHeight" + id, "Height: ");
    var heightInput = documentAddTextlineInput("canvasHeight" + id, "500", "2");
    sizeForm.appendChild(heightLabel);
    sizeForm.appendChild(heightInput);
    var resizeButton = documentAddButton("buttonResize" + id, function () { canvasResize(id); }, "Resize");
    sizeForm.appendChild(resizeButton);
    div.appendChild(sizeForm);
    // Canvas color form
    var colorForm = documentAddForm("canvasColor" + id, "dialog");
    var radioBlack = documentAddRadioInput("radioBlack" + id, "color", "black", true);
    var labelBlack = documentAddLabel("radioBlack" + id, "Black");
    colorForm.appendChild(radioBlack);
    colorForm.appendChild(labelBlack);
    var radioWhite = documentAddRadioInput("radioWhite" + id, "color", "white", false);
    var labelWhite = documentAddLabel("radioWhite" + id, "White");
    colorForm.appendChild(radioWhite);
    colorForm.appendChild(labelWhite);
    var radioRed = documentAddRadioInput("radioRed" + id, "color", "red", false);
    var labelRed = documentAddLabel("radioRed" + id, "Red");
    colorForm.appendChild(radioRed);
    colorForm.appendChild(labelRed);
    var radioBlue = documentAddRadioInput("radioBlue" + id, "color", "blue", false);
    var labelBlue = documentAddLabel("radioBlue" + id, "Blue");
    colorForm.appendChild(radioBlue);
    colorForm.appendChild(labelBlue);
    var radioGreen = documentAddRadioInput("radioGreen" + id, "color", "green", false);
    var labelGreen = documentAddLabel("radioGreen" + id, "Green");
    colorForm.appendChild(radioGreen);
    colorForm.appendChild(labelGreen);
    var radioYellow = documentAddRadioInput("radioYellow" + id, "color", "yellow", false);
    var labelYellow = documentAddLabel("radioYellow" + id, "Yellow");
    colorForm.appendChild(radioYellow);
    colorForm.appendChild(labelYellow);
    div.appendChild(colorForm);
    // Pencil width form
    var widthForm = documentAddForm("canvasWidth" + id, "dialog");
    var radioThin = documentAddRadioInput("radioThin" + id, "width", "thin", true);
    var labelThin = documentAddLabel("labelThin" + id, "Thin");
    widthForm.appendChild(radioThin);
    widthForm.appendChild(labelThin);
    var radioMedium = documentAddRadioInput("radioMedium" + id, "width", "medium", false);
    var labelMedium = documentAddLabel("labelThin" + id, "Medium");
    widthForm.appendChild(radioMedium);
    widthForm.appendChild(labelMedium);
    var radioThick = documentAddRadioInput("radioThick" + id, "width", "thick", false);
    var labelThick = documentAddLabel("labelThin" + id, "Thick");
    widthForm.appendChild(radioThick);
    widthForm.appendChild(labelThick);
    var checkboxPressure = documentAddCheckboxInput("boxPressure" + id, "pressure", function () { });
    var labelPressure = documentAddLabel("boxPressure" + id, "Pressure?");
    widthForm.appendChild(checkboxPressure);
    widthForm.appendChild(labelPressure);
    var checkboxLocked = documentAddCheckboxInput("boxLocked" + id, "locked", function () { canvasLock(id); });
    var labelLocked = documentAddLabel("boxLocked" + id, "Locked?");
    widthForm.appendChild(checkboxLocked);
    widthForm.appendChild(labelLocked);
    div.appendChild(widthForm);
    // Drawmode form
    var drawmodeForm = documentAddForm("drawmodeRadios" + id, "dialog");
    var radioFree = documentAddRadioInput("radioFree" + id, "drawmode", "free", true);
    var labelFree = documentAddLabel("radioFree" + id, "Free");
    drawmodeForm.appendChild(radioFree);
    drawmodeForm.appendChild(labelFree);
    var radioHorizontal = documentAddRadioInput("radioHorizontal" + id, "drawmode", "horizontal", false);
    var labelHorizontal = documentAddLabel("radioHorizontal" + id, "Horizontal");
    drawmodeForm.appendChild(radioHorizontal);
    drawmodeForm.appendChild(labelHorizontal);
    var radioVertical = documentAddRadioInput("radioVertical" + id, "drawmode", "vertical", false);
    var labelVertical = documentAddLabel("radioVertical" + id, "Vertical");
    drawmodeForm.appendChild(radioVertical);
    drawmodeForm.appendChild(labelVertical);
    var radioRising = documentAddRadioInput("radioRising" + id, "drawmode", "rising", false);
    var labelRising = documentAddLabel("radioRising" + id, "Rising");
    drawmodeForm.appendChild(radioRising);
    drawmodeForm.appendChild(labelRising);
    var radioFalling = documentAddRadioInput("radioFalling" + id, "drawmode", "falling", false);
    var labelFalling = documentAddLabel("radioFalling" + id, "Falling");
    drawmodeForm.appendChild(radioFalling);
    drawmodeForm.appendChild(labelFalling);
    div.appendChild(drawmodeForm);
    // The actual canvas
    var canvas = document.createElement("canvas");
    canvas.id = id;
    canvas.width = 500;
    canvas.height = 500;
    canvas.style.border = "1px solid black";
    canvas.textContent = "Unfortunately, your browser does not support canvas elements.";
    div.appendChild(canvas);
    document.body.appendChild(div);
}
renderCanvasDiv(g_widgets[0]);
function renderWidgets(widgets) {
    while (document.firstChild) {
        document.removeChild(document.firstChild);
    }
    // renderMenuDiv()
    var position = 0;
    for (var _i = 0, widgets_1 = widgets; _i < widgets_1.length; _i++) {
        var widget = widgets_1[_i];
        if (widget.type == "canvas") {
            renderCanvasDiv(widget);
        }
        else if (widget.type == "text") {
            // renderTextDiv(widget)
        }
        // renderButtonsDiv(position)
        position++;
    }
}
[
    {
        id: "asdsad",
        type: "canvas",
        classdata: {}
    }
];
////g_canvas TEST END
