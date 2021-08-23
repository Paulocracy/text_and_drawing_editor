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
//////////////////////////////
// GLOBAL VARIABLES SECTION //
// All global variables start with "g"
/**
 * Global variable tracking whether or not the user's mouse in in a "down" state, i.e,
 * if a mouse button is currently pressed.
*/
var gIsMouseDown = false;
/**
 * Global variable containing all drawn points since the user pressed
 * a mouse button for the last time.
 */
var gPoints = [];
/**
 * Global variable containing the Point in the currently active canvas
 * at the beginning of the current drawing process.
 */
var gStartPoint;
/**
 * Global variable which is a list containing all widgets of the current session
 * in an ordered list. "Ordered" means that the first element is at the top,
 * the second below it, etc... Each widget, i.e., the list's constituents, contains
 * an "id" string parameter which is the widget's unique ID, a "type" string parameter
 * which is either "canvas", "text" or "chapter", and a "data" JSON object which
 * contain's a widget's data depending on its type, i.e.:
 *
 * If the widget is a "canvas", the data contains: 1) A "pointsHistory" list of Points
 * containing all drawn Points of the canvas, 2) an "isLocked" boolean showing whether
 * or not the user allows it to draw on the canvas, 3) an "isWithPressure" boolean
 * showing whether or not the user wants to draw with an acknowledgement of a touch
 * device's pressure.
 */
var gWidgets = [
    {
        id: "ABCDE",
        type: "canvas",
        data: {
            pointsHistory: [],
            isLocked: false,
            isWithPressure: false
        }
    },
    {
        id: "BBBB",
        type: "canvas",
        data: {
            pointsHistory: [],
            isLocked: false,
            isWithPressure: false
        }
    },
];
// GLOBAL WIDGET FUNCTION SECTION //
/**
 * Returns the index (i.e., 0 up to the length of the global widgets variable)
 * of the element with the given ID in the global widgets variable.
 *
 * @param id The ID of the widget for which we are looking after its ID in
 * the global widgest variable.
 * @returns
 */
function getWidgetIndexById(id) {
    var index = 0;
    for (var _i = 0, gWidgets_1 = gWidgets; _i < gWidgets_1.length; _i++) {
        var widget = gWidgets_1[_i];
        if (widget.id == id) {
            break;
        }
        index++;
    }
    return index;
}
// POINT DEFINITION SECTION //
/**
 * Get a JS object (i.e., a JSON) of a canvas drawing point containing the given parameters
 * with the given names. This points contains all (at the time of its drawing) current
 * canvas drawing settings.
 *
 * @param x The point's x coordinate in a coordinate system with the canvas's upper
 * left corner as origin (0|0). x is rising from left to right.
 * @param y The point's y coordinate in a coordinate system with the canvas's upper
 * left corner as origin (0|0). y is rising from up to down.
 * @param lineWidth The line's drawing width. The higher the value, the thicker the line.
 * @param color The line's color, which usually is a string including a usual color name
 * such as, e.g., "black" or "red".
 * @param hasVisibleLineToIt If true, this point will be connected by a line from the last
 * drawn canvas point. If false, no such line will be drawn. A typical example for a state
 * where this value is "false" is when the user, after a line was drawn on the canvas and
 * the mouse is released, starts to draw a new line which we don't want to connect with the
 * last line.
 * @returns
 */
