var socket = io()
// ...THIS LINE (END OF LINES WHICH MUST NOT BE CHANGED)
// The reason for why this is done: Otherwise, run.py's transformation
// for a working static import wouldn't work correctly
// SOCKET.IO EVENTS SECTION //
/**
 * The "connect" event tells the consolel-uplooking user that
 * the connection to the server works.
 */
socket.on('connect', function () {
    console.log("SOCKET.IO: Server connected");
});
/**
 * In the "broadcast_to_client" event, all clients
 * are synchronized, i.e., the client which initially triggers
 * this event sets its widgets for all other clients.
 */
socket.on('broadcastToClient', function (data) {
    console.log("SOCKET.IO: Receiving 'broadcastToClient' event");
    gWidgets = data;
    renderWidgets();
});
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
 *
 * If the widget is a "text", the data contains: 1) A text string which contains
 * the text's textarea text, 2) a "bordercolor" string which defines a border color
 * for the HTML output, 3) a "font" string which defines a font type for the HTML
 * output.
 *
 * If the widget is a "caption", its data contains: 1) A "text" string which
 * defines the caption's name, 2) an "id" string which defines the caption's ID
 * to which it can be referred to in text, 3) a "level" string which defines
 * which caption level this caption has (lower numbers mean a higher level).
 *
 * If the widget is a "counter", its data contains: 1) An "id" string
 * to which it can be referred to in text, 2) a "br" boolean which
 * defines whether or not a newline shall be added in the HTML output just
 * before the counter.
 */
var gWidgets = [
    {
        id: "ABCDE",
        type: "canvas",
        data: {
            pointsHistory: [],
            isLocked: false,
            isWithPressure: false,
            width: 500,
            height: 50
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
    },
    {
        id: "GGGG",
        type: "caption",
        data: {
            text: "FGDA",
            id: "asdsad",
            level: "2"
        }
    },
    {
        id: "TTTT",
        type: "counter",
        data: {
            family: "Figure",
            reference: "QWE",
            br: false
        }
    }
];
// GLOBAL WIDGET FUNCTION SECTION //
/**
 * Adds the widget object in the global widgets variable at
 * the given position.
 *
 * @param position The position that the new widget shall take.
 * Must be at least 0 or below gWidgets.length
 * @param widget The widget object
 */
function addWidgetAtGlobalPosition(position, widget) {
    gWidgets.splice(position, 0, widget);
    renderWidgets();
}
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
/**
 * Returns a unique base ID. The ID is a number, starting form 0.
 * The unique ID is identified by checking the number with all
 * other global widget base IDs; If the ID occurs, the number is
 * raised by 1 and the procedure starts again; If the ID does not
 * occur, a unique ID was found and is returned.
 *
 * @returns The unique base ID
 */
function getUniqueId() {
    var id = 0;
    var isNotUnique = true;
    while (isNotUnique) {
        id++;
        isNotUnique = false;
        for (var i = 0; i < gWidgets.length; i++) {
            if (gWidgets[i].id == id.toString()) {
                isNotUnique = true;
            }
        }
    }
    return id.toString();
}
/**
 * Returns a "raw" canvas widget in the form of
 * an object. "Raw" means that it has standard
 * sized and that it is empty. In addition, it
 * gets a unique base ID.
 *
 * @returns The "raw" canvas object
 */
function getRawCanvas() {
    return {
        id: getUniqueId(),
        type: "canvas",
        data: {
            pointsHistory: [],
            isLocked: false,
            isWithPressure: false,
            width: 500,
            height: 50
        }
    };
}
/**
 * Returns a "raw" text widget in the form of
 * an object. "Raw" means that it has standard
 * sized and that it is empty. In addition,
 * it gets a unique base ID.
 *
 * @returns The "raw" canvas object
 */
function getRawText() {
    return {
        id: getUniqueId(),
        type: "text",
        data: {
            text: "",
            bordercolor: "none",
            font: "standard"
        }
    };
}
/**
 * Returns a "raw" caption widget in the form of
 * an object. "Raw" means that it is empty.
 * In addition, it gets a unique base ID.
 *
 * @returns The "raw" canvas object
 */
function getRawCaption() {
    return {
        id: getUniqueId(),
        type: "caption",
        data: {
            text: "",
            id: "",
            level: "1"
        }
    };
}
/**
 * Returns a "raw" counter widget in the form of
 * an object. "Raw" means that it is empty.
 * In addition, it gets a unique base ID.
 *
 * @returns The "raw" canvas object
 */
function getRawCounter() {
    return {
        id: getUniqueId(),
        type: "counter",
        data: {
            family: "",
            reference: "",
            br: false
        }
    };
}
// POINT FUNCTION SECTION //
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
// DOCUMENT-WIDE FUNCTIONS SECTION //
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
 * Creates a new br (newline break) for the HTML document
 * and returns this new br instance.
 *
 * @returns The newly created br HTML element instance
 */
function documentAddBr() {
    var br = document.createElement("br");
    return br;
}
/**
 * Creates a new div for the HTML document
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
/**
 * Creates a new select HTML element with the given parameters
 * and returns the newly created select instance.
 *
 * @param id The select's ID
 * @param name The select's name which defines the name of the value
 * that the select represents
 * @param The select's options which will be added as a list of
 * option HTML elements inside the newly created select instance
 * @returns The newly created select instance
 */
function documentAddSelect(id, name, options) {
    var select = document.createElement("select");
    select.id = id;
    select.name = name;
    for (var _i = 0, options_1 = options; _i < options_1.length; _i++) {
        var optionStr = options_1[_i];
        var option = document.createElement("option");
        option.value = optionStr;
        option.innerText = optionStr;
        select.appendChild(option);
    }
    return select;
}
/**
 * Creates a new textarea HTML element with the given parameters
 * and return the newly created textarea instance.
 *
 * @param id The textarea's ID
 * @param text The text which is displayed in the textarea
 * @param cols The textarea's colums (~width in character lines)
 * @param rows The textarea's rows (~height in character lines)
 * @returns The newly created textarea instance
 */
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
    input.size = Number(size);
    input.required = true;
    input.name = name;
    return input;
}
/**
 * Returns the value of the checked
 *
 * @param radioIds The (potentially base, see next argument) IDs of
 * the radios.
 * @param id This ID will be added to each of the radioIds. E.g., if
 * the radioIds are ["A", "B", "C"] and the id is "X", this function looks
 * for the radios with the ids "AX", "BX" and "CX".
 * @returns The value
 */
