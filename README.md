# basic_server

*A basic configuration for a Flask Python server with JSON-based Socket.IO communication and TypeScript-derived JavaScript.*

## Installation
```
# 1st: Install node.js, e.g., from https://nodejs.org/
#      (use the LTS version since TypeScript is optimized for it)
#      and add node.js to your system's PATH (you can select it, e.g., in the
#      graphical installer)
# 2nd: Install and test TypeScript *as root/sudo/administrator* via:
npm install -g typescript
tsc
# 3rd: Install Anaconda or Miniconda via, e.g., https://www.anaconda.com/products/individual
# 4th: Install basic_server
git clone https://github.com/Paulocracy/basic_server
cd basic_server
conda env create -n basic_server -f environment.yml
conda activate basic_server
pip install simple-websocket
# 5th: Test basic_server either (on Windows) with...
./run.bat
# ...or (on Linux) with...
./run.sh
```

## Future ideas
* HTTPS integration protocol?
