"use client";
import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { io } from "socket.io-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Circle, User, MessageCircle, Search, Phone, Video, Info } from "lucide-react";
import { cn } from "@/lib/utils";

let socket;

export default function MessagesPage() {
  const { data: session } = useSession();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [userTyping, setUserTyping] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [userConnections, setUserConnections] = useState([]);
  const currentUser = String(session?.user?.id || session?.user?.email || `guest_${Date.now()}`);
  const currentUsername = session?.user?.username || session?.user?.name || session?.user?.email || "Guest User";
  const [allConnections, setAllConnections] = useState([]);

  // Fetch messages function - moved outside useEffect so it can be reused
  const fetchMessages = async (userId) => {
    try {
      const res = await fetch(`/api/messages/fetchmessages?userA=${currentUser}&userB=${userId}`);
      const data = await res.json();
      setChats((prev) => ({
        ...prev,
        [userId]: (data.messages || []).map(msg => ({
          ...msg,
          isCurrentUser: msg.from === currentUser
        }))
      }));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetch("/api/connections")
      .then(res => res.json())
      .then(data => {
        const connections = (data.connections || []).map(conn => ({
          ...conn,
          userId: String(conn._id),
        }));
        setAllConnections(connections);
        setUserConnections(connections.map(conn => String(conn._id)));
      })
      .catch(error => console.error("Error fetching connections:", error));
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    socket = io({ path: "/api/socket" });

    socket.on("connect", () => {
      setIsConnected(true);
      socket.emit("user-online", {
        userId: currentUser,
        username: currentUsername
      });
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    socket.on("active-users", (users) => {
      console.log("Active users from server:", users.map(u => u.userId));
      setOnlineUsers(
        users.filter(
          (u) =>
            String(u.userId) !== String(currentUser) &&
            userConnections.includes(String(u.userId))
        )
      );
    });

    socket.on("user-typing", ({ fromUsername, isTyping }) => {
      if (isTyping) {
        setUserTyping(fromUsername);
        setTimeout(() => setUserTyping(null), 3000);
      } else {
        setUserTyping(null);
      }
    });

    socket.on("receive-message", (msg) => {
      setChats((prev) => ({
        ...prev,
        [msg.from]: [
          ...(prev[msg.from] || []),
          {
            ...msg,
            isCurrentUser: msg.from === currentUser
          }
        ]
      }));
    });

    socket.on("user-offline", ({ userId }) => {
      // Optionally handle user offline
    });

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [currentUser, currentUsername, userConnections]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats, selectedUser]);

  const sendMessage = async () => {
    if (!selectedUser || !message.trim()) return;

    const messageText = message.trim();
    const timestamp = new Date();

    const newMessage = {
      from: currentUser,
      to: selectedUser.userId,
      fromUsername: currentUsername,
      text: messageText,
      timestamp: timestamp,
      isCurrentUser: true
    };

    // Optimistically update UI
    setChats((prev) => ({
      ...prev,
      [selectedUser.userId]: [
        ...(prev[selectedUser.userId] || []),
        newMessage
      ]
    }));

    // Clear input immediately
    setMessage("");
    stopTyping();

    try {
      // Emit to socket for real-time communication
      socket.emit("send-message", {
        to: String(selectedUser.userId),
        from: String(currentUser),
        fromUsername: currentUsername,
        text: messageText,
      });

      // Save to database
      const response = await fetch("/api/messages/addmessages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: String(currentUser),
          to: String(selectedUser.userId),
          text: messageText,
          timestamp: timestamp,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save message to database");
      }

      const result = await response.json();
      console.log("Message saved to DB:", result);

    } catch (error) {
      console.error("Error sending message:", error);
      // Optionally show error to user or retry logic
      // For now, the message stays in UI since it was optimistically added
    }
  };

  const handleTyping = (value) => {
    setMessage(value);

    if (!selectedUser) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing", {
        to: selectedUser.userId,
        fromUsername: currentUsername,
        isTyping: true
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (isTyping && selectedUser) {
      setIsTyping(false);
      socket.emit("typing", {
        to: selectedUser.userId,
        fromUsername: currentUsername,
        isTyping: false
      });
    }
  };

  const getCurrentChat = () => {
    return selectedUser ? chats[selectedUser.userId] || [] : [];
  };

  const formatTime = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date(date));
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Messages</h1>
            <div className="flex items-center gap-2">
              <div className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500" : "bg-red-500"
              )} />
              <span className="text-xs text-gray-500">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {currentUsername} • {onlineUsers.length} online
          </p>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search conversations"
              className="pl-10"
            />
          </div>
        </div>

        {/* Online Users */}
        <div className="flex-1 overflow-hidden">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Circle className="w-2 h-2 fill-green-500 text-green-500 mr-2" />
              Online ({onlineUsers.length})
            </h3>
          </div>
          <ScrollArea className="flex-1 px-2">
            <div className="space-y-1">
              {allConnections.map((user) => {
                const isOnline = onlineUsers.some(u => String(u.userId) === user.userId);
                return (
                  <div
                    key={user.userId}
                    onClick={async () => {
                      setSelectedUser({ ...user, userId: String(user.userId) });
                      await fetchMessages(user.userId);
                    }}
                    className={cn(
                      "flex items-center gap-3 p-3 mx-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100",
                      selectedUser?.userId === user.userId && "bg-blue-50 border border-blue-200 hover:bg-blue-50"
                    )}
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3 h-3 border-2 border-white rounded-full",
                        isOnline ? "bg-green-500" : "bg-gray-300"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">
                        {user.username}
                      </p>
                      <p className={cn(
                        "text-xs",
                        isOnline ? "text-green-600" : "text-gray-400"
                      )}>
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                    {chats[user.userId]?.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        {chats[user.userId].length}
                      </Badge>
                    )}
                  </div>
                );
              })}
              {allConnections.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm">No connections</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{selectedUser.username}</h2>
                    <p className="text-sm text-green-600">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {getCurrentChat().map((msg, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex gap-3",
                      msg.isCurrentUser && "flex-row-reverse"
                    )}
                  >
                    {!msg.isCurrentUser && (
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-xs lg:max-w-md px-4 py-2 rounded-2xl",
                      msg.isCurrentUser
                        ? "bg-blue-500 text-white ml-auto"
                        : "bg-gray-100 text-gray-900"
                    )}>
                      <p className="text-sm">{msg.text}</p>
                      <p className={cn(
                        "text-xs mt-1",
                        msg.isCurrentUser ? "text-blue-100" : "text-gray-500"
                      )}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {userTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-2xl">
                      <p className="text-sm text-gray-500">
                        {userTyping} is typing...
                      </p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => handleTyping(e.target.value)}
                  placeholder={`Message ${selectedUser.username}...`}
                  className="flex-1"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                />
                <Button 
                  onClick={sendMessage}
                  disabled={!message.trim()}
                  className="px-4"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a user from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}