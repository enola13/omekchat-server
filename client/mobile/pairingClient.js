// pairingClient.js ── OmekChat FINAL

/* =============================================================
   ELEMEN UI
============================================================= */
const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn");
const statusText = document.getElementById("statusText");
const userCount = document.getElementById("userCount");
const chatInput = document.getElementById("chatInput");
const acceptBtn = document.getElementById("acceptTermsBtn");
const termsOverlay = document.getElementById("termsOverlay");
const switchBtn = document.getElementById("switchCameraBtn");
const localVideo = document.getElementById("localVideo");
const partnerVideo = document.getElementById("partnerVideo");
const chatArea = document.getElementById("chatArea");
const brandingBox = document.getElementById("brandingContent");
const bubbleContainer = document.getElementById("bubbleContainer");

/* =============================================================
   STATE
============================================================= */
let isConnected = false;
let isSearching = false;
let facingMode = "user";
let localStream = null;
let socket = null;
let peer = null;
let roomID = null;
let dataChannel = null;

/* =============================================================
   1️⃣  TERMS
============================================================= */
acceptBtn.onclick = async () => {
  localStorage.setItem("termsAccepted", "true");
  termsOverlay.style.display = "none";
  await startCamera(facingMode);
  startBtn.disabled = false;
};

document.addEventListener("DOMContentLoaded", async () => {
  if (localStorage.getItem("termsAccepted") === "true") {
    termsOverlay.style.display = "none";
    await startCamera(facingMode);
    startBtn.disabled = false;
  } else {
    termsOverlay.style.display = "flex";
    startBtn.disabled = true;
  }
});

/* =============================================================
   2️⃣  KAMERA & MIKROFON
============================================================= */
async function startCamera(mode) {
  try {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }

    localStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: mode },
      audio: true,
    });

    localVideo.srcObject = localStream;
    localVideo.muted = true;

    if (peer) {
      const sender = peer.getSenders().find((s) => s.track?.kind === "video");
      const newVideoTrack = localStream.getVideoTracks()[0];
      if (sender && newVideoTrack) {
        sender.replaceTrack(newVideoTrack);
      }
    }
  } catch (e) {
    console.error("Gagal akses kamera:", e);
    updateUIStatus("💥 Izin kamera/mikrofon ditolak");
  }
}

switchBtn.onclick = async () => {
  facingMode = facingMode === "user" ? "environment" : "user";
  await startCamera(facingMode);
};

/* =============================================================
   3️⃣  UI
============================================================= */
function updateUIStatus(text, loading = false) {
  statusText.textContent = text;
  statusText.style.display = text ? "block" : "none";
  userCount.style.display = loading ? "none" : "block";
  chatInput.disabled = loading;
}

function showPartnerMode() {
  partnerVideo.style.display = "block";
  brandingBox.style.display = "none";
}

function hidePartnerMode() {
  partnerVideo.style.display = "none";
  brandingBox.style.display = "flex";
}

function setUISearching() {
  isConnected = false;
  isSearching = true;
  updateUIStatus("🔎 Mencari lawan bicara...", true);
  startBtn.textContent = "Next";
  startBtn.disabled = true;
  stopBtn.disabled = false;
  chatInput.disabled = true;
  showPartnerMode();
}

function setUIConnected() {
  isConnected = true;
  isSearching = false;
  updateUIStatus("");
  startBtn.textContent = "Next";
  startBtn.disabled = false;
  stopBtn.disabled = false;
  chatInput.disabled = false;
  showPartnerMode();
}

function setUIDisconnected() {
  isConnected = false;
  isSearching = false;
  updateUIStatus("");
  startBtn.textContent = "Start";
  startBtn.disabled = false;
  stopBtn.disabled = true;
  chatInput.disabled = true;
  hidePartnerMode();

  if (dataChannel) {
    dataChannel.close();
    dataChannel = null;
  }

  if (peer) {
    peer.close();
    peer = null;
  }

  if (socket) {
    socket.emit("leave-room", roomID);
    socket.disconnect();
    socket = null;
  }

  partnerVideo.srcObject = null;
}

