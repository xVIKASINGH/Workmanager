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

  useEffect(() => {
    if (status !== "authenticated") return;
    const userId = session?.user?.id;

    const fetchConnections = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/request/${userId}`);
        const data = await res.json();

        const inReq = data.requests.filter((req) => {
          const r = req.reciever;
          return (typeof r === 'object' ? r._id : r) === userId;
        });

        const outReq = data.requests.filter((req) => {
          const s = req.sender;
          return (typeof s === 'object' ? s._id : s) === userId;
        });

        setIncoming(inReq);
        setOutgoing(outReq);
      } catch (error) {
        console.error("Error fetching connections", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConnections();
  }, [status, session]);

  const handlerequest=async(user,reqId)=>{
    console.log("accept req hit..")
    const {id,username}=user
   
    setLoading(true)
    try {
        const res=await fetch(`/api/acceptreq/${id}`,{
            method:"POST",
            headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        connectionId:reqId
      }),
        })
        const data=await res.json();
        if(res.ok){
            alert(data.message|| `congrats you are now connected with ${username}`)
        }
    } catch (error) {
        console.error("error aa gyi",error);

    }finally{
        setLoading(false);
    }
  }
  const handleDeleteRequest=async(reqId)=>{
    console.log("delete req hit..")

   setLoading(true);
   try {
    const res=await fetch(`/api/deletereq/${reqId}`)
    const data=await res.json();
    if(res.ok){
        alert( data.message ||"Req deleted successfully");
    }
   } catch (error) {
    console.error("error aa gyi",error);
    
   }finally{
    setLoading(false)
   }
  }

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
      key={user._id}
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
              onClick={() => handlerequest(reqId,user)}
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

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="bg-white border shadow">
          <CardContent className="p-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">
              Incoming Requests
            </h2>
            <div>
            </div>
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
              Send Requests
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
    </div>
  );
}
