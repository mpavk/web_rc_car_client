# Web RC Car - Client

This is the web client for the **Web RC Car** project, providing a browser-based interface to remotely control the RC car and view the real-time video stream.

The interface allows you to send movement commands (forward, backward, left, right) and view the live video feed transmitted from the Raspberry Pi via WebRTC.

---

### 📋 Requirements

* [Node.js](https://nodejs.org/) (for the signaling server)
* [Python 3](https://www.python.org/) (for serving the web client)

---

### 🚀 Quick Start

To get the client up and running, you need to start two separate servers: the web server to serve the client files and the signaling server for WebRTC negotiation.

**1. Start the Signaling Server:**

In your terminal, navigate to the project's root directory and run the following command:

```bash
node signaling_server.js
# Navigate into the public directory
cd public

# Start the server (for Python 3)
python -m http.server
```
