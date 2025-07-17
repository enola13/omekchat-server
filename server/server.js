const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "https://omekchatweb.web.app",
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: ["https://omekchatweb.web.app", "http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true,
    transports: ["websocket", "polling"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// ==========================
// PAIRING DAN LOGIKA CHAT
// ==========================
let waitingUser = null;
let roomCounter = 0;

function getOnlineCount() {
  return io.engine.clientsCount;
}

function sendUserCount() {
  const count = getOnlineCount();
  io.emit("user-count", count);
}

io.on("connection", (socket) => {
  console.log("🔌 Terhubung:", socket.id);
  sendUserCount();

  socket.on("find-partner", () => {
    if (waitingUser && waitingUser.id !== socket.id) {
      const roomID = "room-" + roomCounter++;
      socket.join(roomID);
      waitingUser.join(roomID);

      socket.data.roomID = roomID;
      waitingUser.data.roomID = roomID;

      // Pasangkan pengguna
      waitingUser.emit("partner-found", { roomID, initiator: true });
      socket.emit("partner-found", { roomID, initiator: false });

      waitingUser = null;
    } else {
      waitingUser = socket;
    }
  });

  socket.on("offer", ({ offer, roomID }) => {
    socket.to(roomID).emit("offer", { offer, roomID });
  });

  socket.on("answer", ({ answer, roomID }) => {
    socket.to(roomID).emit("answer", { answer, roomID });
  });

  socket.on("ice-candidate", ({ candidate, roomID }) => {
    socket.to(roomID).emit("ice-candidate", { candidate, roomID });
  });

  socket.on("skip", ({ roomID }) => {
    socket.to(roomID).emit("skip");
    socket.leave(roomID);
    socket.data.roomID = null;
  });

  socket.on("leave-room", (roomID) => {
    socket.leave(roomID);
    socket.to(roomID).emit("partner-left");
    socket.data.roomID = null;
  });

  socket.on("disconnect", () => {
    if (waitingUser && waitingUser.id === socket.id) {
      waitingUser = null;
    }

    const roomID = socket.data.roomID;
    if (roomID) {
      socket.to(roomID).emit("partner-left");
    }

    console.log("❌ Terputus:", socket.id);
    sendUserCount();
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server aktif di port ${PORT}`);
});
