from flask import Flask, render_template
from flask_socketio import SocketIO, send, emit

async_mode = None
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)

@app.route('/')
def index():
    return render_template('index.html',
                           sync_mode=socketio.async_mode)


@socketio.on('custom_event_1')
def handle_custom_event_1(json):
    print("Custom event 1!")
    print(f"Got JSON: {json}")
    emit("custom_event_2", json)

@socketio.on('custom_event_3')
def handle_custom_event_3(json):
    print("Custom event 3!")
    print(f"Got JSON: {json}")
    emit('custom_event_4', json, broadcast=True)

@socketio.on('custom_event_5')
def handle_custom_event_5(string):
    print("Custom event 5!")
    print(f"Got string: {string}")


if __name__ == '__main__':
    # We use the address 0.0.0.0 in order to propagate
    # the server in our local network. If you only want
    # to use the server on your hosting device only, use
    # the address 127.0.0.1.
    # The default port number is 5000.
    socketio.run(app, host="0.0.0.0", port=5000)
