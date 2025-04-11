"use client";
import React, { useState, useEffect, Fragment } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import { Calendar } from "@/components/ui/calendar";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns"
import { CalendarIcon, FileTerminal } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CheckCheck ,Trash} from 'lucide-react';


export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [task, setTask] = useState("");
  const [description, setdescription] = useState("");
  const [deadline, setDeadline] = useState(null);
const [completedtask,setcompletedtask]=useState([]);
  const [alltask, setalltask] = useState([]);
  const [progress, setProgress] = useState(13);
  const [loadingTasks, setLoadingTasks] = useState(false);

  useEffect(() => {

    const timer = setTimeout(() => setProgress(66), 500);
    return () => clearTimeout(timer);
  }, []);

  if (status === "loading") {
    return <Progress value={progress} className="w-[60%]" />;
  }

  if (!session) {
    router.push("/login");
    return null;
  }
 
  const handleAddTask = () => setIsOpen(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/addtask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task,
        description,
        deadline,
      }),
    });

    const data = await res.json();
    if (res.ok) {
    
     setIsOpen(false)
      setTask("");
      setdescription("");
      setDeadline(null);
      showalltask();
    } else {
      alert(data.message || "Failed to add task");
    }
  };

  const showalltask = async (id) => {
    setLoadingTasks(true);
    try {
      const res = await fetch("/api/showtask");
      if (!res.ok) throw new Error("Failed to fetch tasks");
      const data = await res.json();
      console.log("Fetched tasks:", data);
     
      setalltask(data);
     
      const filtered=alltask.filter((task)=>task.completion===true);
      setcompletedtask(filtered);
      console.log(completedtask)
    } catch (error) {
      console.error("Error while fetching tasks:", error);
    } finally {
      setLoadingTasks(false);
    }
  };
  const updatecompletion=async(id)=>{
    setLoadingTasks(true);
    try {
      const res = await fetch(`/api/updatetask/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
       
      });
  
      const data = await res.json();
      showalltask();
    

     useEffect(()=>{
      showalltask()
     },[alltask,completedtask])
    } catch (error) {
      console.error("error in a put request")
    }finally{
      setLoadingTasks(false)
    }
 
  }
  const handledelete=async(id)=>{
    try {
      const res=await fetch(`/api/deletetask/${id}`,{
        method:"DELETE",
        headers:{"Content-Type":"application/json"},
      })
      const data=await res.json();
     console.log(data)
      setalltask((prev) => prev.filter((item) => item._id !== id));

      setcompletedtask((prev) => prev.filter((item) => item._id !== id));
     
    } catch (error) {
      console.log("Error while deleting task w8 for while..")
    }
    
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome to WorkManager Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard title="Total Tasks" value={alltask.length || 0} color="bg-blue-500" />
          <StatCard title="Completed" value={completedtask.length || 0} color="bg-green-500" />
          <StatCard title="Pending" value={alltask.length-completedtask.length || 0} color="bg-yellow-500" />
        </div>
        <button className="p-5 mt-4 border rounded-xl bg-black text-white"><a href="/request"><i className="fa-solid fa-user-plus"></i></a></button>
        <button className="p-5 mt-4 border rounded-xl bg-black text-white ml-2"><a href="/search"><i className="fa-solid fa-magnifying-glass"></i> &nbsp;Search User</a></button>
         
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <ActionButton text="Add Task" color="bg-indigo-600" onClick={handleAddTask} />
            <ActionButton text="View All Tasks" color="bg-gray-800" onClick={showalltask} />
            <button
              className="bg-red-800 text-white px-6 py-2 rounded-lg font-medium shadow hover:opacity-90"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Log out
            </button>
          </div>
        </div>

       
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Your Tasks</h2>
          {loadingTasks ? (
            <Progress value={66} className="w-[60%]" />
          ) : alltask.length === 0 ? (
            <p className="text-gray-600">No tasks loaded yet. Click "View All Tasks".</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {alltask.map((task) => (
                <Card key={task._id} className="shadow-lg">
                  <CardContent className="p-4">
                    <h3 className="text-xl font-bold mb-2">{task.title}</h3>
                    
                    <p className="text-gray-600 mb-2">{task.description}</p>
                    <Badge variant="outline">
                      Deadline: {new Date(task.deadline).toLocaleDateString()}
                    </Badge>
                    <div className="flex  items-center gap-3 ml-4 p-2">
                      {task.completion===true ? <Badge className="bg-green-600 text-white">Completed</Badge>
 :<CheckCheck className="text-green-600 h-6 w-6 hover:scale-110 cursor-pointer" onClick={()=>updatecompletion(task._id)}/> }
    
    <Trash className="text-red-500 h-6 w-6 hover:scale-110 cursor-pointer"onClick={()=>handledelete(task._id)} />
  </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        {completedtask.length > 0 && (
  <div className="mt-10">
    <h2 className="text-2xl font-semibold text-green-700 mb-4">
      ✅ Completed Tasks
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {completedtask.map((task) => (
        <Card key={task._id} className="bg-green-100 shadow-lg">
          <CardContent className="p-4">
            <h3 className="text-xl font-bold mb-2 text-green-900">{task.title}</h3>
            <p className="text-gray-700 mb-2">{task.description}</p>
            <Badge variant="outline">
              Deadline: {new Date(task.deadline).toLocaleDateString()}
            </Badge>
            <div className="flex items-center gap-3  p-2">
            <Badge className="bg-green-600 text-white">Completed</Badge>
              <Trash
                className="text-red-500 h-6 w-6 hover:scale-110 cursor-pointer"
                onClick={() => handledelete(task._id)}
              />
            </div>
            

          </CardContent>
        </Card>
      ))}
    </div>
  </div>
)}
      </div>
  

     
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => setIsOpen(false)}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            leave="ease-in duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                leave="ease-in duration-200"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left shadow-xl transition-all">
                  <Dialog.Title className="text-2xl font-bold text-gray-900 mb-4">
                    Add a New Task
                  </Dialog.Title>
                  <form onSubmit={handleSubmit}>
                    <input
                      type="text"
                      placeholder="Enter task title"
                      value={task}
                      onChange={(e) => setTask(e.target.value)}
                      className="w-full mt-2 p-3 border rounded-lg text-black"
                      required
                    />
                    <textarea
                      placeholder="Enter description"
                      value={description}
                      onChange={(e) => setdescription(e.target.value)}
                      className="w-full mt-4 p-3 border rounded-lg text-black"
                      required
                    />
                    <div className="mt-4">
                    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !deadline && "text-muted-foreground"
          )}
        >
          <CalendarIcon />
          {deadline ? format(deadline, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={deadline}
          onSelect={(date)=>setDeadline(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        className="px-4 py-2 bg-gray-200 rounded-md text-black"
                        onClick={() => setIsOpen(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md"
                      >
                        Add Task
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div className={`rounded-xl shadow-md text-white p-6 ${color}`}>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function ActionButton({ text, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-2 text-white rounded-lg font-medium shadow ${color} hover:opacity-90`}
    >
      {text}
    </button>
  );
}
