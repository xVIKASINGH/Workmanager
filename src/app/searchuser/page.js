"use client";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import {useRouter } from "next/navigation";

export default function SearchUserPage() {
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchmyself,setsearchmyself]=useState(false);
  const [sendreq,setsendreq]=useState([]);
    const [alreadyconnected,setalreadyconnected]=useState(false);
  const router=useRouter();
 if (status === "loading") return <p>Loading session...</p>;
 
 if (!session) return <p>User not logged in</p>;

  const handleSearch = async () => {
    if (!username) return;
    setLoading(true);
    setError("");
    setUser(null);
    try {
      const res = await fetch(`/api/searchuser/${username}`);
      const data = await res.json();
 
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      if(data.user.username===session.user.username){
      setsearchmyself(true);
      }else{
        setsearchmyself(false)
      }
      if(res.status===203){
        setalreadyconnected(true);
      }
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  const handlerequest=async()=>{
    console.log('add button clicked!')
    setLoading(true);
    try {
      const res = await fetch(`/api/searchuser/${username}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentUserId: session?.user?.id, 
        }),
      });
      const data=await res.json(res);
      const id=data.user._id;
   
      setsendreq(prev=>[...prev,id]);
      if(res.ok){
        alert( data.message ||'Req send successfully')
        return id
      }
    } catch (error) {
      setError(error.message);
    }finally{
      setLoading(false)
    }
  }
 

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-12">
    <div className="w-full max-w-2xl bg-white text-gray-800 p-10 rounded-2xl shadow-lg transition-all">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800 tracking-wide">
        🔍 Find Your Buddy
      </h1>
  
      <div className="flex gap-3 mb-6">
        <Input
          className="flex-1 bg-white border border-gray-300 text-gray-800 placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 rounded-lg shadow-sm"
          placeholder="Enter exact username to find "
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button
          onClick={handleSearch}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-5 rounded-lg shadow-md transition-transform hover:scale-105"
        >
          Search
        </Button>
      </div>
  
      {loading && (
        <div className="space-y-4 animate-pulse">
          <Skeleton className="h-6 w-full bg-gray-300 rounded" />
          <Skeleton className="h-6 w-3/4 bg-gray-300 rounded" />
        </div>
      )}
  
      {error && <p className="text-red-500 mt-2 text-center">{error}</p>}
  
      {user && (
        <div className="animate-fadeIn mt-8">
          <Card className="bg-white border border-gray-200 rounded-xl shadow-md w-full">
            <CardContent className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-500 to-cyan-500 text-white flex items-center justify-center text-2xl font-bold uppercase shadow-sm">
                  {user.username?.charAt(0) || "U"}
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                  <p className="text-sm text-gray-600">@{user.username}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              
              {searchmyself ? (
  <Button
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium shadow-md"
    onClick={() => {
      console.log("View Profile clicked 🔥");
      router.push("/userprofile");
    }}
  >
    <i className="fa-solid fa-user"></i> View Profile
  </Button>
) : alreadyconnected ? (
  <Button
    disabled
    className="bg-green-500 text-white px-6 py-2 rounded-full font-medium cursor-not-allowed"
  >
    <i className="fa-solid fa-check mr-2"></i>Connected
  </Button>
) : sendreq.includes(user._id) ? (
  <Button
    disabled
    className="bg-gray-300 text-gray-600 px-6 py-2 rounded-full font-medium cursor-not-allowed"
  >
    <i className="fa-solid fa-clock mr-2"></i>Request Sent
  </Button>
) : (
  <Button
    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium shadow-md"
    onClick={async () => {
      console.log("Add Connection clicked 🔥");
      const id = await handlerequest();
      setsendreq((prev) => [...prev, id]);
    }}
  >
    <i className="fa-solid fa-user-plus mr-2"></i>Add Connection
  </Button>
)}


            
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  
    <style jsx>{`
      @keyframes fadeIn {
        0% {
          opacity: 0;
          transform: translateY(20px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
  
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out forwards;
      }
    `}</style>
  </div>
  
  );
}
