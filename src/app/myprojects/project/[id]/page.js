"use client";

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRef } from "react";

import { 
  Calendar, 
  Clock, 
  FileText, 
  PaperclipIcon, 
  User, 
  CheckCircle2, 
  Circle, 
  AlertCircle,
  Plus,
  Trash2,
  X,
  Star,
  StarIcon,
  ChartColumnDecreasing
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";


const ProjectDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCreator, setIsCreator] = useState(false);
  const dialogCloseRef = useRef(null);
  
 
  const [taskRatings, setTaskRatings] = useState({});
  const [taskReviews, setTaskReviews] = useState({});
  
  const [formData, setFormData] = useState({
    teammateId: "",
    task: "",
    dueDate: "",
  });
  
  useEffect(() => {
    const fetchProjectInfo = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/project/myprojects/project/${id}`); 
        const data = await res.json();
      console.log("here is your data",data)
        if (res.ok) {
          setProject(data.project);
          console.log(data.project);
         
          if (session?.user?.id && data.project.creator) {
            setIsCreator(session.user.id === data.project.creator._id);
          }
          

          const ratings = {};
          const reviews = {};
          
          data.project.teammates?.forEach(teammate => {
            teammate.assigntask?.forEach(task => {
              if (task._id) {
             
                if (task.qualityScore) {
                  console.log(task.qualityScore.rating, "and here is", task.qualityScore.reviewNotes);
                  ratings[task._id] = task.qualityScore.rating || 1;
                  reviews[task._id] = task.qualityScore.reviewNotes || "";
                } else {
                 
                  ratings[task._id] = 1;
                  reviews[task._id] = "";
                }
              }
            });
          });
          
          setTaskRatings(ratings);
          setTaskReviews(reviews);
         
          
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id && session?.user?.id) {
      fetchProjectInfo();
    }
  }, [id, session]);


  const handleAssignTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`/api/project/myprojects/assigntask/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        dialogCloseRef.current?.click();
        const updatedProject = { ...project };
        const teammateIndex = updatedProject.teammates.findIndex(
          (t) => t.userId._id === formData.teammateId
        );

        if (teammateIndex !== -1) {
          if (!updatedProject.teammates[teammateIndex].assigntask) {
            updatedProject.teammates[teammateIndex].assigntask = [];
          }
          
          updatedProject.teammates[teammateIndex].assigntask.push({
            task: formData.task,
            status: "pending",
            dueDate: formData.dueDate
          });
 
          setProject(updatedProject);
        }
      
        setFormData({
          teammateId: "",
          task: "",
          dueDate: "",
        });
      } else {
        throw new Error(data.message || "Failed to assign task");
      }
    } catch (error) {
      console.error("Error assigning task:", error);
    }
  };


  const handleDeleteProject = async () => {
    
    try {
      const response = await fetch(`/api/project/myprojects/delete/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/dashboard"); 
      } else {
        throw new Error(data.message || "Failed to delete project");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };
  
  const handleReview = async (taskId) => {
    try {
      const rating = taskRatings[taskId] || 1;
      const reviewNotes = taskReviews[taskId] || "";
  
      const response = await fetch(`/api/project/myprojects/review-task/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ taskId, rating, reviewNotes }),
      });
  
      const data = await response.json();
  
      if (response.ok) {
 
        const updatedProjectRes = await fetch(`/api/project/myprojects/project/${id}`);
        const updatedProjectData = await updatedProjectRes.json();
  
        if (updatedProjectRes.ok) {
          setProject(updatedProjectData.project); 
          alert("Review submitted successfully!");
        } else {
          throw new Error("Review submitted but failed to refresh project");
        }
      } else {
        throw new Error(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      alert("Failed to submit review. Please try again.");
    }
  };
  
  

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRatingChange = (taskId, rating) => {
    setTaskRatings(prev => ({
      ...prev,
      [taskId]: rating
    }));
  };
  
  const handleReviewNotesChange = (taskId, notes) => {
    setTaskReviews(prev => ({
      ...prev,
      [taskId]: notes
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading project details...</p>
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'in-progress':
        return <Circle className="h-4 w-4 text-blue-500" />;
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };
  

  const renderStarRating = (taskId) => {
    const rating = taskRatings[taskId] || 1;
    const stars = [];
    
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => handleRatingChange(taskId, i)}
          className="focus:outline-none"
        >
          {i <= rating ? (
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          ) : (
            <Star className="h-5 w-5 text-gray-300" />
          )}
        </button>
      );
    }
    
    return (
      <div className="flex space-x-1">
        {stars}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Project Dashboard</h1>
        <Button 
  variant="default" 
   
  onClick={() => router.push(`/project/performancestats/${id}`)}
  
>
<ChartColumnDecreasing /> Quick Analysis
</Button>

       
        
        {isCreator && (
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  
                  <Plus className="h-4 w-4" /> 
                  Assign Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign New Task</DialogTitle>
                  <DialogDescription>
                    Create a new task and assign it to a team member.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAssignTask}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <label htmlFor="teammateId" className="text-sm font-medium">
                        Assign To
                      </label>
                      <Select 
                        name="teammateId" 
                        value={formData.teammateId} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, teammateId: value }))}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team member" />
                        </SelectTrigger>
                        <SelectContent>
                          {project.teammates?.map((teammate) => (
                            <SelectItem 
                              key={teammate.userId._id} 
                              value={teammate.userId._id}
                            >
                              {teammate.userId.username || `Team member ${teammate._id}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="task" className="text-sm font-medium">
                        Task Description
                      </label>
                      <Textarea
                        id="task"
                        name="task"
                        value={formData.task}
                        onChange={handleFormChange}
                        placeholder="Describe the task..."
                        className="min-h-20"
                        required
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <label htmlFor="dueDate" className="text-sm font-medium">
                        Due Date
                      </label>
                      <Input
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={handleFormChange}
                        min={formatDateForInput(new Date())}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                  
                    <Button type="submit" variant="outline">Assign Task</Button>
                    <DialogClose asChild>
                      <button type="button" ref={dialogCloseRef} style={{ display: "none" }} />
                    </DialogClose>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" /> 
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the project
                    and remove all associated data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteProject} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{project.title}</CardTitle>
                  <CardDescription className="mt-1 text-gray-500">Project Details</CardDescription>
                </div>
                <Badge className="bg-blue-500">{project.progress}% Complete</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mt-2 mb-4">
                <Progress value={parseInt(project.progress)} className="h-2" />
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600">{project.description}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Deadline</p>
                    <p className="font-medium">{formatDate(project.deadline)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{formatDate(project.createdAt)}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Created by</p>
                    <p className="font-medium">{project.creator.email || "Project Owner"}</p>
                  </div>
                </div>
                
                {project.attachments?.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <PaperclipIcon className="h-4 w-4" />
                      Attachments ({project.attachments.length})
                    </h3>
                    <div className="space-y-2">
                      {project.attachments.map((file, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span>{file.filename}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
         
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Team Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {project.teammates?.length > 0 ? (
                  project.teammates.map((teammate, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${teammate.userId?.username || 'TM'}`} />
                          <AvatarFallback>{teammate.userId?.name?.[0] || 'TM'}</AvatarFallback>
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
          <Card>
            <CardHeader>
              <CardTitle>Team Activity</CardTitle>
              <CardDescription>Tasks and communications for all team members</CardDescription>
            </CardHeader>
            <CardContent>
              {project.teammates?.length > 0 ? (
                <div className="space-y-6">
                  {project.teammates.map((teammate, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${teammate.userId?.username || 'TM'}`} />
                            <AvatarFallback>{teammate.userId?.username?.[0] || 'TM'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-semibold">{teammate.userId?.username || `Team Member ${index + 1}`}</h3>
                            <p className="text-sm text-gray-500">{teammate.userId?.email || ''}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {teammate.assigntask?.filter(task => task.status === 'completed').length || 0}/{teammate.assigntask?.length || 0} Tasks Completed
                        </Badge>
                      </div>
                      
                      <Tabs defaultValue="tasks">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                          <TabsTrigger value="tasks">Assigned Tasks</TabsTrigger>
                          <TabsTrigger value="comments">Comments</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="tasks">
                          {teammate.assigntask?.length > 0 ? (
                            <div className="space-y-3">
                              {teammate.assigntask.map((task, taskIndex) => (
                                <div key={taskIndex} className="border rounded p-3">
                                  <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                      {getStatusIcon(task.status)}
                                      <h4 className="font-medium">{task.task}</h4>
                                    </div>
                                    <Badge className={getStatusColor(task.status)}>
                                      {task.status}
                                    </Badge>
                                  </div>
                                  
                                  <div className="text-sm text-gray-500 flex items-center gap-1 mt-2">
                                    <Calendar className="h-3 w-3" />
                                    <span>Due: {task.dueDate ? formatDate(task.dueDate) : "No deadline"}</span>
                                  </div>
                                  
                                 
                                  {task.status === 'completed' && isCreator && (
  <div className="mt-3 pt-3 border-t">
    <h5 className="text-sm font-medium mb-2">Review Task</h5>

    {task.qualityScore && task.qualityScore.rating ? (
     
      <div className="space-y-2">
        <div className="flex items-center">
          <p className="text-xs text-gray-500 mr-2">Rating:</p>
          <div className="flex">
            {[...Array(task.qualityScore.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ))}
            {[...Array(5 - task.qualityScore.rating)].map((_, i) => (
              <Star key={i} className="h-4 w-4 text-gray-300" />
            ))}
          </div>
        </div>
        {task.qualityScore.reviewNotes && (
          <div>
            <p className="text-xs text-gray-500">Feedback:</p>
            <p className="text-sm mt-1 bg-gray-50 p-2 rounded">
              {task.qualityScore.reviewNotes}
            </p>
          </div>
        )}
      </div>
    ) : (
     
      <div className="space-y-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Rating:</p>
          {renderStarRating(task._id)}
        </div>

        <div>
          <p className="text-xs text-gray-500 mb-1">Feedback:</p>
          <Textarea
            placeholder="Add your feedback on this task..."
            value={taskReviews[task._id] || ""}
            onChange={(e) => handleReviewNotesChange(task._id, e.target.value)}
            className="text-sm h-20"
          />
        </div>

        <Button 
          size="sm"
          onClick={() => handleReview(task._id)}
          className="mt-2"
        >
          Submit Review
        </Button>
      </div>
    )}
  </div>
)}

                                  
                                  {task.attachments?.length > 0 && (
                                    <div className="mt-2 pt-2 border-t">
                                      <p className="text-xs text-gray-500 mb-1">Attachments:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {task.attachments.map((file, fileIndex) => (
                                          <Badge key={fileIndex} variant="outline" className="text-xs flex items-center gap-1">
                                            <PaperclipIcon className="h-3 w-3" />
                                            {file.filename}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-6">No tasks assigned yet</p>
                          )}
                        </TabsContent>
                        
                        <TabsContent value="comments">
                          {teammate.comments?.length > 0 ? (
                            <div className="space-y-3">
                              {teammate.comments.map((comment, commentIndex) => (
                                <div key={commentIndex} className="border rounded p-3">
                                  <p className="mb-2">{comment.content}</p>
                                  <div className="text-xs text-gray-500">
                                    {formatDate(comment.timestamp)}
                                  </div>
                                  
                                  {comment.attachments?.length > 0 && (
                                    <div className="mt-2 pt-2 border-t">
                                      <div className="flex flex-wrap gap-2">
                                        {comment.attachments.map((file, fileIndex) => (
                                          <Badge key={fileIndex} variant="outline" className="text-xs flex items-center gap-1">
                                            <PaperclipIcon className="h-3 w-3" />
                                            {file.filename}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-6">No comments yet</p>
                          )}
                        </TabsContent>
                      </Tabs>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <User className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                  <h3 className="font-medium text-gray-700">No team members yet</h3>
                  <p className="text-gray-500 text-sm mt-1">Add team members to collaborate on this project</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;