/* =============================================================
   5️⃣  PEER CONNECTION
============================================================= */
function createPeerConnection(isInitiator) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  localStream.getTracks().forEach((t) => pc.addTrack(t, localStream));
  pc.ontrack = (e) => (partnerVideo.srcObject = e.streams[0]);

  pc.onicecandidate = ({ candidate }) => {
    if (candidate) socket.emit("ice-candidate", { candidate, roomID });
  };

  if (isInitiator) initChatChannel(pc.createDataChannel("chat"));
  else pc.ondatachannel = (e) => initChatChannel(e.channel);

  pc.onconnectionstatechange = () => {
    if (["closed", "failed", "disconnected"].includes(pc.connectionState))
      setUIDisconnected();
  };

  return pc;
}

/* =============================================================
   6️⃣  SOCKET.IO
============================================================= */
function initSocket() {
  socket = io();
  console.log("📡 Socket connected");

  function sendSkip() {
    if (roomID) socket.emit("skip", { roomID });
  }

  socket.sendSkip = sendSkip;

  socket.on("skip", () => setUIDisconnected());
  socket.on("user-count", (count) => {
    userCount.textContent = `${count} online`;
  });

  socket.on("partner-found", async ({ roomID: id, initiator }) => {
    roomID = id;
    peer = createPeerConnection(initiator);
    setUIConnected();

    if (initiator) {
      await peer.setLocalDescription(await peer.createOffer());
      socket.emit("offer", { offer: peer.localDescription, roomID });
    }
  });

  socket.on("offer", async ({ offer, roomID: id }) => {
    roomID = id;
    peer = createPeerConnection(false);
    await peer.setRemoteDescription(offer);
    await peer.setLocalDescription(await peer.createAnswer());
    socket.emit("answer", { answer: peer.localDescription, roomID });
  });

  socket.on("answer", ({ answer }) => peer.setRemoteDescription(answer));
  socket.on("ice-candidate", ({ candidate }) =>
    peer.addIceCandidate(candidate).catch(console.error)
  );
  socket.on("partner-left", () => {
    setUIDisconnected();
    clearChatBubbles();
  });
}

/* =============================================================
   7️⃣  TOMBOL START / NEXT / STOP
============================================================= */
startBtn.onclick = () => {
  if (startBtn.disabled) return;
  clearChatBubbles();

  if (!isConnected) {
    setUISearching();
    if (!socket) initSocket();
    else if (!socket.connected) socket.connect();
    socket.emit("find-partner");
  } else {
    socket?.sendSkip();
    setUIDisconnected();
    if (!socket) initSocket();
    socket.emit("find-partner");
  }
};

stopBtn.onclick = () => {
  if (stopBtn.disabled) return;
  socket?.sendSkip();
  setUIDisconnected();
  clearChatBubbles();
};

/* =============================================================
   8️⃣  CHAT OUTPUT: BALON PESAN & RESET SAAT NEXT/STOP
============================================================= */
function initChatChannel(channel) {
  dataChannel = channel;
  dataChannel.onopen = () => (chatInput.disabled = false);
  dataChannel.onclose = () => (chatInput.disabled = true);
  dataChannel.onmessage = (e) => appendMessageBubble("partner", e.data);
}

function appendMessageBubble(side, text) {
  if (!bubbleContainer) return;
  const div = document.createElement("div");
  div.className = "msg " + side;
  div.textContent = text;
  bubbleContainer.appendChild(div);
  bubbleContainer.scrollTop = bubbleContainer.scrollHeight;
}

chatInput.addEventListener("keydown", (e) => {
  if (
    e.key === "Enter" &&
    chatInput.value.trim() &&
    dataChannel?.readyState === "open"
  ) {
    const text = chatInput.value.trim();
    appendMessageBubble("me", text);
    dataChannel.send(text);
    chatInput.value = "";
  }
});

function clearChatBubbles() {
  if (bubbleContainer) bubbleContainer.innerHTML = "";
}
