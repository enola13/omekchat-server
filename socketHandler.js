const { findPair, removeFromQueue } = require("./pairing");

// Map: socket.id -> socket
const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🧩 Socket connected:", socket.id);

    // Tambahkan user ke map
    onlineUsers.set(socket.id, { socket });

    // Kirim jumlah user online ke semua client
    io.emit("updateUserCount", onlineUsers.size);

    // Saat user mencari pasangan
    socket.on("find-partner", () => {
      console.log(`🔍 User ${socket.id} mencari pasangan`);

      // Hindari duplikat
      if (!onlineUsers.has(socket.id)) {
        onlineUsers.set(socket.id, { socket });
      }

      // Cari pasangan
      const partnerSocket = findPair(onlineUsers, socket.id);

      if (partnerSocket) {
        const roomID = `room-${socket.id}-${partnerSocket.id}`;

        socket.join(roomID);
        partnerSocket.join(roomID);

        socket.emit("partner-found", { roomID, initiator: true });
        partnerSocket.emit("partner-found", { roomID, initiator: false });

        console.log(`🤝 Paired: ${socket.id} ↔ ${partnerSocket.id}`);
      } else {
        console.log(`🕐 Waiting: ${socket.id}`);
      }
    });

    // Saat user klik Next
    socket.on("next-partner", () => {
      console.log(`⏭️ User ${socket.id} klik next`);

      // Hapus dari antrian pairing
      removeFromQueue(onlineUsers, socket.id);

      // Reset tampilan client
      socket.emit("reset-chat");

      // Minta cari partner baru
      socket.emit("find-partner");
    });

    // Saat user mengirim pesan teks
    socket.on("chatMessage", (msg) => {
      // Kirim pesan ke semua pengguna yang terhubung
      io.emit("chatMessage", msg);
    });

    // Saat user disconnect
    socket.on("disconnect", () => {
      console.log(`❌ Disconnected: ${socket.id}`);

      // Hapus dari antrian pairing
      removeFromQueue(onlineUsers, socket.id);

      // Hapus dari daftar online
      onlineUsers.delete(socket.id);

      // Update jumlah user online ke semua client
      io.emit("updateUserCount", onlineUsers.size);
    });

    // WebRTC Signaling
    socket.on("offer", ({ offer, roomID }) => {
      socket.to(roomID).emit("offer", { offer, roomID });
    });

    socket.on("answer", ({ answer, roomID }) => {
      socket.to(roomID).emit("answer", { answer });
    });

    socket.on("ice-candidate", ({ candidate, roomID }) => {
      socket.to(roomID).emit("ice-candidate", { candidate });
    });
  });
};
