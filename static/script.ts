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


////g_canvas TEST BEGIN
class Point {
    x: number
    y: number
    lineWidth: number
    color: string
    visibleLineToIt: boolean

    constructor(x: number, y: number, lineWidth: number, color: string, visibleLineToIt: boolean) {
        this.x = x
        this.y = y
        this.lineWidth = lineWidth
        this.color = color
        this.visibleLineToIt = visibleLineToIt
    }
}

const g_canvas = document.querySelectorAll('canvas')[0]
const g_context = g_canvas.getContext('2d')
let g_isMousedown = false
let g_points: Point[] = []
let g_pointsHistory = []
let g_startPoint: Point
let g_isLocked = false

g_canvas.width = 500
g_canvas.height = 500

function clear_canvas() {
    // g_context.beginPath()
    g_context.clearRect(0, 0, g_canvas.width, g_canvas.height)
    // g_context.closePath()
    // g_context.stroke()
    g_points = []
    g_pointsHistory = []
}

function moveAll(xMove: number, yMove: number) {
    for (let i=0; i<g_pointsHistory.length; i++) {
        g_pointsHistory[i].x += xMove
        g_pointsHistory[i].y += yMove
    }
    g_context.clearRect(0, 0, g_canvas.width, g_canvas.height)
    drawPointsOnCanvas(g_pointsHistory)
}

function resizeCanvas() {
    const newWidth = parseInt(document.forms.namedItem("canvasSize").canvasWidth.value)
    const newHeight = parseInt(document.forms.namedItem("canvasSize").canvasHeight.value)

    if (newWidth != NaN) {
        g_canvas.width = newWidth
    }
    if (newHeight != NaN) {
        g_canvas.height = newHeight
    }

    drawPointsOnCanvas(g_pointsHistory)
}

function drawPointsOnCanvas(points: Point[]) {
  g_context.lineCap = "round"
  g_context.lineJoin = "round"

  for (let right_index=1; right_index<points.length; right_index++) {
    g_context.strokeStyle = points[right_index].color
    g_context.lineWidth = points[right_index].lineWidth
    g_context.beginPath()
    g_context.moveTo(points[right_index-1].x, points[right_index-1].y)
    if(points[right_index].visibleLineToIt) {
        g_context.lineTo(points[right_index].x, points[right_index].y)
    }
    g_context.closePath()
    g_context.stroke()
  }
  g_points.reverse()
  while(g_points.length > 1) {
    g_points.pop()
  }
}

