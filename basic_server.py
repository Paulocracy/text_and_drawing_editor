# IMPORT SECTION #
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from json import dump, load
from markdown import markdown
from tkinter import Tk
from tkinter.filedialog import askopenfilename, asksaveasfilename
from typing import Any, Dict, List, Tuple


# GENERAL FUNCTION SECTION #
def _choose_file_for_save(title: str, filetypes: List[Tuple[str, str]]) -> str:
    root = Tk()
    filename = asksaveasfilename(
        parent=root,
        title=title,
        filetypes=filetypes
    )
    root.destroy()
    return filename


def _export(json: List[Any]):
    html: List[str] = []
    html.append("<!DOCTYPE html>")
    html.append('<html lang="en">')
    html.append('<head>')
    html.append('    <meta charset="utf-8">')
    html.append('    <title>Export</title>')
    html.append('</head>')
    html.append('<body>')
    current_level = 1
    current_levels: List[int] = [0 for _ in range(7)]
    counters: Dict[str, int] = {}
    for widget in json:
        id = widget["id"]
        type = widget["type"]
        data = widget["data"]

        if type == "canvas":
            # base64
            html.append('<img src="'+data["base64"]+'" alt="Drawn canvas image"/>')
        elif type == "caption":
            # text
            # id
            # level
            current_level = int(data["level"])
            current_levels[current_level-1] += 1
            level_text = ".".join([str(x) for x in current_levels[0:current_level]])
            h_text = f"h{current_level}"
            caption = f'<{h_text} id="{data["id"]}">{level_text} {data["text"]}</{h_text}>'
            html.append(caption)
        elif type == "counter":
            # family
            # reference
            # br
            if data["family"] not in counters.keys():
                counters[data["family"]] = 1
            else:
                counters[data["family"]] += 1
            if data["br"]:
                html.append("<br>")
            if data["reference"] != "":
                counter = f'<div id="{data["reference"]}">'
            else:
                counter = "<div>"
            counter += f'{data["family"]} {counters[data["family"]]}</div>'
            html.append(counter)
        elif type == "text":
            # text
            # bordercolor
            # font
            p_element = "<p"
            p_style = ' style="font-family: '
            if data["font"] == "standard":
                p_style += 'serif;'
            elif data["font"] == "monospaced":
                p_style += 'monospace;'
            if data["bordercolor"] != "none":
                p_style += f' border: 1px solid {data["bordercolor"]};'
            p_style += '"'
            p_element += p_style + ">"
            print(p_element)
            html.append(p_element)

            text = data["text"]
            # Counter to HTML
            text.replace("{COUNTER{", '<a href="#')
            text.replace("}COUNTER}", '>↕</a>')
            # Caption to HTML
            text.replace("{CAPTION{", '<a href="#')
            text.replace("}CAPTION}", '>↕</a>')
            # Markdown to HTML using markdown package
            try:
                # Remove initial and terminal <p> tag which
                # is added by the markdown function
                text = markdown(text)[3:-4]
            except Exception:
                text = markdown(text)
            html.append(text)
            html.append("</p>")
    html.append('</body>')
    html.append("</html>")
    html_str = "\n".join(html)
    print(html_str)
    filename = _choose_file_for_save("Save as HTML", [("HTML", "*.html"), ("all files","*.*")])
    if filename != "":
        with open(filename, "w") as f:
            f.write(html_str)

# SERVER SETTINGS SECTION #
async_mode = None
app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)


# SOCKET.IO-RELATED FUNCTIONS SECTION #
@app.route('/')
def index():
    return render_template('index.html',
                           sync_mode=socketio.async_mode)


@socketio.on("broadcastToServer")
def handle_broadcast_to_server(json):
    print("SOCKET.IO: Received 'broadcastToServer' event")
    emit('broadcastToClient', json, broadcast=True)


@socketio.on("export")
def handle_export(json):
    print("SOCKET.IO: Received 'export' event")
    _export(json)


@socketio.on("load")
def handle_load(empty):
    print("SOCKET.IO: Received 'load' event")
    root = Tk()
    filename = askopenfilename(
        parent=root,
        title="Select JSON",
        filetypes=[("JSON", "*.json"), ("all files","*.*")]
    )
    root.destroy()
    if len(filename) > 0:
        with open(filename, "r") as f:
            json = load(f)
        print("SOCKET.IO: Emitting 'broadcastToClient' event")
        emit('broadcastToClient', json, broadcast=True)


@socketio.on("save")
def handle_save(json):
    print("SOCKET.IO: Received 'save' event")
    filename = _choose_file_for_save("Save JSON", [("JSON", "*.json"), ("all files","*.*")])
    print(f"Saving to {filename}...")
    if len(filename) > 0:
        with open(filename, "w") as f:
            dump(json, f, indent=6)


# MAIN ROUTINE SECTION #
if __name__ == '__main__':
    selection = input("Do you want to propagate the server in your whole network\n"
          "so that it can be accessed by other network devices\n"
          "(WARNING: If you cannot fully trust the network, this\n"
          " may pose an additional security risk!)? [type in Y for yes,\n"
          "and any other symbol for no, followed by pressing ENTER] ")

    # We use the address 0.0.0.0 in order to propagate
    # the server in our local network. If you only want
    # to use the server on your hosting device only, use
    # the address 127.0.0.1.
    # Flask's default port number is 5000.
    if selection == "Y":
        host = "0.0.0.0"
    else:
        host = "127.0.0.1"

    socketio.run(app, host=host, port=5000)
