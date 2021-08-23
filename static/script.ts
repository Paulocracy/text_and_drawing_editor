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
    alert("B")
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
function documentAddButton(id: string, onclick: any, text: string) {
    let button = document.createElement("button")
    button.id = id
    button.onclick = onclick
    button.textContent = text
    return button
}

function documentAddDiv(id: string) {
    let div = document.createElement("div")
    div.id = id
    return div
}

function documentAddForm(id: string, method: HTMLFormElement['method']) {
    let form = document.createElement("form")
    form.name = id
    form.method = method
    return form
}

function documentAddLabel(htmlFor: string, text: string) {
    let label = document.createElement("label")
    label.htmlFor = htmlFor
    label.innerText = text
    return label
}

function documentAddCheckboxInput(id: string, name: string, isChecked: boolean, onclick: any) {
    let input = document.createElement("input")
    input.type = "checkbox"
    input.id = id
    input.name = name
    input.checked = isChecked
    input.onclick = onclick
    return input
}

function documentAddRadioInput(id: string, name: string, value: string, checked: boolean) {
    let input = document.createElement("input")
    input.type = "radio"
    input.id = id
    input.name = name
    input.value = value
    input.checked = checked
    return input
}

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
function canvasAddPoint(event: any, id: string, hasVisibleLineToIt: boolean, setStartPoint: boolean) {
    const canvas: any = document.getElementById("canvas"+id)
    const index = getWidgetIndexById(id)

    let pressure: number
    let x: number
    let y: number

    let selectedDrawmode: string
    if (!setStartPoint) {
        selectedDrawmode = document.forms.namedItem("drawmodeRadios"+id).drawmode.value
    } else {
        selectedDrawmode = "free"
    }

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

function canvasClear(id: string) {
    const canvas: any = document.getElementById("canvas"+id)
    const context = canvas.getContext("2d")
    context.clearRect(0, 0, canvas.width, canvas.height)

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

function canvasResize(id: string) {
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


// RENDER FUNCTIONS SECTION //
function renderCanvasDiv(widget: any) {
    let id = widget.id
    let data = widget.classdata

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
    const radioBlack = documentAddRadioInput("radioBlack"+id, "color", "black", true)
    const labelBlack = documentAddLabel("radioBlack"+id, "Black")
    colorForm.appendChild(radioBlack)
    colorForm.appendChild(labelBlack)
    const radioWhite = documentAddRadioInput("radioWhite"+id, "color", "white", false)
    const labelWhite = documentAddLabel("radioWhite"+id, "White")
    colorForm.appendChild(radioWhite)
    colorForm.appendChild(labelWhite)
    const radioRed = documentAddRadioInput("radioRed"+id, "color", "red", false)
    const labelRed = documentAddLabel("radioRed"+id, "Red")
    colorForm.appendChild(radioRed)
    colorForm.appendChild(labelRed)
    const radioBlue = documentAddRadioInput("radioBlue"+id, "color", "blue", false)
    const labelBlue = documentAddLabel("radioBlue"+id, "Blue")
    colorForm.appendChild(radioBlue)
    colorForm.appendChild(labelBlue)
    const radioGreen = documentAddRadioInput("radioGreen"+id, "color", "green", false)
    const labelGreen = documentAddLabel("radioGreen"+id, "Green")
    colorForm.appendChild(radioGreen)
    colorForm.appendChild(labelGreen)
    const radioYellow = documentAddRadioInput("radioYellow"+id, "color", "yellow", false)
    const labelYellow = documentAddLabel("radioYellow"+id, "Yellow")
    colorForm.appendChild(radioYellow)
    colorForm.appendChild(labelYellow)
    div.appendChild(colorForm)

    // Pencil width form
    let widthForm = documentAddForm("canvasWidth"+id, "dialog")
    const radioThin = documentAddRadioInput("radioThin"+id, "width", "thin", true)
    const labelThin = documentAddLabel("radioThin"+id, "Thin")
    widthForm.appendChild(radioThin)
    widthForm.appendChild(labelThin)
    const radioMedium = documentAddRadioInput("radioMedium"+id, "width", "medium", false)
    const labelMedium = documentAddLabel("radioMedium"+id, "Medium")
    widthForm.appendChild(radioMedium)
    widthForm.appendChild(labelMedium)
    const radioThick = documentAddRadioInput("radioThick"+id, "width", "thick", false)
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
    const radioFree = documentAddRadioInput("radioFree"+id, "drawmode", "free", true)
    const labelFree = documentAddLabel("radioFree"+id, "Free")
    drawmodeForm.appendChild(radioFree)
    drawmodeForm.appendChild(labelFree)
    const radioHorizontal = documentAddRadioInput("radioHorizontal"+id, "drawmode", "horizontal", false)
    const labelHorizontal = documentAddLabel("radioHorizontal"+id, "Horizontal")
    drawmodeForm.appendChild(radioHorizontal)
    drawmodeForm.appendChild(labelHorizontal)
    const radioVertical = documentAddRadioInput("radioVertical"+id, "drawmode", "vertical", false)
    const labelVertical = documentAddLabel("radioVertical"+id, "Vertical")
    drawmodeForm.appendChild(radioVertical)
    drawmodeForm.appendChild(labelVertical)
    const radioRising = documentAddRadioInput("radioRising"+id, "drawmode", "rising", false)
    const labelRising = documentAddLabel("radioRising"+id, "Rising")
    drawmodeForm.appendChild(radioRising)
    drawmodeForm.appendChild(labelRising)
    const radioFalling = documentAddRadioInput("radioFalling"+id, "drawmode", "falling", false)
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
