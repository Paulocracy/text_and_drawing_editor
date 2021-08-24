/**
 * TypeScript code for the basic Python WebSocket server.
 */

// IMPORTANT: DO NOT CHANGE THE CODE AND DO NOT PUT LINES IN FRONT
// STARTING FROM THIS LINE UP TO...
// Import sockets.io-client library which
// is locally stored in the "static" folder.
import { io }  from "./socket.io"
/** Global socket variable which is the main handler for Sockets.io */
var socket = io()
// ...THIS LINE (END OF LINES WHICH MUST NOT BE CHANGED)
// The reason for why this is done: Otherwise, run.py's transformation
// for a working static import wouldn't work correctly

socket.on('connect', function() {
    alert("Server connected")
})
socket.on('custom_event_2', function() {
    socket.emit('custom_event_3', {data: 'I\'m connected!'})
})
socket.on('custom_event_4', function() {
    socket.emit('custom_event_5', "The end.")
})
function button_function() {
    socket.emit('custom_event_1', {data: 'I\'m connected!'})
}


//////////////////////////////
// GLOBAL VARIABLES SECTION //
// All global variables start with "g"
/**
 * Global variable tracking whether or not the user's mouse in in a "down" state, i.e,
 * if a mouse button is currently pressed.
*/
let gIsMouseDown = false
/**
 * Global variable containing all drawn points since the user pressed
 * a mouse button for the last time.
 */
let gPoints: any[] = []
/**
 * Global variable containing the Point in the currently active canvas
 * at the beginning of the current drawing process.
 */
let gStartPoint: any
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
let gWidgets = [
    {
        id: "ABCDE",
        type: "canvas",
        data: {
            pointsHistory: [],
            isLocked: false,
            isWithPressure: false,
        },
    },
    {
        id: "BBBB",
        type: "canvas",
        data: {
            pointsHistory: [],
            isLocked: false,
            isWithPressure: false,
        },
    },
    {
        id: "XXXX",
        type: "text",
        data: {
            text: "ABC",
            bordercolor: "none",
            font: "standard",
        }
    }
]


