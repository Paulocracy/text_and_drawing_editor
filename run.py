import os

os.system("tsc ./static/script.ts")
with open("./static/script.js", "r") as f:
    filestr = f.readlines()
filestr = filestr[3:]
filestr[0] = "var socket = io()\n"
with open("./static/script.js", "w") as f:
    f.writelines(filestr)
os.system("python ./basic_server.py")
