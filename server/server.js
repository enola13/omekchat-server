const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

// 🔐 Izinkan koneksi dari Firebase Hosting
const io = new Server(server, {
  cors: {
    origin: "https://omekchatweb.web.app", // ganti jika domain custom
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());

// 🧪 Route Tes
app.get("/", (req, res) => {
  res.send("✅ OmekChat Server Aktif");
});

// 🔌 Socket Logic
io.on("connection", (socket) => {
  console.log("🔌 Pengguna terhubung:", socket.id);

  socket.on("disconnect", () => {
    console.log("❌ Pengguna keluar:", socket.id);
  });

  // Tambahkan event lainnya (pairing, message, dll)
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🚀 Server berjalan di port ${PORT}`);
});
