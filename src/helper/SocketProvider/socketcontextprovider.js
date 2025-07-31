"use client";
import { createContext, useContext, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { data: session } = useSession();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!session?.user) return;

    const currentUser = String(session.user.id || session.user.email);
    const currentUsername = session.user.username || session.user.name || session.user.email || "Guest User";

    socketRef.current = io({ path: "/api/socket" });

    socketRef.current.on("connect", () => {
      socketRef.current.emit("user-online", {
        userId: currentUser,
        username: currentUsername,
      });
    });

    // Optionally handle disconnects, etc.

    return () => {
      socketRef.current?.disconnect();
    };
  }, [session]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}