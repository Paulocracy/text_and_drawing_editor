var socket = io()
// ...THIS LINE (END OF LINES WHICH MUST NOT BE CHANGED)
// The reason for why this is done: Otherwise, run.py's transformation
// for a working static import wouldn't work correctly
socket.on('connect', function () {
    alert("Server connected");
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
    {
        id: "XXXX",
        type: "text",
        data: {
            text: "ABC",
            bordercolor: "none",
            font: "standard"
        }
    }
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
/**
 * Creates a button in the current HTML document and
 * returns this new button instance.
 *
 * @param id The button's ID. It should be unique in the whole document
 * @param onclick The function that shall be executed if the button
 * is clicked. It may also be an empty function such as function () {}
 * @param text The text displayed in the button
 * @returns The newly created button HTML element instance
 */
function documentAddButton(id, onclick, text) {
    var button = document.createElement("button");
    button.id = id;
    button.onclick = onclick;
    button.textContent = text;
    return button;
}
/**
 * Creates a new div at the bottom for the HTML document
 * and returns this new div instance.
 *
 * @param id The div's ID. It should be unique in the whole document
 * @returns The newly created div HTML element instance
 */
function documentAddDiv(id) {
    var div = document.createElement("div");
    div.id = id;
    return div;
}
/**
 * Creates a new form element for the HTML document
 * and returns this new form instance.
 *
 * @param id The form's ID. It should be unique in the whole document
 * @param method The form's action method (such as "dialog")
 * @returns The newly created form HTML element instance
 */
function documentAddForm(id, method) {
    var form = document.createElement("form");
    form.name = id;
    form.method = method;
    return form;
}
/**
 * Creates a new label element for the HTML document and
 * returns this new label instance.
 *
 * @param htmlFor The label's associated element (such as a radio,
 * checkbox etc.)
 * @param text The displayed label text
 * @returns The newly created label HTML element instance
 */
function documentAddLabel(htmlFor, text) {
    var label = document.createElement("label");
    label.htmlFor = htmlFor;
    label.innerText = text;
    return label;
}
/**
 * Creates a new checkbox input element for the HTML document
 * and returns the newly created input instance.
 *
 * @param id The checkbox's ID. It should be unique in the whole document
 * @param name The checkox's name, i.e., the value for which it stands
 * @param isChecked If true, the checkbox is checked. If false, it is unchecked
 * @param onclick The function that shall be executed if the checkbox is clicked,
 * which may also be an empty function such as function () {}
 * @returns
 */
function documentAddCheckboxInput(id, name, isChecked, onclick) {
    var input = document.createElement("input");
    input.type = "checkbox";
    input.id = id;
    input.name = name;
    input.checked = isChecked;
    input.onclick = onclick;
    return input;
}
/**
 * Creates a new radio button input element for the HTML document
 * and returns the newly created input instance.
 *
 * @param id The radio button's ID. It should be unique in the whole document
 * @param name The radio button's name, i.e., for which value it stands.
 * A group of radio buttons can be created by giving them the same name
 * (but not the same ID) so that only one of these buttons can be checked
 * at the same time.
 * @param value The value for which the radio button stands. E.g., if the
 * name is "color", the value may be "yellow"
 * @param checked If true, the radio button is checked. If false, it is unchecked
 * @returns
 */
function documentAddRadioInput(id, name, value, checked, onclick) {
    var input = document.createElement("input");
    input.type = "radio";
    input.id = id;
    input.name = name;
    input.value = value;
    input.checked = checked;
    input.onclick = onclick;
    return input;
}
function documentAddTextarea(id, text, cols, rows) {
    var textarea = document.createElement("textarea");
    textarea.id = id;
    textarea.value = text;
    textarea.cols = cols;
    textarea.rows = rows;
    // Auto-resize height thanks to the answer of
    // https://stackoverflow.com/questions/7745741/auto-expanding-textarea
    textarea.oninput = function () {
        textarea.style.height = "";
        textarea.style.height = Math.min(textarea.scrollHeight, 300) + "px";
    };
    return textarea;
}
/**
 * Creates a new text line input element for the HTML document
 * and returns the newly created input instance.
 *
 * @param id The text line's ID. It should be unique in the whole document
 * @param name The name which can be accessed in the text line's form
 * @param value The initial value (as string) that is displayed in the text line
 * @param size The width of the text line, usually in monospaced characters
 * @returns
 */
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
/**
 * Adds a Point to the associated widget of the canvas with
 * the given ID, under consideration of the given arguments.
 *
 * @param event The event with which the point shall be added. This
 * e.g. determines if the point width can be influenced by pressure or
 * not (if not, it means that event does not contain pressure data)
 * @param id The canvas's ID
 * @param hasVisibleLineToIt If true, a line will be drawn from
 * the canvas's last point to it. If false (e.g. if the user
 * starts drawing a new line after not touching the canvas), no
 * such line will be drawn and this line will be invisible.
 * @param setStartPoint Whether (true) or not (false) this is the
 * start point of a new line. If yes, the global start point variable
 * will be set to this Point
 */
function canvasAddPoint(event, id, hasVisibleLineToIt, setStartPoint) {
    var canvas = document.getElementById("canvas" + id);
    var index = getWidgetIndexById(id);
    var selectedDrawmode;
    selectedDrawmode = document.forms.namedItem("drawmodeRadios" + id).drawmode.value;
    var pressure;
    var x;
    var y;
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
/**
 * Deletes the drawing content of the canvas as well
 * as its associated widget data.
 *
 * @param id The canvas's ID
 */
function canvasClear(id) {
    // Delete the canvas's drawing content
    var canvas = document.getElementById("canvas" + id);
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    // Delete associated widget data
    gPoints = [];
    var index = getWidgetIndexById(id);
    gWidgets[index].data.pointsHistory = [];
}
/**
 * Draws the given list of Point[] on the canvas with the
 * given ID. Each Point instance has all settings (such as
 * color, thickness) that are important for its drawing.
 * Note: The canvas is not cleared when this function is called.
 *
 * @param id The canvas's ID
 * @param points The list of Point instances which shall
 * be drawn
 */
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
/**
 * Switches (from true to false or from false to true) the "isLocked"
 * value of the canvas wiht the given ID. If "isLocked" is true, it's
 * not possible to draw on the canvas.
 *
 * @param id The canvas's id (without "canvas" at beginning)
 */
function canvasLock(id) {
    var index = getWidgetIndexById(id);
    gWidgets[index].data.isLocked = !gWidgets[index].data.isLocked;
}
/**
 * Moves the canvas's drawing content by the given X and Y value.
 * In fact, it changes the canvas's associated widget data with
 * these X and Y values, clears the canvas and redraws the updated
 * widget data.
 *
 * @param id The canvas's ID
 * @param xMove How many pixels the canvas's content shall be moved
 * to the right (positive) or left (negative)
 * @param yMove How many pixels the canvas's content shall be moved
 * down (positive) or up (negative)
 */
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
/**
 * Resizes the canvas width and height according to its associated
 * size text line inputs. Since a resize deletes the canvas's content,
 * the content is redrawn after the resize.
 *
 * @param id The canvas's ID
 */
function canvasResize(id) {
    // TODO: Make it independent from the text line input
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
// TEXTAREA WIDGET FUNCTIONS SECTION //
function textareaInsert(id, insert, multi) {
    var textarea = document.getElementById("textarea" + id);
    var selectionStart = textarea.selectionStart;
    var selectionEnd = textarea.selectionEnd;
    var oldtext = textarea.value;
    var newtext = "";
    if ((selectionStart == selectionEnd) || (!multi)) {
        newtext = oldtext.slice(0, selectionEnd) + insert;
        newtext += oldtext.slice(selectionEnd);
    }
    else {
        newtext = oldtext.slice(0, selectionStart) + insert;
        newtext += oldtext.slice(selectionStart, selectionEnd) + insert;
        newtext += oldtext.slice(selectionEnd);
    }
    textarea.value = newtext;
    textareaUpdateWidgetText(id);
}
function textareaAddBold(id) {
    textareaInsert(id, "*", true);
}
function textareaAddItalic(id) {
    textareaInsert(id, "_", true);
}
function textareaAddHyperlink(id) {
    textareaInsert(id, "[Text](URL)", false);
}
function textareaAddAnchor(id) {
    textareaInsert(id, "{{{ID}}}", false);
}
function textareaAddCounter(id) {
    textareaInsert(id, "{{{{ID}}}}", false);
}
function textareaAddNewline(id) {
    textareaInsert(id, "<br>", false);
}
function textareaSetBordercolor(id, color) {
    var index = getWidgetIndexById(id);
    gWidgets[index].data.bordercolor = color;
    var textarea = document.getElementById("textarea" + id);
    if (color == "none") {
        textarea.style.border = "1px solid " + color;
    }
    else {
        textarea.style.border = "1px solid " + color;
    }
}
function textareaSetFont(id, font) {
    var index = getWidgetIndexById(id);
    gWidgets[index].data.font = font;
}
function textareaUpdateWidgetText(id) {
    var index = getWidgetIndexById(id);
    var textarea = document.getElementById("textarea" + id);
    gWidgets[index].data.text = textarea.value;
}
// RENDER FUNCTIONS SECTION //
function renderTextDiv(widget) {
    var id = widget.id;
    var div = documentAddDiv("divText" + id);
    // Border color radios
    var bordercolorForm = documentAddForm("textBordercolor" + id, "dialog");
    var isNone = widget.data.bordercolor == "none";
    var radioNone = documentAddRadioInput("radioNone" + id, "bordercolor", "none", isNone, function () { textareaSetBordercolor(id, "none"); });
    var labelNone = documentAddLabel("radioNone" + id, "None");
    bordercolorForm.appendChild(radioNone);
    bordercolorForm.appendChild(labelNone);
    var isBlack = widget.data.bordercolor == "black";
    var radioBlack = documentAddRadioInput("radioBlack" + id, "bordercolor", "black", isBlack, function () { textareaSetBordercolor(id, "none"); });
    var labelBlack = documentAddLabel("radioNone" + id, "Black");
    bordercolorForm.appendChild(radioBlack);
    bordercolorForm.appendChild(labelBlack);
    div.appendChild(bordercolorForm);
    // Font radios
    var fontForm = documentAddForm("textBordercolor" + id, "dialog");
    var isStandard = widget.data.font == "standard";
    var radioStandard = documentAddRadioInput("radioStandard" + id, "font", "standard", isStandard, function () { textareaSetFont(id, "none"); });
    var labelStandard = documentAddLabel("radioStandard" + id, "Standard");
    fontForm.appendChild(radioStandard);
    fontForm.appendChild(labelStandard);
    div.appendChild(fontForm);
    var isMonospaced = widget.data.font == "monospaced";
    var radioMonospaced = documentAddRadioInput("radioMonospaced" + id, "font", "monospaced", isMonospaced, function () { textareaSetFont(id, "monospaced"); });
    var labelMonospaced = documentAddLabel("radioMonospaced" + id, "Monospaced");
    fontForm.appendChild(radioMonospaced);
    fontForm.appendChild(labelMonospaced);
    div.appendChild(fontForm);
    // Text addition buttons
    var buttonBold = documentAddButton("buttonBold" + id, function () { textareaAddBold(id); }, "Bold");
    div.appendChild(buttonBold);
    var buttonItalic = documentAddButton("buttonItalic" + id, function () { textareaAddItalic(id); }, "Italic");
    div.appendChild(buttonItalic);
    var buttonHyperlink = documentAddButton("buttonHyperlink" + id, function () { textareaAddHyperlink(id); }, "Hyperlink");
    div.appendChild(buttonHyperlink);
    var buttonAnchor = documentAddButton("buttonAnchor" + id, function () { textareaAddAnchor(id); }, "Anchor");
    div.appendChild(buttonAnchor);
    var buttonCounter = documentAddButton("buttonCounter" + id, function () { textareaAddCounter(id); }, "Counter");
    div.appendChild(buttonCounter);
    var buttonNewline = documentAddButton("buttonNewline" + id, function () { textareaAddNewline(id); }, "Newline");
    div.appendChild(buttonNewline);
    // Newline after buttons
    var br = document.createElement("br");
    div.appendChild(br);
    // The actual textarea
    var textarea = documentAddTextarea("textarea" + id, widget.data.text, 75, 10);
    div.appendChild(textarea);
    // Events
    textarea.onkeyup = function () { textareaUpdateWidgetText(id); };
    document.body.appendChild(div);
    textareaSetBordercolor(id, widget.data.bordercolor);
}
/**
 * Renders the canvas with the given associated widget data
 * (which includes e.g. the ID, points etc.) in the form of
 * the addition of a div with all associated canvas HTML
 * elements. THis div is added at the bottom of the HTML
 * element.
 *
 * @param widget The associated widget data
 */
function renderCanvasDiv(widget) {
    var id = widget.id;
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
    var radioBlack = documentAddRadioInput("radioBlack" + id, "color", "black", true, function () { });
    var labelBlack = documentAddLabel("radioBlack" + id, "Black");
    colorForm.appendChild(radioBlack);
    colorForm.appendChild(labelBlack);
    var radioWhite = documentAddRadioInput("radioWhite" + id, "color", "white", false, function () { });
    var labelWhite = documentAddLabel("radioWhite" + id, "White");
    colorForm.appendChild(radioWhite);
    colorForm.appendChild(labelWhite);
    var radioRed = documentAddRadioInput("radioRed" + id, "color", "red", false, function () { });
    var labelRed = documentAddLabel("radioRed" + id, "Red");
    colorForm.appendChild(radioRed);
    colorForm.appendChild(labelRed);
    var radioBlue = documentAddRadioInput("radioBlue" + id, "color", "blue", false, function () { });
    var labelBlue = documentAddLabel("radioBlue" + id, "Blue");
    colorForm.appendChild(radioBlue);
    colorForm.appendChild(labelBlue);
    var radioGreen = documentAddRadioInput("radioGreen" + id, "color", "green", false, function () { });
    var labelGreen = documentAddLabel("radioGreen" + id, "Green");
    colorForm.appendChild(radioGreen);
    colorForm.appendChild(labelGreen);
    var radioYellow = documentAddRadioInput("radioYellow" + id, "color", "yellow", false, function () { });
    var labelYellow = documentAddLabel("radioYellow" + id, "Yellow");
    colorForm.appendChild(radioYellow);
    colorForm.appendChild(labelYellow);
    div.appendChild(colorForm);
    // Pencil width form
    var widthForm = documentAddForm("canvasWidth" + id, "dialog");
    var radioThin = documentAddRadioInput("radioThin" + id, "width", "thin", true, function () { });
    var labelThin = documentAddLabel("radioThin" + id, "Thin");
    widthForm.appendChild(radioThin);
    widthForm.appendChild(labelThin);
    var radioMedium = documentAddRadioInput("radioMedium" + id, "width", "medium", false, function () { });
    var labelMedium = documentAddLabel("radioMedium" + id, "Medium");
    widthForm.appendChild(radioMedium);
    widthForm.appendChild(labelMedium);
    var radioThick = documentAddRadioInput("radioThick" + id, "width", "thick", false, function () { });
    var labelThick = documentAddLabel("radioThick" + id, "Thick");
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
    var radioFree = documentAddRadioInput("radioFree" + id, "drawmode", "free", true, function () { });
    var labelFree = documentAddLabel("radioFree" + id, "Free");
    drawmodeForm.appendChild(radioFree);
    drawmodeForm.appendChild(labelFree);
    var radioHorizontal = documentAddRadioInput("radioHorizontal" + id, "drawmode", "horizontal", false, function () { });
    var labelHorizontal = documentAddLabel("radioHorizontal" + id, "Horizontal");
    drawmodeForm.appendChild(radioHorizontal);
    drawmodeForm.appendChild(labelHorizontal);
    var radioVertical = documentAddRadioInput("radioVertical" + id, "drawmode", "vertical", false, function () { });
    var labelVertical = documentAddLabel("radioVertical" + id, "Vertical");
    drawmodeForm.appendChild(radioVertical);
    drawmodeForm.appendChild(labelVertical);
    var radioRising = documentAddRadioInput("radioRising" + id, "drawmode", "rising", false, function () { });
    var labelRising = documentAddLabel("radioRising" + id, "Rising");
    drawmodeForm.appendChild(radioRising);
    drawmodeForm.appendChild(labelRising);
    var radioFalling = documentAddRadioInput("radioFalling" + id, "drawmode", "falling", false, function () { });
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
    // Touch & Mouse event associations
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
renderTextDiv(gWidgets[2]);
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
