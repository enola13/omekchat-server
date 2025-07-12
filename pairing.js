// server/pairing.js

const waitingUsers = [];

function findPair(onlineUsers, requesterId) {
  for (let [id, user] of onlineUsers.entries()) {
    if (id !== requesterId) {
      // Hapus kedua user dari antrean online
      onlineUsers.delete(id);
      onlineUsers.delete(requesterId);
      return user.socket;
    }
  }
  return null;
}

function removeFromQueue(onlineUsers, id) {
  onlineUsers.delete(id);
}

function setupPairing(io) {
  io.on("connection", (socket) => {
    console.log("🔌 User connected:", socket.id);

    if (waitingUsers.length > 0) {
      const partner = waitingUsers.pop();

      socket.emit("paired", { partnerId: partner.id });
      partner.emit("paired", { partnerId: socket.id });

      console.log(`🤝 Paired: ${socket.id} ↔ ${partner.id}`);
    } else {
      waitingUsers.push(socket);
      console.log(`🕐 Waiting: ${socket.id}`);
    }

    socket.on("disconnect", () => {
      const index = waitingUsers.indexOf(socket);
      if (index !== -1) waitingUsers.splice(index, 1);
    });
  });
}

module.exports = {
  setupPairing,
  findPair,
  removeFromQueue,
};