function documentGetRadiosValue(radioIds, id) {
    var value = "";
    for (var _i = 0, radioIds_1 = radioIds; _i < radioIds_1.length; _i++) {
        var radio = radioIds_1[_i];
        var radioElement = document.getElementById(radio + id);
        if (radioElement.checked) {
            value = radioElement.value;
        }
    }
    // If no value was found, somehow, no radio is checked which
    // should not be the case.
    if (value == "") {
        console.log("ERROR in documentGetRadiosValue with (1st radioIds, 2nd ID):");
        console.log(radioIds);
        console.log(id);
    }
    return value;
}
// CONTROL WIDGET FUNCTION SECTION //
/**
 * Adds a raw canvas widget in the global widgets list
 * at the given position.
 *
 * @param position The position to which the widget will be added
 */
function controlAddCanvas(position) {
    addWidgetAtGlobalPosition(position, getRawCanvas());
}
/**
 * Adds a raw caption widget in the global widgets list
 * at the given position.
 *
 * @param position The position to which the widget will be added
 */
function controlAddCaption(position) {
    addWidgetAtGlobalPosition(position, getRawCaption());
}
/**
 * Adds a raw counter widget in the global widgets list
 * at the given position.
 *
 * @param position The position to which the widget will be added
 */
function controlAddCounter(position) {
    addWidgetAtGlobalPosition(position, getRawCounter());
}
/**
 * Emits a Socket.IO broadcast call to all clients
 * which are connected to the server. This call
 * triggers all clients to the synchrozied and to get
 * the same global widgets set as the triggering
 * client.
 */
function controlBroadcast() {
    console.log("SOCKET.IO: Emitting 'broadcastToServer' event");
    socket.emit("broadcastToServer", gWidgets);
}
/**
 * Deletes the widget with the given position in the global
 * widgets list.
 *
 * @param position The position of the widget that shall
 * be deleted.
 */
function controlDeletePrevious(position) {
    gWidgets.splice(position - 1, 1);
    renderWidgets();
}
/**
 * Adds a raw text widget in the global widgets list
 * at the given position.
 *
 * @param position The position to which the widget will be added
 */
function controlAddText(position) {
    addWidgetAtGlobalPosition(position, getRawText());
}
/**
 * Switches the widget positions before and after the control
 * widget's position. THis is only done if the positions
 * are valid, i.e. greater than 0 and below the global widget
 * list's length.
 */
