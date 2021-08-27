import tkinter
from json import dump, load, loads
from tkinter.filedialog import askopenfilename, asksaveasfilename
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


@socketio.on("broadcast_to_server")
def handle_broadcast_to_server(json):
    print("SOCKET.IO: Received 'boradcast_to_server' event")
    emit('broadcast_to_client', json, broadcast=True)


@socketio.on("load")
def handle_load(empty):
    print("SOCKET.IO: Received 'load' event")
    root = tkinter.Tk()
    filename = askopenfilename(
        parent=root,
        title="Select JSON",
        filetypes=[("JSON", "*.json"), ("all files","*.*")]
    )
    root.destroy()
    if len(filename) > 0:
        with open(filename, "r") as f:
            json = load(f)
        emit('broadcast_to_client', json, broadcast=True)


@socketio.on("save")
def handle_save(json):
    print("SOCKET.IO: Received 'save' event")
    root = tkinter.Tk()
    filename = asksaveasfilename(
        parent=root,
        title="Select JSON",
        filetypes=[("JSON", "*.json"), ("all files","*.*")]
    )
    root.destroy()
    print(f"Saving to {filename}...")
    if len(filename) > 0:
        with open(filename, "w") as f:
            dump(json, f, indent=6)


if __name__ == '__main__':
    selection = input("Do you want to propagate the server in your whole network\n"
          "so that it can be accessed by other network devices\n"
          "(WARNING: If you cannot fully trust the network, this\n"
          " may pose an additional security risk!)? [Y/n] ")

    # We use the address 0.0.0.0 in order to propagate
    # the server in our local network. If you only want
    # to use the server on your hosting device only, use
    # the address 127.0.0.1.
    # The default port number is 5000.
    if selection == "Y":
        host = "0.0.0.0"
    else:
        host = "127.0.0.1"

    socketio.run(app, host=host, port=5000)
