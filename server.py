from flask import Flask, request
from flask_cors import CORS
from flask_socketio import SocketIO

# ✅ Initialize Flask app
app = Flask(__name__)

# ✅ Allow CORS for all requests
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# ✅ Initialize SocketIO with proper CORS settings
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')

# ✅ A simple test route
@app.route('/')
def home():
    return "WebRTC Server Running"

# ✅ WebSocket Events
@socketio.on('connect')
def handle_connect():
    print("🔗 Client Connected")

@socketio.on('disconnect')
def handle_disconnect():
    print("🔌 Client Disconnected")

# ✅ Apply CORS headers to every response (Extra Fix)
@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

# ✅ Run the server
if __name__ == '__main__':
    socketio.run(app, host="0.0.0.0", port=8080, debug=True, allow_unsafe_werkzeug=True)
