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
/*
function renderCanvas(widget: any) {
    let id = widget.id
    let data = widget.classdata


}

function renderWidgets(widgets: any[]) {
    let position = 0
    for (let widget of widgets) {
        if (widget.type == "canvas") {
            renderCanvas(widget)
        } else if (widget.type == "text") {
            renderText(widget)
        }
        renderButtons(position)
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
*/
////g_canvas TEST END