function controlSwitchWidgets(position) {
    if ((position >= gWidgets.length) || (position == 0)) {
        return;
    }
    var tempWidget = gWidgets[position];
    gWidgets[position] = gWidgets[position - 1];
    gWidgets[position - 1] = tempWidget;
    renderWidgets();
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
    var radiosDrawmode = [
        "radioFree",
        "radioHorizontal",
        "radioVertical",
        "radioRising",
        "radioFalling",
    ];
    var selectedDrawmode = documentGetRadiosValue(radiosDrawmode, id);
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
    var radiosLineWidth = [
        "radioThin",
        "radioMedium",
        "radioThick",
    ];
    var selectedLineWidth = documentGetRadiosValue(radiosLineWidth, id);
    var radiosColor = [
        "radioBlack",
        "radioWhite",
        "radioRed",
        "radioBlue",
        "radioGreen",
        "radioYellow",
    ];
    var selectedColor = documentGetRadiosValue(radiosColor, id);
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
    canvasFillWhite(id);
    // Delete associated widget data
    gPoints = [];
    var index = getWidgetIndexById(id);
    gWidgets[index].data.pointsHistory = [];
}
/**
 * Fills the canvas's drawing content with a white
 * rectangle which has the size of the canvas, thereby
 * creating a completely white canvas.
 *
 * @param id The canvas's base ID
 */
function canvasFillWhite(id) {
    var canvas = document.getElementById("canvas" + id);
    var context = canvas.getContext("2d");
    context.fillStyle = "white";
    context.fillRect(0, 0, canvas.width, canvas.height);
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
    canvasFillWhite(id);
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
    var widthElement = document.getElementById("canvasWidth" + id);
    var newWidth = parseInt(widthElement.value);
    var heightElement = document.getElementById("canvasHeight" + id);
    var newHeight = parseInt(heightElement.value);
    var canvas = document.getElementById("canvas" + id);
    if (newWidth != NaN) {
        canvas.width = newWidth;
    }
    if (newHeight != NaN) {
        canvas.height = newHeight;
    }
    canvasFillWhite(id);
    var index = getWidgetIndexById(id);
    gWidgets[index].data.width = newWidth;
    gWidgets[index].data.height = newHeight;
    canvasDrawPointsOnIt(id, gWidgets[index].data.pointsHistory);
}
// CAPTION WIDGET FUNCTIONS SECTION //
/**
 * Changes the caption-associated Widget's level to the
 * current value of the level select element.
 *
 * @param id The caption's base ID
 */
function captionChangeLevel(id) {
    var select = document.getElementById("selectLevel" + id);
    var level = select.value;
    var index = getWidgetIndexById(id);
    gWidgets[index].data.level = level;
}
/**
 * Changes the caption-associated Widget's data.id to the
 * current value of the associated ID text line input.
 *
 * @param id The caption's base ID, which is not the data.id value
 */
function captionChangeId(id) {
    var input = document.getElementById("captionId" + id);
    var index = getWidgetIndexById(id);
    gWidgets[index].data.id = input.value;
}
/**
 * Changes the caption-associated Widget's text value to the
 * current value of the associated text line input element.
 *
 * @param id The caption's base ID
 */
function captionChangeText(id) {
    var input = document.getElementById("captionText" + id);
    var index = getWidgetIndexById(id);
    gWidgets[index].data.text = input.value;
}
// COUNTER WIDGET FUNCTIONS SECTION //
/**
 * Changes the counter Widget's data.family value to the current value
 * of the associated text label element's value.
 *
 * @param id The counter's base ID
 */
function counterChangeFamily(id) {
    var input = document.getElementById("counterFamily" + id);
    var index = getWidgetIndexById(id);
    gWidgets[index].data.family = input.value;
}
/**
 * Changes the counter Widget's data.reference value to the current value
 * of the associated text label element's value.
 *
 * @param id The counter's base ID
 */
function counterChangeReference(id) {
    var input = document.getElementById("counterReference" + id);
    var index = getWidgetIndexById(id);
    gWidgets[index].data.family = input.value;
}
/**
 * Switches the counter Widget instance's br boolean value
 * to the value of the associated checkbox.
 *
 * @param id The counter's base ID
 */
function counterSwitchBr(id) {
    var checkbox = document.getElementById("boxBr" + id);
    var index = getWidgetIndexById(id);
    gWidgets[index].data.br = checkbox.checked;
}
// MENU WIDGET FUNCTIONS //
/**
 * Emits a Socket.IO call to the server so that it is triggered
 * to start its JSON export routine. As data, the current global
 * widgets are sent.
 * Additionally, for all canvases, base64 JPEG representations of their
 * drawing content are added as information.
 */
