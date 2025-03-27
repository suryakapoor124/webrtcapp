run server with 
```bash
python server.py
```
and frontedn with (cd frontend first)
```bash
python3 -m http.server --bind 0.0.0.0
```

on server device
```bash
ipconfig getifaddr en0
```
to get the ip of linux/mac

on client device
paste this on browser usl (chrome)
```bash
chrome://flags/#unsafely-treat-insecure-origin-as-secure
```
enable the option and paste this
```bash
http://192.169.x.x:8080
```
Your ip and 8080 your port

and the simply go to this site

Install packages for server
```bash
pip install flask flask-socketio eventlet gevent gevent-websocket python-socketio flask_cors
```