// GLOBAL WIDGET FUNCTION SECTION //
/**
 * Returns the index (i.e., 0 up to the length of the global widgets variable)
 * of the element with the given ID in the global widgets variable.
 *
 * @param id The ID of the widget for which we are looking after its ID in
 * the global widgest variable.
 * @returns
 */
 function getWidgetIndexById(id: string): number {
    let index = 0
    for (let widget of gWidgets) {
        if (widget.id == id) {
            break
        }
        index++
    }
    return index
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
function getPoint(x: number, y: number, lineWidth: number, color: string, hasVisibleLineToIt: boolean) {
    return {
        x: x,
        y: y,
        lineWidth: lineWidth,
        color: color,
        hasVisibleLineToIt: hasVisibleLineToIt,
    }
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
function documentAddButton(id: string, onclick: any, text: string) {
    let button = document.createElement("button")
    button.id = id
    button.onclick = onclick
    button.textContent = text
    return button
}

/**
 * Creates a new div at the bottom for the HTML document
 * and returns this new div instance.
 *
 * @param id The div's ID. It should be unique in the whole document
 * @returns The newly created div HTML element instance
 */
function documentAddDiv(id: string) {
    let div = document.createElement("div")
    div.id = id
    return div
}

/**
 * Creates a new form element for the HTML document
 * and returns this new form instance.
 *
 * @param id The form's ID. It should be unique in the whole document
 * @param method The form's action method (such as "dialog")
 * @returns The newly created form HTML element instance
 */
function documentAddForm(id: string, method: HTMLFormElement['method']) {
    let form = document.createElement("form")
    form.name = id
    form.method = method
    return form
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
function documentAddLabel(htmlFor: string, text: string) {
    let label = document.createElement("label")
    label.htmlFor = htmlFor
    label.innerText = text
    return label
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
function documentAddCheckboxInput(id: string, name: string, isChecked: boolean, onclick: any) {
    let input = document.createElement("input")
    input.type = "checkbox"
    input.id = id
    input.name = name
    input.checked = isChecked
    input.onclick = onclick
    return input
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
function documentAddRadioInput(id: string, name: string, value: string, checked: boolean, onclick: any) {
    let input = document.createElement("input")
    input.type = "radio"
    input.id = id
    input.name = name
    input.value = value
    input.checked = checked
    input.onclick = onclick
    return input
}

function documentAddTextarea(id: string, text: string, cols: number, rows: number) {
    let textarea = document.createElement("textarea")
    textarea.id = id
    textarea.value = text
    textarea.cols = cols
    textarea.rows = rows
    // Auto-resize height thanks to the answer of
    // https://stackoverflow.com/questions/7745741/auto-expanding-textarea
    textarea.oninput = function() {
        textarea.style.height = ""
        textarea.style.height = Math.min(textarea.scrollHeight, 300) + "px"
    }
    return textarea
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
function documentAddTextlineInput(id: string, name: string, value: string, size: string) {
    let input = document.createElement("input")
    input.type = "text"
    input.id = id
    input.value = value
    input.size = 2
    input.required = true
    input.name = name
    return input
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
function canvasAddPoint(event: any, id: string, hasVisibleLineToIt: boolean, setStartPoint: boolean) {
    const canvas: any = document.getElementById("canvas"+id)
    const index = getWidgetIndexById(id)

    let selectedDrawmode: string
    selectedDrawmode = document.forms.namedItem("drawmodeRadios"+id).drawmode.value

    let pressure: number
    let x: number
    let y: number
    let pageXYhandler: any
    if (event.touches && event.touches[0] && typeof event.touches[0]["force"] !== "undefined") {
      if (event.touches[0]["force"] > 0) {
          const checkbox: any = document.getElementById("boxPressure"+id)
          if (checkbox.checked) {
            pressure = event.touches[0]["force"]
          } else {
              pressure = 1.0
          }
      } else {
          pressure = 1.0
      }
      pageXYhandler = event.touches[0]
    } else {
      pressure = 1.0
      pageXYhandler = event
    }

    if (selectedDrawmode == "free") {
        x = pageXYhandler.pageX - canvas.offsetLeft
        y = pageXYhandler.pageY - canvas.offsetTop
    } else if (selectedDrawmode == "horizontal") {
        x = pageXYhandler.pageX - canvas.offsetLeft
        y = gStartPoint.y
    } else if (selectedDrawmode == "vertical") {
        x = gStartPoint.x
        y = pageXYhandler.pageY - canvas.offsetTop
    } else if (selectedDrawmode == "rising") {
        x = pageXYhandler.pageX - canvas.offsetLeft
        y = gStartPoint.y - (x - gStartPoint.x)
    } else if (selectedDrawmode == "falling") {
        x = pageXYhandler.pageX - canvas.offsetLeft
        y = gStartPoint.y + (x - gStartPoint.x)
    }

    const selectedColor = document.forms.namedItem("canvasColor"+id).color.value
    const selectedLineWidth = document.forms.namedItem("canvasWidth"+id).width.value
    let resultingLineWidth: number = Math.log(pressure+1)
    if (selectedLineWidth == "thin") {
        resultingLineWidth *= 5.0
    } else if (selectedLineWidth == "medium") {
        resultingLineWidth *= 10.0
    } else if (selectedLineWidth == "thick") {
        resultingLineWidth *= 100.0
    }

    const newPoint = getPoint(x, y, resultingLineWidth, selectedColor, hasVisibleLineToIt)
    gPoints.push(newPoint)
    gWidgets[index].data.pointsHistory.push(newPoint)

    if (setStartPoint) {
        gStartPoint = newPoint
    }

    canvasDrawPointsOnIt(id, gPoints)
}

/**
 * Deletes the drawing content of the canvas as well
 * as its associated widget data.
 *
 * @param id The canvas's ID
 */
function canvasClear(id: string) {
    // Delete the canvas's drawing content
    const canvas: any = document.getElementById("canvas"+id)
    const context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)

    // Delete associated widget data
    gPoints = []
    const index = getWidgetIndexById(id)
    gWidgets[index].data.pointsHistory = []
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
function canvasDrawPointsOnIt(id: string, points: any[]) {
    const canvas: any = document.getElementById("canvas"+id)
    const context = canvas.getContext("2d")
    context.lineCap = "round"
    context.lineJoin = "round"

    for (let right_index=1; right_index<points.length; right_index++) {
        context.strokeStyle = points[right_index].color
        context.lineWidth = points[right_index].lineWidth
        context.beginPath()
        context.moveTo(points[right_index-1].x, points[right_index-1].y)
        if(points[right_index].hasVisibleLineToIt) {
            context.lineTo(points[right_index].x, points[right_index].y)
        }
        context.closePath()
        context.stroke()
    }
    gPoints.reverse()
    while(gPoints.length > 1) {
        gPoints.pop()
    }
}

/**
 * Switches (from true to false or from false to true) the "isLocked"
 * value of the canvas wiht the given ID. If "isLocked" is true, it's
 * not possible to draw on the canvas.
 *
 * @param id The canvas's id (without "canvas" at beginning)
 */
function canvasLock(id: string) {
    const index = getWidgetIndexById(id)
    gWidgets[index].data.isLocked = !gWidgets[index].data.isLocked
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
function canvasMove(id: string, xMove: number, yMove: number) {
    let index = getWidgetIndexById(id)

    for (let i=0; i<gWidgets[index].data.pointsHistory.length; i++) {
        gWidgets[index].data.pointsHistory[i].x += xMove
        gWidgets[index].data.pointsHistory[i].y += yMove
    }

    const canvas: any = document.getElementById("canvas"+id)
    const context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)

    canvasDrawPointsOnIt(id, gWidgets[index].data.pointsHistory)
}

/**
 * Resizes the canvas width and height according to its associated
 * size text line inputs. Since a resize deletes the canvas's content,
 * the content is redrawn after the resize.
 *
 * @param id The canvas's ID
 */
function canvasResize(id: string) {
    // TODO: Make it independent from the text line input
    const newWidth = parseInt(document.forms.namedItem("canvasSize"+id).canvasWidth.value)
    const newHeight = parseInt(document.forms.namedItem("canvasSize"+id).canvasHeight.value)
    const canvas: any = document.getElementById("canvas"+id)

    if (newWidth != NaN) {
        canvas.width = newWidth
    }
    if (newHeight != NaN) {
        canvas.height = newHeight
    }

    const index = getWidgetIndexById(id)
    canvasDrawPointsOnIt(id, gWidgets[index].data.pointsHistory)
}


// TEXTAREA WIDGET FUNCTIONS SECTION //
function textareaInsert(id: string, insert: string, multi: boolean) {
    const textarea: any = document.getElementById("textarea"+id)
    const selectionStart = textarea.selectionStart
    const selectionEnd = textarea.selectionEnd
    const oldtext: string = textarea.value
    let newtext: string = ""
    if ((selectionStart == selectionEnd) || (!multi)) {
        newtext = oldtext.slice(0, selectionEnd) + insert
        newtext += oldtext.slice(selectionEnd)
    } else {
        newtext = oldtext.slice(0, selectionStart) + insert
        newtext += oldtext.slice(selectionStart, selectionEnd) + insert
        newtext += oldtext.slice(selectionEnd)
    }

    textarea.value = newtext
    textareaUpdateWidgetText(id)
}

function textareaAddBold(id: string) {
    textareaInsert(id, "*", true)
}

function textareaAddItalic(id: string) {
    textareaInsert(id, "_", true)
}

function textareaAddHyperlink(id: string) {
    textareaInsert(id, "[Text](URL)", false)
}

function textareaAddAnchor(id: string) {
    textareaInsert(id, "{{{ID}}}", false)
}

function textareaAddCounter(id: string) {
    textareaInsert(id, "{{{{ID}}}}", false)
}

function textareaAddNewline(id: string) {
    textareaInsert(id, "<br>", false)
}

function textareaSetBordercolor(id: string, color: string) {
    let index = getWidgetIndexById(id)
    gWidgets[index].data.bordercolor = color
    const textarea = document.getElementById("textarea"+id)
    if (color == "none") {
        textarea.style.border = "1px solid " + color
    } else {
        textarea.style.border = "1px solid " + color
    }
}

function textareaSetFont(id: string, font: string) {
    let index = getWidgetIndexById(id)
    gWidgets[index].data.font = font
}

function textareaUpdateWidgetText(id: string) {
    let index = getWidgetIndexById(id)
    const textarea: any = document.getElementById("textarea"+id)
    gWidgets[index].data.text = textarea.value
}

// RENDER FUNCTIONS SECTION //
function renderTextDiv(widget: any) {
    let id = widget.id
    let div = documentAddDiv("divText"+id)

    // Border color radios
    let bordercolorForm = documentAddForm("textBordercolor"+id, "dialog")
    const isNone = widget.data.bordercolor == "none"
    const radioNone = documentAddRadioInput("radioNone"+id, "bordercolor", "none", isNone,
        function() { textareaSetBordercolor(id, "none") })
    const labelNone = documentAddLabel("radioNone"+id, "None")
    bordercolorForm.appendChild(radioNone)
    bordercolorForm.appendChild(labelNone)
    const isBlack = widget.data.bordercolor == "black"
    const radioBlack = documentAddRadioInput("radioBlack"+id, "bordercolor", "black", isBlack,
        function() { textareaSetBordercolor(id, "none") })
    const labelBlack = documentAddLabel("radioNone"+id, "Black")
    bordercolorForm.appendChild(radioBlack)
    bordercolorForm.appendChild(labelBlack)
    div.appendChild(bordercolorForm)

    // Font radios
    let fontForm = documentAddForm("textBordercolor"+id, "dialog")
    const isStandard = widget.data.font == "standard"
    const radioStandard = documentAddRadioInput("radioStandard"+id, "font", "standard", isStandard,
        function() { textareaSetFont(id, "none") })
    const labelStandard = documentAddLabel("radioStandard"+id, "Standard")
    fontForm.appendChild(radioStandard)
    fontForm.appendChild(labelStandard)
    div.appendChild(fontForm)
    const isMonospaced = widget.data.font == "monospaced"
    const radioMonospaced = documentAddRadioInput("radioMonospaced"+id, "font", "monospaced", isMonospaced,
        function() { textareaSetFont(id, "monospaced") })
    const labelMonospaced = documentAddLabel("radioMonospaced"+id, "Monospaced")
    fontForm.appendChild(radioMonospaced)
    fontForm.appendChild(labelMonospaced)
    div.appendChild(fontForm)

    // Text addition buttons
    const buttonBold = documentAddButton(
        "buttonBold"+id,
        function() { textareaAddBold(id) },
        "Bold"
    )
    div.appendChild(buttonBold)
    const buttonItalic = documentAddButton(
        "buttonItalic"+id,
        function() { textareaAddItalic(id) },
        "Italic"
    )
    div.appendChild(buttonItalic)
    const buttonHyperlink = documentAddButton(
        "buttonHyperlink"+id,
        function() { textareaAddHyperlink(id) },
        "Hyperlink"
    )
    div.appendChild(buttonHyperlink)
    const buttonAnchor = documentAddButton(
        "buttonAnchor"+id,
        function() { textareaAddAnchor(id) },
        "Anchor"
    )
    div.appendChild(buttonAnchor)
    const buttonCounter = documentAddButton(
        "buttonCounter"+id,
        function() { textareaAddCounter(id) },
        "Counter"
    )
    div.appendChild(buttonCounter)
    const buttonNewline = documentAddButton(
        "buttonNewline"+id,
        function() { textareaAddNewline(id) },
        "Newline"
    )
    div.appendChild(buttonNewline)

    // Newline after buttons
    const br = document.createElement("br")
    div.appendChild(br)

    // The actual textarea
    const textarea = documentAddTextarea("textarea"+id, widget.data.text, 75, 10)
    div.appendChild(textarea)

    // Events
    textarea.onkeyup = function() { textareaUpdateWidgetText(id) }

    document.body.appendChild(div)

    textareaSetBordercolor(id, widget.data.bordercolor)
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
function renderCanvasDiv(widget: any) {
    let id = widget.id
    let div = documentAddDiv("divCanvas"+id)

    // Canvas movement form
    let moveForm = documentAddForm("canvasMovement"+id, "dialog")
    const clearButton = documentAddButton(
        "buttonClear"+id,
        function() { canvasClear(id) },
        "Clear"
    )
    moveForm.appendChild(clearButton)
    const leftButton = documentAddButton(
        "buttonMoveLeft"+id,
        function() { canvasMove(id, -3, 0) },
        "Move left"
    )
    moveForm.appendChild(leftButton)
    const rightButton = documentAddButton(
        "buttonMoveRight"+id,
        function() { canvasMove(id, 3, 0) },
        "Move left"
    )
    moveForm.appendChild(rightButton)
    const downButton = documentAddButton(
        "buttonMoveDown"+id,
        function() { canvasMove(id, 0, 3) },
        "Move left"
    )
    moveForm.appendChild(downButton)
    div.appendChild(moveForm)

    // Canvas size form
    let sizeForm = documentAddForm("canvasSize"+id, "dialog")
    const widthLabel = documentAddLabel("canvasWidth"+id, "Width: ")
    const widthInput = documentAddTextlineInput("canvasWidth"+id, "canvasWidth", "500", "2")
    sizeForm.appendChild(widthLabel)
    sizeForm.appendChild(widthInput)
    const heightLabel = documentAddLabel("canvasHeight"+id, "Height: ")
    const heightInput = documentAddTextlineInput("canvasHeight"+id, "canvasHeight", "500", "2")
    sizeForm.appendChild(heightLabel)
    sizeForm.appendChild(heightInput)
    const resizeButton = documentAddButton(
        "buttonResize"+id,
        function () { canvasResize(id) },
        "Resize"
    )
    sizeForm.appendChild(resizeButton)
    div.appendChild(sizeForm)

    // Canvas color form
    let colorForm = documentAddForm("canvasColor"+id, "dialog")
    const radioBlack = documentAddRadioInput("radioBlack"+id, "color", "black", true, function() {})
    const labelBlack = documentAddLabel("radioBlack"+id, "Black")
    colorForm.appendChild(radioBlack)
    colorForm.appendChild(labelBlack)
    const radioWhite = documentAddRadioInput("radioWhite"+id, "color", "white", false, function() {})
    const labelWhite = documentAddLabel("radioWhite"+id, "White")
    colorForm.appendChild(radioWhite)
    colorForm.appendChild(labelWhite)
    const radioRed = documentAddRadioInput("radioRed"+id, "color", "red", false, function() {})
    const labelRed = documentAddLabel("radioRed"+id, "Red")
    colorForm.appendChild(radioRed)
    colorForm.appendChild(labelRed)
    const radioBlue = documentAddRadioInput("radioBlue"+id, "color", "blue", false, function() {})
    const labelBlue = documentAddLabel("radioBlue"+id, "Blue")
    colorForm.appendChild(radioBlue)
    colorForm.appendChild(labelBlue)
    const radioGreen = documentAddRadioInput("radioGreen"+id, "color", "green", false, function() {})
    const labelGreen = documentAddLabel("radioGreen"+id, "Green")
    colorForm.appendChild(radioGreen)
    colorForm.appendChild(labelGreen)
    const radioYellow = documentAddRadioInput("radioYellow"+id, "color", "yellow", false, function() {})
    const labelYellow = documentAddLabel("radioYellow"+id, "Yellow")
    colorForm.appendChild(radioYellow)
    colorForm.appendChild(labelYellow)
    div.appendChild(colorForm)

    // Pencil width form
    let widthForm = documentAddForm("canvasWidth"+id, "dialog")
    const radioThin = documentAddRadioInput("radioThin"+id, "width", "thin", true, function() {})
    const labelThin = documentAddLabel("radioThin"+id, "Thin")
    widthForm.appendChild(radioThin)
    widthForm.appendChild(labelThin)
    const radioMedium = documentAddRadioInput("radioMedium"+id, "width", "medium", false, function() {})
    const labelMedium = documentAddLabel("radioMedium"+id, "Medium")
    widthForm.appendChild(radioMedium)
    widthForm.appendChild(labelMedium)
    const radioThick = documentAddRadioInput("radioThick"+id, "width", "thick", false, function() {})
    const labelThick = documentAddLabel("radioThick"+id, "Thick")
    widthForm.appendChild(radioThick)
    widthForm.appendChild(labelThick)
    const checkboxPressure = documentAddCheckboxInput("boxPressure"+id, "pressure", widget.isLocked, function() {})
    const labelPressure = documentAddLabel("boxPressure"+id, "Pressure?")
    widthForm.appendChild(checkboxPressure)
    widthForm.appendChild(labelPressure)
    const checkboxLocked = documentAddCheckboxInput("boxLocked"+id, "locked", widget.isWithPressure, function() { canvasLock(id) })
    const labelLocked = documentAddLabel("boxLocked"+id, "Locked?")
    widthForm.appendChild(checkboxLocked)
    widthForm.appendChild(labelLocked)
    div.appendChild(widthForm)

    // Drawmode form
    let drawmodeForm = documentAddForm("drawmodeRadios"+id, "dialog")
    const radioFree = documentAddRadioInput("radioFree"+id, "drawmode", "free", true, function() {})
    const labelFree = documentAddLabel("radioFree"+id, "Free")
    drawmodeForm.appendChild(radioFree)
    drawmodeForm.appendChild(labelFree)
    const radioHorizontal = documentAddRadioInput("radioHorizontal"+id, "drawmode", "horizontal", false, function() {})
    const labelHorizontal = documentAddLabel("radioHorizontal"+id, "Horizontal")
    drawmodeForm.appendChild(radioHorizontal)
    drawmodeForm.appendChild(labelHorizontal)
    const radioVertical = documentAddRadioInput("radioVertical"+id, "drawmode", "vertical", false, function() {})
    const labelVertical = documentAddLabel("radioVertical"+id, "Vertical")
    drawmodeForm.appendChild(radioVertical)
    drawmodeForm.appendChild(labelVertical)
    const radioRising = documentAddRadioInput("radioRising"+id, "drawmode", "rising", false, function() {})
    const labelRising = documentAddLabel("radioRising"+id, "Rising")
    drawmodeForm.appendChild(radioRising)
    drawmodeForm.appendChild(labelRising)
    const radioFalling = documentAddRadioInput("radioFalling"+id, "drawmode", "falling", false, function() {})
    const labelFalling = documentAddLabel("radioFalling"+id, "Falling")
    drawmodeForm.appendChild(radioFalling)
    drawmodeForm.appendChild(labelFalling)
    div.appendChild(drawmodeForm)

    // The actual canvas
    let canvas = document.createElement("canvas")
    canvas.id = "canvas" + id
    canvas.width = 500
    canvas.height = 500
    canvas.style.border = "1px solid black"
    canvas.textContent = "Unfortunately, your browser does not support canvas elements."

    // Touch & Mouse event associations
    for (const events of ["touchstart", "mousedown"]) {
        canvas.addEventListener(events, function (event: any) {
            const index = getWidgetIndexById(id)

            if (!gWidgets[index].data.isLocked) {
                gIsMouseDown = true
                gPoints = []
                canvasAddPoint(event, id, false, true)
            }
        })
    }

    for (const events of ["touchmove", "mousemove"]) {
        canvas.addEventListener(events, function (event: any) {
            const index = getWidgetIndexById(id)

            if (!gWidgets[index].data.isLocked) {
                if (!gIsMouseDown) {
                    return
                }
                event.preventDefault()
                canvasAddPoint(event, id, true, false)
            }
        })
    }

    for (const events of ["touchend", "touchleave", "mouseup"]) {
        canvas.addEventListener(events, function (event: any) {
            const index = getWidgetIndexById(id)

            if (!gWidgets[index].data.isLocked) {
                gIsMouseDown = false
            }
        })
    }

    div.appendChild(canvas)

    document.body.appendChild(div)

    canvasDrawPointsOnIt(id, widget.data.pointsHistory)
}


renderCanvasDiv(gWidgets[0])
renderCanvasDiv(gWidgets[1])
renderTextDiv(gWidgets[2])

function renderWidgets(widgets: any[]) {
    while (document.firstChild) {
        document.removeChild(document.firstChild)
    }

    // renderMenuDiv()

    let position = 0
    for (let widget of widgets) {
        if (widget.type == "canvas") {
            renderCanvasDiv(widget)
        } else if (widget.type == "text") {
            // renderTextDiv(widget)
        }
        // renderButtonsDiv(position)
        position++
    }
}