function menuExport() {
    var widgetsWithBase64 = gWidgets;
    for (var i = 0; i < widgetsWithBase64.length; i++) {
        if (widgetsWithBase64[i].type != "canvas") {
            continue;
        }
        var canvas = document.getElementById("canvas" + widgetsWithBase64[i].id);
        // We fill the canvas with white color in order to the
        // the otherwise black background white
        canvasFillWhite(widgetsWithBase64[i].id);
        canvasDrawPointsOnIt(widgetsWithBase64[i].id, widgetsWithBase64[i].data.pointsHistory);
        var base64str = canvas.toDataURL("image/jpeg");
        widgetsWithBase64[i].data["base64"] = base64str;
    }
    console.log("SOCKET.IO: Emitting 'export' event");
    socket.emit("export", widgetsWithBase64);
}
/**
 * Emits a Socket.IO call to the server so that it is triggered
 * to start its JSON loading routine. The server will answer
 * with a client broadcast if the loading is successful.
 */
function menuLoad() {
    console.log("SOCKET.IO: Emitting 'load' event");
    socket.emit("load", "");
}
/**
 * Emits a Socket.IO call to the server so that it is triggered
 * to start its JSON saving routine. As data, the current global
 * widgets are sent.
 */
function menuSave() {
    console.log("SOCKET.IO: Emitting 'save' event");
    socket.emit("save", gWidgets);
}
// TEXT WIDGET FUNCTIONS SECTION //
/**
 * Add the symbol(s) "**" to the text widget's
 * textarea, according to the textareaInsert
 * logic. In Markdown, two "**" stand for bold
 * text.
 *
 * @param id The text widget's base ID
 */
function textareaAddBold(id) {
    textareaInsert(id, "**", true);
}
/**
 * Add the symbol(s) "_" to the text widget's
 * textarea, according to the textareaInsert
 * logic. In Markdown, two "_" stand for italic
 * text.
 *
 * @param id The text widget's base ID
 */
function textareaAddItalic(id) {
    textareaInsert(id, "_", true);
}
/**
 * Add the symbols "[Text](URL)" to the text widget's
 * textarea, according to the textareaInsert
 * logic. The symbols are a general expression of
 * Markdown's description of a hyperlink.
 *
 * @param id The text widget's base ID
 */
function textareaAddHyperlink(id) {
    textareaInsert(id, "[Text](URL)", false);
}
/**
 * Add the symbols "{CAPTION{ID}CAPTION}" to the text widget's
 * textarea, according to the textareaInsert
 * logic. The symbols are our general expression
 * for a caption ID.
 *
 * @param id The text widget's base ID
 */
function textareaAddCaption(id) {
    textareaInsert(id, "{CAPTION{ID}CAPTION}", false);
}
/**
 * Add the symbols "{COUNTER{REFERENCE}COUNTER}" to the text widget's
 * textarea, according to the textareaInsert
 * logic. The symbols are our general expression
 * for a counter reference.
 *
 * @param id The text widget's base ID
 */
function textareaAddCounter(id) {
    textareaInsert(id, "{COUNTER{REFERENCE}COUNTER}", false);
}
/**
 * Add the symbols "<br>" to the text widget's
 * textarea, according to the textareaInsert
 * logic. The symbols are HTML's expression
 * for a newline without an extra space for
 * a new paragraph.
 *
 * @param id The text widget's base ID
 */
function textareaAddNewline(id) {
    textareaInsert(id, "<br>", false);
}
/**
 * Adds text to the text widget's textarea element according to
 * the "multi" argument logic (see this parameter).
 *
 * @param id The text widget's base ID
 * @param insert The string that shall be added
 * @param multi The logic of the string addition: A) If it is "true",
 * there are 2 possible cases: 1) If the user selected an area, then
 * the insert will be added at the beginning and the end of the selection.
 * This is e.g. helpful in order to add the "*" symbol (for bold text)
 * for a whole selection. 2) If the user only selected a single character,
 * only one character will be added. B) If it is "false", then the insert
 * is always only inserted once: 1) If the user selected an area, then
 * the insert will be added at the selection's beginning only. 2) If the
 * user selected only a single character, the insert will be added there.
 */
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
/**
 * Sets the textarea's associated global widget representation
 * of its bordercolor to the given value.
 *
 * @param id The textarea's base ID
 * @param color The bordercolor to which the associated textarea's
 * global widget representation data shall be set
 */
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
/**
 * Sets the text Widget's font value to the given
 * font.
 *
 * @param id The text widget's base ID
 * @param font The font which will be set for the text widget
 */
