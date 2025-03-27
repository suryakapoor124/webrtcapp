document.addEventListener("DOMContentLoaded", () => {
  const startCallButton = document.getElementById("startCall");
  const endCallButton = document.getElementById("endCall");
  const localAudio = document.getElementById("localAudio");
  const remoteAudio = document.getElementById("remoteAudio");

  if (!localAudio || !remoteAudio) {
    console.error("❌ Error: Audio elements not found.");
    return;
  }

  const socket = io("http://192.168.221.125:8080"); // Ensure this matches your server port
  let peerConnection;
  let localStream;

  // STUN servers for better connectivity
  const configuration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  startCallButton.addEventListener("click", async () => {
    try {
      console.log("📞 Starting call...");
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localAudio.srcObject = localStream;
      console.log("🎤 Got Media Stream:", localStream);

      peerConnection = new RTCPeerConnection(configuration);
      console.log("🛠️ Created Peer Connection:", peerConnection);

      // Add local audio track to Peer Connection
      localStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localStream));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate);
        }
      };

      peerConnection.ontrack = (event) => {
        console.log("🎧 Receiving remote audio...");
        remoteAudio.srcObject = event.streams[0];
      };

      // Create and send offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit("offer", offer);
      console.log("📨 Created & Set Local Description (Offer):", offer);
    } catch (error) {
      console.error("❌ Error starting call:", error);
    }
  });

  socket.on("offer", async (offer) => {
    try {
      console.log("📩 Received Offer:", offer);

      peerConnection = new RTCPeerConnection(configuration);
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localAudio.srcObject = localStream;

      localStream
        .getTracks()
        .forEach((track) => peerConnection.addTrack(track, localStream));

      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", event.candidate);
        }
      };

      peerConnection.ontrack = (event) => {
        remoteAudio.srcObject = event.streams[0];
      };

      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer),
      );

      // Create and send answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      socket.emit("answer", answer);
      console.log("📨 Created & Sent Answer:", answer);
    } catch (error) {
      console.error("❌ Error handling offer:", error);
    }
  });

  socket.on("answer", async (answer) => {
    try {
      console.log("📩 Received Answer:", answer);
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(answer),
      );
    } catch (error) {
      console.error("❌ Error setting remote description:", error);
    }
  });

  socket.on("ice-candidate", async (candidate) => {
    try {
      if (peerConnection) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("📩 Added ICE Candidate:", candidate);
      }
    } catch (error) {
      console.error("❌ Error adding ICE candidate:", error);
    }
  });

  // Handle call ending
  endCallButton.addEventListener("click", () => {
    if (peerConnection) {
      console.log("🚫 Ending call...");
      peerConnection.close();
      peerConnection = null;
      remoteAudio.srcObject = null;
      localAudio.srcObject = null;
      socket.emit("endCall");
    } else {
      console.warn("⚠️ No active call to end.");
    }
  });

  // Listen for call end from other user
  socket.on("callEnded", () => {
    console.log("📴 Call ended by other user.");
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    remoteAudio.srcObject = null;
    localAudio.srcObject = null;
  });
});
