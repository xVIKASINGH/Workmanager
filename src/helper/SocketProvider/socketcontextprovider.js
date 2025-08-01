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

    // Explicitly disable auto connect if you want to control retry logic
    const socketInstance = io({
      path: "/api/socket",
      transports: ["websocket"],
      // optional: you can add reconnection attempts etc:
      reconnectionAttempts: 5,
      timeout: 5000,
      autoConnect: true,
    });

    const onConnect = () => {
      console.log("✅ Socket connected:", socketInstance.id);
      socketInstance.emit("user-online", { userId, username });
    };
    const onConnectError = (err) => {
      console.warn("⚠️ Socket connection error (handled):", err?.message || err);
      // don't throw—just surface to dev console. Optionally show UI indication.
    };
    const onError = (err) => {
      console.warn("⚠️ Socket error (handled):", err);
    };
    const onDisconnect = (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
    };

    socketInstance.on("connect", onConnect);
    socketInstance.on("connect_error", onConnectError);
    socketInstance.on("error", onError);
    socketInstance.on("disconnect", onDisconnect);

    setSocket(socketInstance);

    return () => {
      socketInstance.off("connect", onConnect);
      socketInstance.off("connect_error", onConnectError);
      socketInstance.off("error", onError);
      socketInstance.off("disconnect", onDisconnect);
      socketInstance.disconnect();
      setSocket(null);
      connectingRef.current = false;
    };
  }, [session, status]);

  // Optionally you can render a loader while socket is initializing instead of null
  if (!socket) return null;

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  return useContext(SocketContext);
}