function textareaSetFont(id, font) {
    var index = getWidgetIndexById(id);
    gWidgets[index].data.font = font;
}
/**
 * Changes the text widget's text value to the current
 * input in the associated textarea element.
 *
 * @param id The text widget's base ID
 */
function textareaUpdateWidgetText(id) {
    var index = getWidgetIndexById(id);
    var textarea = document.getElementById("textarea" + id);
    gWidgets[index].data.text = textarea.value;
}
// RENDER FUNCTIONS SECTION //
/**
 * Renders the canvas with the given associated widget data
 * (which includes e.g. the ID, points etc.) in the form of
 * the addition of a div with all associated canvas HTML
 * elements. This div is added at the bottom of the HTML
 * element.
 *
 * @param widget The associated widget object
 */
function renderCanvasDiv(widget) {
    var id = widget.id;
    var index = getWidgetIndexById(id);
    var div = documentAddDiv("divCanvas" + id);
    // Canvas movement div
    var moveDiv = documentAddDiv("canvasMovement" + id);
    var clearButton = documentAddButton("buttonClear" + id, function () { canvasClear(id); }, "Clear");
    moveDiv.appendChild(clearButton);
    var leftButton = documentAddButton("buttonMoveLeft" + id, function () { canvasMove(id, -3, 0); }, "Move left");
    moveDiv.appendChild(leftButton);
    var rightButton = documentAddButton("buttonMoveRight" + id, function () { canvasMove(id, 3, 0); }, "Move right");
    moveDiv.appendChild(rightButton);
    var downButton = documentAddButton("buttonMoveDown" + id, function () { canvasMove(id, 0, 3); }, "Move down");
    moveDiv.appendChild(downButton);
    var upButton = documentAddButton("buttonMoveUp" + id, function () { canvasMove(id, 0, -3); }, "Move up");
    moveDiv.appendChild(upButton);
    div.appendChild(moveDiv);
    // Canvas size div
    var sizeDiv = documentAddDiv("canvasSize" + id);
    var widthLabel = documentAddLabel("canvasWidth" + id, "Width: ");
    var widthInput = documentAddTextlineInput("canvasWidth" + id, "canvasWidth", "500", "5");
    sizeDiv.appendChild(widthLabel);
    sizeDiv.appendChild(widthInput);
    var heightLabel = documentAddLabel("canvasHeight" + id, " Height: ");
    var heightInput = documentAddTextlineInput("canvasHeight" + id, "canvasHeight", "50", "5");
    sizeDiv.appendChild(heightLabel);
    sizeDiv.appendChild(heightInput);
    var resizeButton = documentAddButton("buttonResize" + id, function () { canvasResize(id); }, "Resize");
    sizeDiv.appendChild(resizeButton);
    div.appendChild(sizeDiv);
    // Canvas color form
    var colorDiv = documentAddDiv("canvasColor" + id);
    var radioBlack = documentAddRadioInput("radioBlack" + id, "color", "black", true, function () { });
    var labelBlack = documentAddLabel("radioBlack" + id, "Black");
    colorDiv.appendChild(radioBlack);
    colorDiv.appendChild(labelBlack);
    var radioWhite = documentAddRadioInput("radioWhite" + id, "color", "white", false, function () { });
    var labelWhite = documentAddLabel("radioWhite" + id, "White");
    colorDiv.appendChild(radioWhite);
    colorDiv.appendChild(labelWhite);
    var radioRed = documentAddRadioInput("radioRed" + id, "color", "red", false, function () { });
    var labelRed = documentAddLabel("radioRed" + id, "Red");
    colorDiv.appendChild(radioRed);
    colorDiv.appendChild(labelRed);
    var radioBlue = documentAddRadioInput("radioBlue" + id, "color", "blue", false, function () { });
    var labelBlue = documentAddLabel("radioBlue" + id, "Blue");
    colorDiv.appendChild(radioBlue);
    colorDiv.appendChild(labelBlue);
    var radioGreen = documentAddRadioInput("radioGreen" + id, "color", "green", false, function () { });
    var labelGreen = documentAddLabel("radioGreen" + id, "Green");
    colorDiv.appendChild(radioGreen);
    colorDiv.appendChild(labelGreen);
    var radioYellow = documentAddRadioInput("radioYellow" + id, "color", "yellow", false, function () { });
    var labelYellow = documentAddLabel("radioYellow" + id, "Yellow");
    colorDiv.appendChild(radioYellow);
    colorDiv.appendChild(labelYellow);
    div.appendChild(colorDiv);
    // Pencil width div
    var widthDiv = documentAddDiv("canvasWidth" + id);
    var radioThin = documentAddRadioInput("radioThin" + id, "width", "thin", true, function () { });
    var labelThin = documentAddLabel("radioThin" + id, "Thin");
    widthDiv.appendChild(radioThin);
    widthDiv.appendChild(labelThin);
    var radioMedium = documentAddRadioInput("radioMedium" + id, "width", "medium", false, function () { });
    var labelMedium = documentAddLabel("radioMedium" + id, "Medium");
    widthDiv.appendChild(radioMedium);
    widthDiv.appendChild(labelMedium);
    var radioThick = documentAddRadioInput("radioThick" + id, "width", "thick", false, function () { });
    var labelThick = documentAddLabel("radioThick" + id, "Thick");
    widthDiv.appendChild(radioThick);
    widthDiv.appendChild(labelThick);
    var checkboxPressure = documentAddCheckboxInput("boxPressure" + id, "pressure", widget.data.isLocked, function () { });
    var labelPressure = documentAddLabel("boxPressure" + id, "Pressure?");
    widthDiv.appendChild(checkboxPressure);
    widthDiv.appendChild(labelPressure);
    var checkboxLocked = documentAddCheckboxInput("boxLocked" + id, "locked", widget.data.isWithPressure, function () { canvasLock(id); });
    var labelLocked = documentAddLabel("boxLocked" + id, "Locked?");
    widthDiv.appendChild(checkboxLocked);
    widthDiv.appendChild(labelLocked);
    div.appendChild(widthDiv);
    // Drawmode form
    var drawmodeDiv = documentAddDiv("drawmodeRadios" + id);
    var radioFree = documentAddRadioInput("radioFree" + id, "drawmode", "free", true, function () { });
    var labelFree = documentAddLabel("radioFree" + id, "Free");
    drawmodeDiv.appendChild(radioFree);
    drawmodeDiv.appendChild(labelFree);
    var radioHorizontal = documentAddRadioInput("radioHorizontal" + id, "drawmode", "horizontal", false, function () { });
    var labelHorizontal = documentAddLabel("radioHorizontal" + id, "Horizontal");
    drawmodeDiv.appendChild(radioHorizontal);
    drawmodeDiv.appendChild(labelHorizontal);
    var radioVertical = documentAddRadioInput("radioVertical" + id, "drawmode", "vertical", false, function () { });
    var labelVertical = documentAddLabel("radioVertical" + id, "Vertical");
    drawmodeDiv.appendChild(radioVertical);
    drawmodeDiv.appendChild(labelVertical);
    var radioRising = documentAddRadioInput("radioRising" + id, "drawmode", "rising", false, function () { });
    var labelRising = documentAddLabel("radioRising" + id, "Rising");
    drawmodeDiv.appendChild(radioRising);
    drawmodeDiv.appendChild(labelRising);
    var radioFalling = documentAddRadioInput("radioFalling" + id, "drawmode", "falling", false, function () { });
    var labelFalling = documentAddLabel("radioFalling" + id, "Falling");
    drawmodeDiv.appendChild(radioFalling);
    drawmodeDiv.appendChild(labelFalling);
    div.appendChild(drawmodeDiv);
    // The actual canvas
    var canvas = document.createElement("canvas");
    canvas.id = "canvas" + id;
    canvas.width = gWidgets[index].data.width;
    canvas.height = gWidgets[index].data.height;
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
    canvasFillWhite(id);
    canvasDrawPointsOnIt(id, widget.data.pointsHistory);
}
/**
 * Renders the caption with the given associated widget data
 * (which includes e.g. the ID etc.) in the form of
 * the addition of a div with all associated caption HTML
 * elements. This div is added at the bottom of the HTML
 * element.
 *
 * @param widget The associated widget object
 */
