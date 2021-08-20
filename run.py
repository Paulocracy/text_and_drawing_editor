"""
run.py

This file combines all necessary steps in order
to start the Python server with its associated
TypeScript static file.
"""
# We use os in oder to perform console commands
import os

# Transpile the TypeScript file to JavaScript
os.system("tsc ./static/script.ts")

# Change the first lines of the transpiled JavaScript
# so that the static sockets.io file is loaded
# correctly, i.e., without module import routines
# which don't work.
with open("./static/script.js", "r") as f:
    filestr = f.readlines()
counter: int = 0
for line in filestr:
    if line.startswith("var socket = socket_io_1.io();"):
        break
    counter += 1
filestr = filestr[counter:]
filestr[0] = "var socket = io()\n"
with open("./static/script.js", "w") as f:
    f.writelines(filestr)

# Now, with the corrected JavaScript file,
# start the server.
os.system("python ./basic_server.py")
