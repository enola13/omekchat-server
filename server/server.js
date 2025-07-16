const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// Konfigurasi CORS agar socket bisa akses dari Firebase Hosting
const io = new Server(server, {
  cors: {
    origin: "https://omekchatweb.web.app", // ✅ asal frontend kamu
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());

// Cek koneksi server dari browser
app.get("/", (req, res) => {
  res.send("✅ OmekChat Server Aktif");
});

// Socket logic
io.on("connection", (socket) => {
  console.log("🔌 User terhubung:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ User keluar:", socket.id);
  });

  // Tambahkan event lain sesuai kebutuhan
});

// WAJIB! Biarkan Railway tentukan port-nya
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server aktif di port ${PORT}`);
});