function addPoint(event: any, visibleLineToIt: boolean, setStartPoint) {
    let pressure: number
    let x: number
    let y: number

    let selectedDrawmode: string
    if (!setStartPoint) {
        selectedDrawmode = document.forms.namedItem("drawmodeRadios").drawmode.value
    } else {
        selectedDrawmode = "free"
    }

    let pageXYhandler: any
    if (event.touches && event.touches[0] && typeof event.touches[0]["force"] !== "undefined") {
      if (event.touches[0]["force"] > 0) {
          let checkbox: any = document.getElementById("pressure")
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
        x = pageXYhandler.pageX - g_canvas.offsetLeft
        y = pageXYhandler.pageY - g_canvas.offsetTop
    } else if (selectedDrawmode == "horizontal") {
        x = pageXYhandler.pageX - g_canvas.offsetLeft
        y = g_startPoint.y
    } else if (selectedDrawmode == "vertical") {
        x = g_startPoint.x
        y = pageXYhandler.pageY - g_canvas.offsetTop
    } else if (selectedDrawmode == "rising") {
        x = pageXYhandler.pageX - g_canvas.offsetLeft
        y = g_startPoint.y - (x - g_startPoint.x)
    } else if (selectedDrawmode == "falling") {
        x = pageXYhandler.pageX - g_canvas.offsetLeft
        y = g_startPoint.y + (x - g_startPoint.x)
    }

    const selectedColor = document.forms.namedItem("colorRadios").color.value
    const selectedLineWidth = document.forms.namedItem("widthRadios").width.value
    let resultingLineWidth: number = Math.log(pressure+1)
    if (selectedLineWidth == "thin") {
        resultingLineWidth *= 5.0
    } else if (selectedLineWidth == "medium") {
        resultingLineWidth *= 10.0
    } else if (selectedLineWidth == "thick") {
        resultingLineWidth *= 100.0
    }

    const newPoint = new Point(x, y, resultingLineWidth, selectedColor, visibleLineToIt)
    g_points.push(newPoint)
    g_pointsHistory.push(newPoint)

    if (setStartPoint) {
        g_startPoint = newPoint
    }

    drawPointsOnCanvas(g_points)
}

for (const events of ["touchstart", "mousedown"]) {
  g_canvas.addEventListener(events, function (event: any) {
    if (!g_isLocked) {
        g_isMousedown = true
        g_points = []
        addPoint(event, false, true)
    }
  })
}

for (const events of ["touchmove", "mousemove"]) {
  g_canvas.addEventListener(events, function (event: any) {
    if (!g_isLocked) {
        if (!g_isMousedown) {
            return
        }
        event.preventDefault()
        addPoint(event, true, false)
    }
  })
}

for (const events of ["touchend", "touchleave", "mouseup"]) {
  g_canvas.addEventListener(events, function (event: any) {
    if (!g_isLocked) {
        g_isMousedown = false
        // addPoints does not work correctly here as a very
        // high pressure is detected with these events.
    }
  })
}

function lock_canvas() {
    g_isLocked = !g_isLocked
}

function documentAddButton(id: string, onclick: any, text: string) {
    let button = document.createElement("button")
    button.id = id
    button.onclick = onclick
    button.textContent = text
    return button
}

function documentAddForm(id: string, method: HTMLFormElement['method']) {
    let form = document.createElement("form")
    form.name = id
    form.method = method
    return form
}

function documentAddDiv(id: string) {
    let div = document.createElement("div")
    div.id = id
    return div
}


function documentAddLabel(htmlFor: string, text: string) {
    let label = document.createElement("label")
    label.htmlFor = htmlFor
    label.innerText = text
    return label
}

function documentAddTextlineInput(id: string, value: string, size: string) {
    let input = document.createElement("input")
    input.type = "text"
    input.value = value
    input.size = 2
    input.id = id
    input.name = id
    input.required = true
    return input
}

function documentAddRadioInput(id: string, name: string, value: string, checked: boolean) {
    let input = document.createElement("input")
    input.type = "radio"
    input.id = id
    input.name = name
    input.checked = checked
    return input
}

function documentAddCheckboxInput(id: string, name: string, onclick: any) {
    let input = document.createElement("input")
    input.type = "checkbox"
    input.id = id
    input.name = name
    input.onclick = onclick
    return input
}

////////
var g_widgets = [
    {
        id: "ABCDE",
        data: {
            pointsHistory: [],
            isLocked: false,
            isWithPressure: false,
        },
    },
];

function canvasClear(id: string) {}
function canvasMove(id: string, x: number, y: number) {}
function canvasResize(id: string) {}
function canvasLock(id: string) {}

function renderCanvasDiv(widget: any) {
    let id = widget.id
    let data = widget.classdata

    let div = documentAddDiv("canvas"+id)

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
    const widthInput = documentAddTextlineInput("canvasWidth"+id, "500", "2")
    sizeForm.appendChild(widthLabel)
    sizeForm.appendChild(widthInput)
    const heightLabel = documentAddLabel("canvasHeight"+id, "Height: ")
    const heightInput = documentAddTextlineInput("canvasHeight"+id, "500", "2")
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
    const labelThin = documentAddLabel("labelThin"+id, "Thin")
    widthForm.appendChild(radioThin)
    widthForm.appendChild(labelThin)
    const radioMedium = documentAddRadioInput("radioMedium"+id, "width", "medium", false)
    const labelMedium = documentAddLabel("labelThin"+id, "Medium")
    widthForm.appendChild(radioMedium)
    widthForm.appendChild(labelMedium)
    const radioThick = documentAddRadioInput("radioThick"+id, "width", "thick", false)
    const labelThick = documentAddLabel("labelThin"+id, "Thick")
    widthForm.appendChild(radioThick)
    widthForm.appendChild(labelThick)
    const checkboxPressure = documentAddCheckboxInput("boxPressure"+id, "pressure", function() {})
    const labelPressure = documentAddLabel("boxPressure"+id, "Pressure?")
    widthForm.appendChild(checkboxPressure)
    widthForm.appendChild(labelPressure)
    const checkboxLocked = documentAddCheckboxInput("boxLocked"+id, "locked", function() { canvasLock(id) })
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
    canvas.id = id
    canvas.width = 500
    canvas.height = 500
    canvas.style.border = "1px solid black"
    canvas.textContent = "Unfortunately, your browser does not support canvas elements."
    div.appendChild(canvas)

    document.body.appendChild(div)
}


renderCanvasDiv(g_widgets[0])

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

[
    {
        id: "asdsad",
        type: "canvas",
        classdata: {}
    }
]
////g_canvas TEST END