function renderCaptionDiv(widget) {
    var id = widget.id;
    var div = documentAddDiv("divCaption" + id);
    var levelLabel = documentAddLabel("selectLevel" + id, "Caption level:");
    var options = ["1", "2", "3", "4", "5", "6"];
    var select = documentAddSelect("selectLevel" + id, "level", options);
    select.value = widget.data.level;
    select.onchange = function () { captionChangeLevel(id); };
    div.appendChild(levelLabel);
    div.appendChild(select);
    var labelId = documentAddLabel("captionId" + id, " ID: ");
    var inputId = documentAddTextlineInput("captionId" + id, "captionId", widget.data.id, "10");
    inputId.onkeyup = function () { captionChangeId(id); };
    div.appendChild(labelId);
    div.appendChild(inputId);
    var labelText = documentAddLabel("captionText" + id, " Text: ");
    var inputText = documentAddTextlineInput("captionText" + id, "captionText", widget.data.text, "25");
    inputText.onkeyup = function () { captionChangeText(id); };
    div.appendChild(labelText);
    div.appendChild(inputText);
    document.body.appendChild(div);
}
/**
 * Renders the counter with the given associated widget data
 * (which includes e.g. the ID etc.) in the form of
 * the addition of a div with all associated counter HTML
 * elements. This div is added at the bottom of the HTML
 * element.
 *
 * @param widget The associated widget object
 */
