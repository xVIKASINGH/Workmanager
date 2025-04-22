"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Clock,
  FileText,
  PaperclipIcon,
  User,
  CheckCircle2,
  Circle,
  AlertCircle,
  MessageSquare,
  Paperclip
} from "lucide-react";

function Page() {
  const { data: session } = useSession();
  const [project, setProject] = useState(null);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [file,setfiles]=useState("");
  const [activeTab, setActiveTab] = useState("tasks");
  const [feedback,setfeedback]=useState({})
  const { id } = useParams();

  const fetchProject = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/project/myprojects/teamproject/${id}`);
      const data = await res.json();

      if (data.project) {
        console.log(data.project)
        setProject(data.project);
        
      
        const currentUserData = data.project.teammates.find(
          (teammate) => teammate.userId._id === session?.user?.id
        );
        
        if (currentUserData) {
          setfeedback(currentUserData.feedback)
          setMyTasks(currentUserData);
        }
      }
    } catch (error) {
      console.error("Error fetching project:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchProject();
    }
  }, [id, session]);

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`/api/project/myprojects/update-task-status/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          taskId,
          newStatus,
        }),
      });

      if (response.ok) {
        
        const updatedTasks = { ...myTasks };
        const taskIndex = updatedTasks.assigntask.findIndex(
          (task) => task._id === taskId
        );
        
        if (taskIndex !== -1) {
          updatedTasks.assigntask[taskIndex].status = newStatus;
          setMyTasks(updatedTasks);
        }
        
        
        fetchProject();
      }
    } catch (error) {
      console.error("Error updating task status:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() && !file) return;
  
    try {
      const formData = new FormData();
      formData.append("content", newComment);
      if (file) formData.append("attachments", file); 
  
      const response = await fetch(`/api/project/myprojects/add-comment/${id}`, {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        setNewComment("");
        setfiles(null);
        fetchProject();
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };
  

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Circle className="h-4 w-4 text-blue-500 fill-blue-100" />;
      default:
        return <Circle className="h-4 w-4 text-gray-300" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  const calculateProgress = () => {
    if (!myTasks?.assigntask?.length) return 0;
    
    const completedTasks = myTasks.assigntask.filter(task => task.status === 'completed').length;
    return Math.round((completedTasks / myTasks.assigntask.length) * 100);
  };

  
  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading your assignments...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <p className="mt-4 text-gray-700">Project not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">{project.title}</h1>
        <p className="text-gray-500 mt-1">{project.description}</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-1 space-y-6">

          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>My Progress</CardTitle>
                  <CardDescription>Your task completion</CardDescription>
                </div>
                <Badge className="bg-blue-500">{calculateProgress()}% Complete</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2 mb-6">
                <Progress value={calculateProgress()} className="h-2" />
              </div>
              
              <div className="flex items-center gap-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${session?.user?.username || 'TM'}`} />
                  <AvatarFallback>{session?.user?.username?.[0] || 'TM'}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{session?.user?.name}</h3>
                  <p className="text-sm text-gray-500">{session?.user?.email}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Total Tasks</span>
                  <span className="font-medium">{myTasks?.assigntask?.length || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Completed</span>
                  <span className="font-medium text-green-600">
                    {myTasks?.assigntask?.filter(task => task.status === 'completed').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">In Progress</span>
                  <span className="font-medium text-blue-600">
                    {myTasks?.assigntask?.filter(task => task.status === 'in-progress').length || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Pending</span>
                  <span className="font-medium text-gray-600">
                    {myTasks?.assigntask?.filter(task => task.status === 'pending').length || 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
         
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Project Deadline</p>
                  <p className="font-medium">{formatDate(project.deadline)}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Project Lead</p>
                  <p className="font-medium">{project.creator.username|| "Project Owner"}</p>
                </div>
              </div>
                 
              <div className="flex items-center gap-3">
            
                <div>
                  <p className="text-sm text-gray-500">Project description</p>
                  <p className="text-sm text-gray-500">{project.description}</p>
                </div>
              </div>

                 
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Created On</p>
                  <p className="font-medium">{formatDate(project.createdAt)}</p>
                </div>
              </div>
         
              <div>
                <p className="text-sm text-gray-500 mb-2">Overall Progress</p>
                <Progress value={parseInt(project.progress)} className="h-2" />
                <p className="text-xs text-right mt-1 text-gray-500">{project.progress}% Complete</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {project.teammates?.length > 0 ? (
                  project.teammates.map((teammate, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${teammate.userId?.username || 'TM'}`} />
                          <AvatarFallback>{teammate.userId?.username?.[0] || 'TM'}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{teammate.userId?.username || `Team Member ${index + 1}`}</span>
                      </div>
                      <Badge variant="outline">
                        {teammate.assigntask?.filter(task => task.status === 'completed').length || 0}/{teammate.assigntask?.length || 0}
                      </Badge>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-500">No team members yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
    
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-4">
              <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="tasks">My Tasks</TabsTrigger>
                  <TabsTrigger value="communication">Communication</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            
            <CardContent>
              {activeTab === "tasks" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Assigned Tasks</h3>
                    <Badge variant="outline">
                      {myTasks?.assigntask?.filter(task => task.status === 'completed').length || 0}/{myTasks?.assigntask?.length || 0} Completed
                    </Badge>
                  </div>
                  
                  {myTasks?.assigntask?.length > 0 ? (
                    <div className="grid gap-4">
                      {myTasks.assigntask.map((task, index) => (
                        <Card key={index} className={`border ${isOverdue(task.dueDate) && task.status !== 'completed' ? 'border-red-200 bg-red-50' : ''}`}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-start gap-3">
                                <div className="mt-1">{getStatusIcon(task.status)}</div>
                                <div>
                                  <h4 className="font-medium text-lg">{task.task}</h4>
                                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                    <Calendar className="h-3 w-3" />
                                    <span>Due: {task.dueDate ? formatDate(task.dueDate) : "No deadline"}</span>
                                    {isOverdue(task.dueDate) && task.status !== 'completed' && (
                                      <Badge variant="outline" className="ml-2 text-red-500 border-red-200 text-xs">
                                        Overdue
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <Badge className={getStatusColor(task.status)}>
                                {task.status}
                              </Badge>
                            </div>
                            
                          
                            
                            <div className="mt-4 pt-3 border-t flex justify-end gap-2">
                              {task.status !== 'in-progress' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleStatusChange(task._id, 'in-progress')}
                                >
                                  Mark In Progress
                                </Button>
                              )}
                              
                              {task.status !== 'completed' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-green-600 border-green-200 hover:bg-green-50"
                                  onClick={() => handleStatusChange(task._id, 'completed')}
                                >
                                  Mark Complete
                                </Button>
                              )}
                              
                              {task.status !== 'pending' && task.status !== 'in-progress' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                  onClick={() => handleStatusChange(task._id, 'in-progress')}
                                >
                                  Reopen
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg bg-gray-50">
                      <CheckCircle2 className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                      <h3 className="font-medium text-gray-700">No tasks assigned yet</h3>
                      <p className="text-sm text-gray-500 mt-1">Check back later for new assignments</p>
                    </div>
                  )}
                </div>
              )}
              
              {activeTab === "communication" && (
                <div className="space-y-6">
                  <h3 className="font-semibold text-lg">Team Communication</h3>
                  
                  <div className="space-y-4 max-h-96 overflow-y-auto mb-4 p-2">
                    {project.teammates?.some(teammate => teammate.comments?.length > 0) ? (
                      project.teammates.flatMap(teammate => (
                        teammate.comments?.map((comment, commentIndex) => (
                          <div 
                            key={`${teammate.userId._id}-${commentIndex}`} 
                            className={`flex gap-3 ${teammate.userId._id === session?.user?.id ? 'justify-end' : ''}`}
                          >
                            {teammate.userId._id !== session?.user?.id && (
                              <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${teammate.userId?.username || 'TM'}`} />
                                <AvatarFallback>{teammate.userId?.name?.[0] || 'TM'}</AvatarFallback>
                              </Avatar>
                            )}
                            
                            <div className={`rounded-lg p-3 max-w-[80%] ${
                              teammate.userId._id === session?.user?.id 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100'
                            }`}>
                              {teammate.userId._id !== session?.user?.id && (
                                <p className="font-medium text-sm mb-1">{teammate.userId?.username}</p>
                              )}
                              <p className="mb-1">{comment.content}</p>
                              <div className="text-xs text-right opacity-70">
                                {formatDate(comment.timestamp)}
                              </div>
                              
                            {comment.attachments?.length > 0 && (
  <div className="mt-2 pt-2 border-t border-blue-200">
    <div className="flex flex-wrap gap-2">
      {comment.attachments.map((file, fileIndex) => (
        <a
          key={fileIndex}
          href={file.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="no-underline"
        >
          <Badge variant="outline" className="text-xs flex items-center gap-1 cursor-pointer">
            <PaperclipIcon className="h-3 w-3 " />
            {file.filename}
          </Badge>
        </a>
      ))}
    </div>
  </div>
)}

                            </div>
                            
                            {teammate.userId._id === session?.user?.id && (
                              <Avatar className="h-8 w-8 mt-1">
                                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${session?.user?.username || 'Me'}`} />
                                <AvatarFallback>{session?.user?.username?.[0] || 'Me'}</AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        )) || []
                      ))
                    ) : (
                      <div className="text-center py-12 border rounded-lg bg-gray-50">
                        <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                        <h3 className="font-medium text-gray-700">No comments yet</h3>
                        <p className="text-sm text-gray-500 mt-1">Start the conversation with your team</p>
                      </div>
                    )}
                  </div>
                  
                  <form onSubmit={handleAddComment} className="mt-4 pt-4 border-t">
  <div className="flex items-center gap-2">
    <Avatar className="h-8 w-8">
      <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${session?.user?.username || 'Me'}`} />
      <AvatarFallback>{session?.user?.name?.[0] || 'Me'}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <Textarea
        placeholder="Write a comment..."
        value={newComment}
        onChange={(e) => setNewComment(e.target.value)}
        className="resize-none"
        rows={2}
      />
    </div>
  </div>

  <div className="flex justify-between items-center mt-2">
    <div className="flex items-center gap-2">
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={(e) => setfiles(e.target.files[0])}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={() => document.getElementById('file-upload').click()}
      >
        <Paperclip className="h-4 w-4" />
        Attach File
      </Button>
      {file && <span className="text-sm text-gray-500">{file.name}</span>}
    </div>
    <Button type="submit" size="sm" disabled={!newComment.trim() && !file}>
      Send
    </Button>
  </div>
</form>

                </div>
              )}
            </CardContent>
          </Card>
       
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              {myTasks?.assigntask?.filter(task => task.status !== 'completed' && task.dueDate).length > 0 ? (
                <div className="space-y-3">
                  {myTasks.assigntask
                    .filter(task => task.status !== 'completed' && task.dueDate)
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .map((task, index) => (
                      <div key={index} className="flex justify-between items-center p-2 rounded border">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(task.status)}
                          <span className="font-medium">{task.task}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${isOverdue(task.dueDate) ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                            {formatDate(task.dueDate)}
                          </Badge>
                          <Badge variant="outline">{task.status}</Badge>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500">No upcoming deadlines</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
      <CardHeader>
        <CardTitle>Feedback</CardTitle>
      </CardHeader>
      <CardContent>
        {feedback?.content ? (
          <div className="p-3 rounded border">
            <div className="flex justify-between items-center mb-2">
              <Badge variant="outline" className="text-xs">
                {formatDate(feedback.createdAt)}
              </Badge>
            </div>
            <p className="text-sm text-gray-700">
              {feedback.content}
            </p>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No feedback available</p>
          </div>
        )}
      </CardContent>
    </Card>
        </div>
      </div>
    </div>
  );
}

export default Page;