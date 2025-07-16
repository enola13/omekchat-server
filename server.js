const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// ✅ CORS agar bisa menerima request dari web Firebase kamu
const io = new Server(server, {
  cors: {
    origin: "https://omekchatweb.web.app",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());

// Test route (opsional)
app.get("/", (req, res) => {
  res.send("OmekChat Server Aktif");
});

// Socket logic
io.on("connection", (socket) => {
  console.log("🔌 Pengguna terhubung:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Pengguna keluar:", socket.id);
  });

  // Tambahkan event lainnya di sini
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