function renderCounterDiv(widget) {
    var id = widget.id;
    var div = documentAddDiv("divCounter" + id);
    var labelFamily = documentAddLabel("counterFamily" + id, "Counter family (required): ");
    var inputFamily = documentAddTextlineInput("counterFamily" + id, "counterFamily", widget.data.family, "10");
    inputFamily.onkeyup = function () { counterChangeFamily(id); };
    div.appendChild(labelFamily);
    div.appendChild(inputFamily);
    var labelReference = documentAddLabel("counterReference" + id, " Reference (optional): ");
    var inputReferece = documentAddTextlineInput("counterReference" + id, "counterReference", widget.data.reference, "10");
    inputReferece.onkeyup = function () { counterChangeReference(id); };
    div.appendChild(labelReference);
    div.appendChild(inputReferece);
    var checkboxBr = documentAddCheckboxInput("boxBr" + id, "br", widget.data.br, function () { counterSwitchBr(id); });
    var labelBr = documentAddLabel("boxBr" + id, "Newline?");
    div.appendChild(checkboxBr);
    div.appendChild(labelBr);
    document.body.appendChild(div);
}
/**
 * Renders the control with its position which shows
 * to which widget(s) of the global widget lists it
 * refers to. This div is added at the bottom of the HTML
 * element.
 *
 * @param position The control's position
 */
function renderControlDiv(position) {
    var div = documentAddDiv("divControl" + position);
    var addCanvas = documentAddButton("buttonAddCanvas" + position, function () { controlAddCanvas(position); }, "+Canvas");
    div.appendChild(addCanvas);
    var addText = documentAddButton("buttonAddText" + position, function () { controlAddText(position); }, "+Text");
    div.appendChild(addText);
    var addCaption = documentAddButton("buttonAddCaption" + position, function () { controlAddCaption(position); }, "+Caption");
    div.appendChild(addCaption);
    var addCounter = documentAddButton("buttonAddCounter" + position, function () { controlAddCounter(position); }, "+Counter");
    div.appendChild(addCounter);
    var switchWidgets = documentAddButton("buttonSwitch" + position, function () { controlSwitchWidgets(position); }, "/\\ Switch \\/");
    div.appendChild(switchWidgets);
    var deletePrevious = documentAddButton("buttonDeletePrevious" + position, function () { controlDeletePrevious(position); }, "/\\ Delete");
    div.appendChild(deletePrevious);
    var broadcast = documentAddButton("buttonBroadcast" + position, function () { controlBroadcast(); }, "BROADCAST");
    div.appendChild(broadcast);
    var hr = document.createElement("hr");
    div.appendChild(hr);
    document.body.appendChild(div);
}
/**
 * Renders the menu with the given associated widget elements
 * (such as the buttons) in the form of
 * the addition of a div. This div is added at the bottom
 * of the HTML element.
 */
function renderMenuDiv() {
    var div = documentAddDiv("divMenu");
    var loadButton = documentAddButton("loadButton", function () { menuLoad(); }, "Load...");
    div.appendChild(loadButton);
    var saveButton = documentAddButton("saveButton", function () { menuSave(); }, "Save...");
    div.appendChild(saveButton);
    var exportButton = documentAddButton("exportButton", function () { menuExport(); }, "Export...");
    div.appendChild(exportButton);
    var hr = document.createElement("hr");
    div.appendChild(hr);
    document.body.appendChild(div);
}
/**
 * Renders the text with the given associated widget data
 * (which includes e.g. the textarea text etc.) in the form of
 * the addition of a div with all associated text HTML
 * elements. This div is added at the bottom of the HTML
 * element.
 *
 * @param widget The associated widget object
 */
