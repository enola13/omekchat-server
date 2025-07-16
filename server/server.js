const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// HARUS SEBELUM `io` dan pakai `cors` juga di `express`
app.use(
  cors({
    origin: "https://omekchatweb.web.app", // Firebase hosting domain kamu
    methods: ["GET", "POST"],
    credentials: true,
  })
);

const io = new Server(server, {
  cors: {
    origin: "https://omekchatweb.web.app", // ini WAJIB cocok
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("🔌 Terhubung:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Terputus:", socket.id);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server aktif di port ${PORT}`);
});
