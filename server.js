const express = require("express");
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// ✅ Serve static files
app.use("/desktop", express.static(path.join(__dirname, "/desktop/client")));
app.use("/mobile", express.static(path.join(__dirname, "/mobile/client")));

// ✅ Root redirect
app.get("/", (req, res) => {
  const ua = req.headers["user-agent"] || "";
  const isMobile = /mobile|android|iphone|ipad/i.test(ua);
  const target = isMobile ? "/mobile" : "/desktop";
  res.redirect(target);
});

// ✅ Socket & pairing logic
require("./socketHandler")(io);
require("./pairing").setupPairing(io);

// ✅ Jalankan server
const PORT = 3000;
server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