function getPoint(x, y, lineWidth, color, hasVisibleLineToIt) {
    return {
        x: x,
        y: y,
        lineWidth: lineWidth,
        color: color,
        hasVisibleLineToIt: hasVisibleLineToIt
    };
}
// DOCUMENT-AFFENCTING FUNCTIONS SECTION //
function documentAddButton(id, onclick, text) {
    var button = document.createElement("button");
    button.id = id;
    button.onclick = onclick;
    button.textContent = text;
    return button;
}
function documentAddDiv(id) {
    var div = document.createElement("div");
    div.id = id;
    return div;
}
function documentAddForm(id, method) {
    var form = document.createElement("form");
    form.name = id;
    form.method = method;
    return form;
}
function documentAddLabel(htmlFor, text) {
    var label = document.createElement("label");
    label.htmlFor = htmlFor;
    label.innerText = text;
    return label;
}
function documentAddCheckboxInput(id, name, isChecked, onclick) {
    var input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.name = name;
    input.checked = isChecked;
    input.onclick = onclick;
    return input;
}
function documentAddRadioInput(id, name, value, checked) {
    var input = document.createElement("input");
    input.type = "radio";
    input.id = id;
    input.name = name;
    input.value = value;
    input.checked = checked;
    return input;
}
function documentAddTextlineInput(id, name, value, size) {
    var input = document.createElement("input");
    input.type = "text";
    input.id = id;
    input.value = value;
    input.size = 2;
    input.required = true;
    input.name = name;
    return input;
}
// CANVAS WIDGET FUNCTIONS SECTION //
function canvasAddPoint(event, id, hasVisibleLineToIt, setStartPoint) {
    var canvas = document.getElementById("canvas" + id);
    var index = getWidgetIndexById(id);
    var pressure;
    var x;
    var y;
    var selectedDrawmode;
    if (!setStartPoint) {
        selectedDrawmode = document.forms.namedItem("drawmodeRadios" + id).drawmode.value;
    }
    else {
        selectedDrawmode = "free";
    }
    var pageXYhandler;
    if (event.touches && event.touches[0] && typeof event.touches[0]["force"] !== "undefined") {
        if (event.touches[0]["force"] > 0) {
            var checkbox = document.getElementById("boxPressure" + id);
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
        x = pageXYhandler.pageX - canvas.offsetLeft;
        y = pageXYhandler.pageY - canvas.offsetTop;
    }
    else if (selectedDrawmode == "horizontal") {
        x = pageXYhandler.pageX - canvas.offsetLeft;
        y = gStartPoint.y;
    }
    else if (selectedDrawmode == "vertical") {
        x = gStartPoint.x;
        y = pageXYhandler.pageY - canvas.offsetTop;
    }
    else if (selectedDrawmode == "rising") {
        x = pageXYhandler.pageX - canvas.offsetLeft;
        y = gStartPoint.y - (x - gStartPoint.x);
    }
    else if (selectedDrawmode == "falling") {
        x = pageXYhandler.pageX - canvas.offsetLeft;
        y = gStartPoint.y + (x - gStartPoint.x);
    }
    var selectedColor = document.forms.namedItem("canvasColor" + id).color.value;
    var selectedLineWidth = document.forms.namedItem("canvasWidth" + id).width.value;
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
    var newPoint = getPoint(x, y, resultingLineWidth, selectedColor, hasVisibleLineToIt);
    gPoints.push(newPoint);
    gWidgets[index].data.pointsHistory.push(newPoint);
    if (setStartPoint) {
        gStartPoint = newPoint;
    }
    canvasDrawPointsOnIt(id, gPoints);
}
function canvasClear(id) {
    var canvas = document.getElementById("canvas" + id);
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    gPoints = [];
    var index = getWidgetIndexById(id);
    gWidgets[index].data.pointsHistory = [];
}
function canvasDrawPointsOnIt(id, points) {
    var canvas = document.getElementById("canvas" + id);
    var context = canvas.getContext("2d");
    context.lineCap = "round";
    context.lineJoin = "round";
    for (var right_index = 1; right_index < points.length; right_index++) {
        context.strokeStyle = points[right_index].color;
        context.lineWidth = points[right_index].lineWidth;
        context.beginPath();
        context.moveTo(points[right_index - 1].x, points[right_index - 1].y);
        if (points[right_index].hasVisibleLineToIt) {
            context.lineTo(points[right_index].x, points[right_index].y);
        }
        context.closePath();
        context.stroke();
    }
    gPoints.reverse();
    while (gPoints.length > 1) {
        gPoints.pop();
    }
}
function canvasLock(id) {
    var index = getWidgetIndexById(id);
    gWidgets[index].data.isLocked = !gWidgets[index].data.isLocked;
}
function canvasMove(id, xMove, yMove) {
    var index = getWidgetIndexById(id);
    for (var i = 0; i < gWidgets[index].data.pointsHistory.length; i++) {
        gWidgets[index].data.pointsHistory[i].x += xMove;
        gWidgets[index].data.pointsHistory[i].y += yMove;
    }
    var canvas = document.getElementById("canvas" + id);
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    canvasDrawPointsOnIt(id, gWidgets[index].data.pointsHistory);
}
function canvasResize(id) {
    var newWidth = parseInt(document.forms.namedItem("canvasSize" + id).canvasWidth.value);
    var newHeight = parseInt(document.forms.namedItem("canvasSize" + id).canvasHeight.value);
    var canvas = document.getElementById("canvas" + id);
    if (newWidth != NaN) {
        canvas.width = newWidth;
    }
    if (newHeight != NaN) {
        canvas.height = newHeight;
    }
    var index = getWidgetIndexById(id);
    canvasDrawPointsOnIt(id, gWidgets[index].data.pointsHistory);
}
// RENDER FUNCTIONS SECTION //
function renderCanvasDiv(widget) {
    var id = widget.id;
    var data = widget.classdata;
    var div = documentAddDiv("divCanvas" + id);
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
    var widthInput = documentAddTextlineInput("canvasWidth" + id, "canvasWidth", "500", "2");
    sizeForm.appendChild(widthLabel);
    sizeForm.appendChild(widthInput);
    var heightLabel = documentAddLabel("canvasHeight" + id, "Height: ");
    var heightInput = documentAddTextlineInput("canvasHeight" + id, "canvasHeight", "500", "2");
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
    var checkboxPressure = documentAddCheckboxInput("boxPressure" + id, "pressure", widget.isLocked, function () { });
    var labelPressure = documentAddLabel("boxPressure" + id, "Pressure?");
    widthForm.appendChild(checkboxPressure);
    widthForm.appendChild(labelPressure);
    var checkboxLocked = documentAddCheckboxInput("boxLocked" + id, "locked", widget.isWithPressure, function () { canvasLock(id); });
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
    canvas.id = "canvas" + id;
    canvas.width = 500;
    canvas.height = 500;
    canvas.style.border = "1px solid black";
    canvas.textContent = "Unfortunately, your browser does not support canvas elements.";
    for (var _i = 0, _a = ["touchstart", "mousedown"]; _i < _a.length; _i++) {
        var events = _a[_i];
        canvas.addEventListener(events, function (event) {
            var index = getWidgetIndexById(id);
            if (!gWidgets[index].data.isLocked) {
                gIsMouseDown = true;
                gPoints = [];
                canvasAddPoint(event, id, false, true);
            }
        });
    }
    for (var _b = 0, _c = ["touchmove", "mousemove"]; _b < _c.length; _b++) {
        var events = _c[_b];
        canvas.addEventListener(events, function (event) {
            var index = getWidgetIndexById(id);
            if (!gWidgets[index].data.isLocked) {
                if (!gIsMouseDown) {
                    return;
                }
                event.preventDefault();
                canvasAddPoint(event, id, true, false);
            }
        });
    }
    for (var _d = 0, _e = ["touchend", "touchleave", "mouseup"]; _d < _e.length; _d++) {
        var events = _e[_d];
        canvas.addEventListener(events, function (event) {
            var index = getWidgetIndexById(id);
            if (!gWidgets[index].data.isLocked) {
                gIsMouseDown = false;
            }
        });
    }
    div.appendChild(canvas);
    document.body.appendChild(div);
    canvasDrawPointsOnIt(id, widget.data.pointsHistory);
}
renderCanvasDiv(gWidgets[0]);
renderCanvasDiv(gWidgets[1]);
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
