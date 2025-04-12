"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@headlessui/react";

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(true);
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (status !== "authenticated") return;
    const userId = session?.user?.id;

    const fetchConnections = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/request/${userId}`);
        const data = await res.json();

        const inReq = data.requests.filter(
          (req) =>
            (typeof req.reciever === "object"
              ? req.reciever._id?.toString?.()
              : req.reciever) === userId &&
            req.status !== "accepted" &&
            req.status !== "rejected"
        );
        
        const outReq = data.requests.filter(
          (req) =>
            (typeof req.sender === "object"
              ? req.sender._id?.toString?.()
              : req.sender) === userId &&
            req.status !== "accepted" &&
            req.status !== "rejected"
        );
        
    
        setIncoming(inReq);
        setOutgoing(outReq);
      } catch (error) {
        console.error("Error fetching connections", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
    fetchAcceptedConnections();
  }, [status, session]);

  const fetchAcceptedConnections = async () => {
    try {
      const res = await fetch("/api/connections", { method: "GET" });
      const data = await res.json();
      if (res.ok) {
        setConnections(data.connections);
      }
    } catch (error) {
      console.log("Error fetching accepted connections:", error);
    }
  };

  const handlerequest = async (user, reqId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/acceptreq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || `Connected with ${user.username}`);
        
        setIncoming((prev)=>prev.filter((req)=>req.id!==reqId));
      }
      
    } catch (error) {
      console.error("Error accepting request", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (reqId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/deletereq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Request deleted successfully");
        setOutgoing((prev)=>prev.filter((req)=>req.id!==reqId));

      }
    } catch (error) {
      console.error("Error deleting request", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading || !session) {
    return (
      <div className="max-w-4xl mx-auto mt-20 px-6">
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-full mb-4" />
        <Skeleton className="h-6 w-3/4" />
      </div>
    );
  }

  const renderUserCard = (user, type, reqId, direction) => (
    <li
      key={reqId}
      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition border border-gray-200"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-800">{user.username}</h3>
            <p className="text-xs text-gray-500">{type}</p>
          </div>
        </div>

        <div>
          {direction === "incoming" && (
            <Button
              onClick={() => handlerequest(user, reqId)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium shadow-md hover:scale-105 transition-transform"
            >
              Accept&nbsp;<i className="fa-solid fa-user-check ml-1"></i>
            </Button>
          )}
          {direction === "outgoing" && (
            <Button
              onClick={() => handleDeleteRequest(reqId)}
              className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full font-medium shadow-md hover:scale-105 transition-transform"
            >
              Cancel&nbsp;<i className="fa-solid fa-xmark ml-1"></i>
            </Button>
          )}
        </div>
      </div>
    </li>
  );

  const renderConnectionCard = (user) => (
    <li
      key={user._id}
      className="bg-white p-4 rounded-lg shadow hover:shadow-md transition border border-blue-200"
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback>
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-blue-900">{user.username}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
        </div>
      </div>
    </li>
  );

  return (
    <div className="max-w-5xl mx-auto mt-4 px-6 ">
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">
        👤 {session?.user?.name}'s Network
      </h1>

      <Card className="bg-white border shadow mb-10">
        <CardContent className="p-6">
          <p className="text-xl font-medium text-gray-800">📧 {session?.user?.email}</p>
          <p className="text-lg text-gray-500">@{session?.user?.username || "no_username"}</p>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <Card className="bg-white border shadow">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              📥 Incoming Requests
            </h2>
            {incoming.length === 0 ? (
              <p className="text-gray-500">No incoming requests.</p>
            ) : (
              <ul className="space-y-4">
                {incoming.map((req) =>
                  renderUserCard(req.sender, "invites you", req._id, "incoming")
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border shadow">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              📤 Sent Requests
            </h2>
            {outgoing.length === 0 ? (
              <p className="text-gray-500">No outgoing requests.</p>
            ) : (
              <ul className="space-y-4">
                {outgoing.map((req) =>
                  renderUserCard(req.reciever, "Pending your request", req._id, "outgoing")
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border shadow mb-10">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6 text-blue-900 border-b pb-2">
            🤝 My Connections
          </h2>
          {connections.length === 0 ? (
            <p className="text-gray-500">No connections yet. Start collaborating!</p>
          ) : (
            <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((conn) => renderConnectionCard(conn))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
