import { Server } from "socket.io";

let io;
const onlineUsers = new Map();
const whiteboardRooms = new Map();

const normalizeRoomId = (id) => (typeof id === "string" ? id.trim().toUpperCase() : id);

const broadcastRoomUsers = (roomId) => {
  const room = whiteboardRooms.get(roomId);
  if (!room) return;
  const payload = Array.from(room.users.entries()).map(([userId, info]) => ({
    userId,
    username: info.username,
  }));
  io.to(roomId).emit("room-users", payload);
};

export default function handler(req, res) {
  if (!res.socket.server.io) {
    io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      console.log("🔌 User connected:", socket.id);

      socket.on("user-online", ({ userId, username }) => {
        console.log("👤 User coming online:", { userId, username, socketId: socket.id });
        onlineUsers.set(String(userId), { socketId: socket.id, username });
        const activeUsers = Array.from(onlineUsers.entries()).map(([userId, { username }]) => ({
          userId,
          username,
        }));
        io.emit("active-users", activeUsers);
      });

      socket.on("join-whiteboard-room", ({ roomId: rawRoomId, userId, username }, callback) => {
        const roomId = normalizeRoomId(rawRoomId);
        console.log("🏠 Join whiteboard room request:", { roomId, userId, username, socketId: socket.id });

        socket.join(roomId);
        if (!whiteboardRooms.has(roomId)) {
          whiteboardRooms.set(roomId, {
            users: new Map(),
            canvasData: [],
            voiceUsers: new Set(),
          });
          console.log(`🆕 Created room ${roomId}`);
        }
        const room = whiteboardRooms.get(roomId);
        room.users.set(String(userId), { username, socketId: socket.id });

        // Broadcast updated user list and notify others
        broadcastRoomUsers(roomId);
        socket.to(roomId).emit("user-joined-room", { userId, username });

        // Send existing canvas history to new joiner
        if (room.canvasData.length > 0) {
          socket.emit("canvas-history", room.canvasData);
        }

        socket.emit("room-joined", { roomId, userId, username });

        if (typeof callback === "function") {
          callback({ success: true, roomId });
        }
      });

      socket.on("leave-whiteboard-room", ({ roomId: rawRoomId, userId }) => {
        const roomId = normalizeRoomId(rawRoomId);
        socket.leave(roomId);
        if (!whiteboardRooms.has(roomId)) return;
        const room = whiteboardRooms.get(roomId);
        room.users.delete(String(userId));
        room.voiceUsers.delete(String(userId));

        socket.to(roomId).emit("user-left-room", userId);
        socket.to(roomId).emit("user-voice-disconnected", { userId });
        broadcastRoomUsers(roomId);

        if (room.users.size === 0) {
          whiteboardRooms.delete(roomId);
          console.log(`🗑️ Deleted empty room ${roomId}`);
        }
      });

      socket.on("drawing-data", (data) => {
        const { roomId: rawRoomId, ...drawingData } = data;
        const roomId = normalizeRoomId(rawRoomId);
        if (!whiteboardRooms.has(roomId)) return;
        const room = whiteboardRooms.get(roomId);
        room.canvasData.push(drawingData);
        if (room.canvasData.length > 10000) {
          room.canvasData = room.canvasData.slice(-10000);
        }
        socket.to(roomId).emit("drawing-data", drawingData);
      });

      socket.on("clear-canvas", ({ roomId: rawRoomId }) => {
        const roomId = normalizeRoomId(rawRoomId);
        if (!whiteboardRooms.has(roomId)) return;
        const room = whiteboardRooms.get(roomId);
        room.canvasData = [];
        io.to(roomId).emit("canvas-cleared");
      });

      // Simplified voice signaling (you can keep your existing webrtc-offer/answer/ice logic)
      socket.on("voice-connected", ({ roomId: rawRoomId, userId }) => {
        const roomId = normalizeRoomId(rawRoomId);
        if (!whiteboardRooms.has(roomId)) return;
        const room = whiteboardRooms.get(roomId);
        room.voiceUsers.add(String(userId));
        socket.to(roomId).emit("user-voice-connected", { userId });
      });

      socket.on("voice-disconnected", ({ roomId: rawRoomId, userId }) => {
        const roomId = normalizeRoomId(rawRoomId);
        if (!whiteboardRooms.has(roomId)) return;
        const room = whiteboardRooms.get(roomId);
        room.voiceUsers.delete(String(userId));
        socket.to(roomId).emit("user-voice-disconnected", { userId });
      });

      // WebRTC signaling forwarded via onlineUsers map
      const findSocket = (targetUserId) => Array.from(onlineUsers.entries()).find(([uid]) => uid === String(targetUserId));

      socket.on("webrtc-offer", ({ targetUserId, fromUserId, offer }) => {
        const entry = findSocket(targetUserId);
        if (entry) {
          io.to(entry[1].socketId).emit("webrtc-offer", { offer, fromUserId });
        }
      });

      socket.on("webrtc-answer", ({ targetUserId, fromUserId, answer }) => {
        const entry = findSocket(targetUserId);
        if (entry) {
          io.to(entry[1].socketId).emit("webrtc-answer", { answer, fromUserId });
        }
      });

      socket.on("webrtc-ice-candidate", ({ targetUserId, fromUserId, candidate }) => {
        const entry = findSocket(targetUserId);
        if (entry) {
          io.to(entry[1].socketId).emit("webrtc-ice-candidate", { candidate, fromUserId });
        }
      });

      socket.on("disconnect", () => {
        console.log("❌ User disconnected:", socket.id);
        let removed = null;
        for (const [userId, info] of onlineUsers.entries()) {
          if (info.socketId === socket.id) {
            removed = userId;
            onlineUsers.delete(userId);
            break;
          }
        }
        if (removed) {
          io.emit("active-users", Array.from(onlineUsers.entries()).map(([userId, { username }]) => ({ userId, username })));
          io.emit("user-offline", { userId: removed });

          // Remove from any whiteboard room
          for (const [roomId, room] of whiteboardRooms.entries()) {
            if (room.users.has(String(removed))) {
              room.users.delete(String(removed));
              room.voiceUsers.delete(String(removed));
              socket.to(roomId).emit("user-left-room", removed);
              socket.to(roomId).emit("user-voice-disconnected", { userId: removed });
              broadcastRoomUsers(roomId);
              if (room.users.size === 0) {
                whiteboardRooms.delete(roomId);
              }
            }
          }
        }
      });
    });

    res.socket.server.io = io;
  }

  res.end();
}