function renderTextDiv(widget) {
    var id = widget.id;
    var div = documentAddDiv("divText" + id);
    // Border color radios
    var bordercolorDiv = documentAddDiv("textBordercolor" + id);
    var isNone = widget.data.bordercolor == "none";
    var radioNone = documentAddRadioInput("radioNone" + id, "bordercolor", "none", isNone, function () { textareaSetBordercolor(id, "none"); });
    var labelNone = documentAddLabel("radioNone" + id, "None");
    bordercolorDiv.appendChild(radioNone);
    bordercolorDiv.appendChild(labelNone);
    var isBlack = widget.data.bordercolor == "black";
    var radioBlack = documentAddRadioInput("radioBlack" + id, "bordercolor", "black", isBlack, function () { textareaSetBordercolor(id, "none"); });
    var labelBlack = documentAddLabel("radioBlack" + id, "Black");
    bordercolorDiv.appendChild(radioBlack);
    bordercolorDiv.appendChild(labelBlack);
    div.appendChild(bordercolorDiv);
    // Font radios
    var fontDiv = documentAddDiv("textBordercolor" + id);
    var isStandard = widget.data.font == "standard";
    var radioStandard = documentAddRadioInput("radioStandard" + id, "font", "standard", isStandard, function () { textareaSetFont(id, "none"); });
    var labelStandard = documentAddLabel("radioStandard" + id, "Standard");
    fontDiv.appendChild(radioStandard);
    fontDiv.appendChild(labelStandard);
    div.appendChild(fontDiv);
    var isMonospaced = widget.data.font == "monospaced";
    var radioMonospaced = documentAddRadioInput("radioMonospaced" + id, "font", "monospaced", isMonospaced, function () { textareaSetFont(id, "monospaced"); });
    var labelMonospaced = documentAddLabel("radioMonospaced" + id, "Monospaced");
    fontDiv.appendChild(radioMonospaced);
    fontDiv.appendChild(labelMonospaced);
    div.appendChild(fontDiv);
    // Text addition buttons
    var buttonBold = documentAddButton("buttonBold" + id, function () { textareaAddBold(id); }, "Bold");
    div.appendChild(buttonBold);
    var buttonItalic = documentAddButton("buttonItalic" + id, function () { textareaAddItalic(id); }, "Italic");
    div.appendChild(buttonItalic);
    var buttonHyperlink = documentAddButton("buttonHyperlink" + id, function () { textareaAddHyperlink(id); }, "Hyperlink");
    div.appendChild(buttonHyperlink);
    var buttonCaption = documentAddButton("buttonCaption" + id, function () { textareaAddCaption(id); }, "Caption");
    div.appendChild(buttonCaption);
    var buttonCounter = documentAddButton("buttonCounter" + id, function () { textareaAddCounter(id); }, "Counter");
    div.appendChild(buttonCounter);
    var buttonNewline = documentAddButton("buttonNewline" + id, function () { textareaAddNewline(id); }, "Newline");
    div.appendChild(buttonNewline);
    // Newline after buttons
    var br = document.createElement("br");
    div.appendChild(br);
    // The actual textarea
    var labelTextarea = documentAddLabel("textarea" + id, "");
    var textarea = documentAddTextarea("textarea" + id, widget.data.text, 75, 10);
    div.appendChild(labelTextarea);
    div.appendChild(textarea);
    // Events
    textarea.onkeyup = function () { textareaUpdateWidgetText(id); };
    document.body.appendChild(div);
    textareaUpdateWidgetText(id);
}
/**
 * Deletes the total HTML document's body content
 * and then adds the global widgets as HTML elements
 * according to their order in the global widgets
 * list, thereby redrawing all elements.
 */
function renderWidgets() {
    document.body.innerHTML = "";
    renderMenuDiv();
    var position = 1;
    if (gWidgets.length == 0) {
        renderControlDiv(position);
    }
    for (var _i = 0, gWidgets_2 = gWidgets; _i < gWidgets_2.length; _i++) {
        var widget = gWidgets_2[_i];
        if (widget.type == "canvas") {
            renderCanvasDiv(widget);
        }
        else if (widget.type == "text") {
            renderTextDiv(widget);
        }
        else if (widget.type == "counter") {
            renderCounterDiv(widget);
        }
        else if (widget.type == "caption") {
            renderCaptionDiv(widget);
        }
        renderControlDiv(position);
        position++;
    }
}
renderWidgets();
/*
for (const events of ["touchend", "touchleave", "mouseup", "keyup"]) {
    document.body.addEventListener(events, function(event: any) {
        //
    })
}
*/
