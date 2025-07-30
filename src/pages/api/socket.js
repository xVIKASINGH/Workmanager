import { Server } from "socket.io";

let io;
const onlineUsers = new Map(); // userId -> { socketId, username }

export default function handler(req, res) {
  if (!res.socket.server.io) {
    io = new Server(res.socket.server, {
      path: "/api/socket",
      addTrailingSlash: false,
      cors: { origin: "*" },
    });

    io.on("connection", (socket) => {
      // User comes online
      socket.on("user-online", ({ userId, username }) => {
        onlineUsers.set(String(userId), { socketId: socket.id, username });
        // Send updated user list to all
        io.emit(
          "active-users",
          Array.from(onlineUsers.entries()).map(([userId, { username }]) => ({
            userId,
            username,
          }))
        );
      });

      // Send message to both sender and recipient
      socket.on("send-message", ({ to, from, fromUsername, text }) => {
        console.log("send-message called", { to, from });
console.log("onlineUsers keys:", Array.from(onlineUsers.keys()));
        const toUser = onlineUsers.get(String(to));
        const fromUser = onlineUsers.get(String(from));
        const msg = {
          from,
          fromUsername,
          text,
          timestamp: Date.now(),
        };
        // Emit to recipient
        if (toUser) {
          io.to(toUser.socketId).emit("receive-message", msg);
        }
        // Emit to sender (so both see the message in real time)
        if (fromUser) {
          io.to(fromUser.socketId).emit("receive-message", msg);
        }
      });

      // Typing indicator
      socket.on("typing", ({ to, fromUsername, isTyping }) => {
        const toUser = onlineUsers.get(String(to));
        if (toUser) {
          io.to(toUser.socketId).emit("user-typing", { fromUsername, isTyping });
        }
      });

      // Handle disconnect
      socket.on("disconnect", () => {
        // Remove user from onlineUsers
        for (const [userId, info] of onlineUsers.entries()) {
          if (info.socketId === socket.id) {
            onlineUsers.delete(userId);
            io.emit(
              "active-users",
              Array.from(onlineUsers.entries()).map(([userId, { username }]) => ({
                userId,
                username,
              }))
            );
            io.emit("user-offline", { userId });
            break;
          }
        }
      });
    });

    res.socket.server.io = io;
  }
  res.end();
}