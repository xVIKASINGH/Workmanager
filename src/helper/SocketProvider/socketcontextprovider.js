"use client";
import React, { createContext, useContext, useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { data: session, status } = useSession();
  const [socket, setSocket] = useState(null);
  const connectingRef = useRef(false);

  useEffect(() => {
    if (connectingRef.current) return;
    if (status !== "authenticated" || !session?.user) return;

    connectingRef.current = true;

    const userId = session.user.id || session.user.email;
    const username = session.user.username || session.user.name || session.user.email || "Guest";

    const socketInstance = io(window.location.origin, {
      path: "/api/socket",
      transports: ["websocket"],
      timeout: 10000,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket connected:", socketInstance.id);
      socketInstance.emit("user-online", { userId, username });
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("⚠️ Socket connect_error (handled):", err.message || err);
    });

    socketInstance.on("error", (err) => {
      console.warn("⚠️ Socket error (handled):", err);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.off();
      socketInstance.disconnect();
      setSocket(null);
      connectingRef.current = false;
    };
  }, [session, status]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
