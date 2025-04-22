"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import TaskCompletionChart from "@/helper/TaskCalculationChart";
import TaskCompletionLineChart from "@/helper/LineChartCalculation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle, AlertCircle, TrendingUp, Calendar, User, MessageSquare, Loader2 } from "lucide-react";
import { GoogleGenAI } from "@google/genai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"

export default function ProjectDashboard() {
  const { id } = useParams();
  const [chartData, setChartData] = useState(null);
  const [lineChartData, setLineChartData] = useState([]);
  const [projectStats, setProjectStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedbacks, setFeedbacks] = useState({});
  const [generatingFeedback, setGeneratingFeedback] = useState({});
  const [fetchfeedbacks,setfetchFeedbacks]=useState([])
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_API_KEY });

  const generateAIFeedback = async (member) => {
    try {
      setGeneratingFeedback(prev => ({ ...prev, [member.username]: true }));
  
      if (!process.env.NEXT_PUBLIC_API_KEY) {
        throw new Error("API key is missing");
      }
  
      const response = await ai.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents: `You are a project manager writing a performance review directly addressed to the teammate below. Keep it concise and suitable to display in a UI card. Avoid generic commentary or mentioning UI format. Here's the teammate's data:

Name: ${member.username}

Completed Tasks: ${member.completed}

Pending Tasks: ${member.pending}

In-Progress Tasks: ${member.inProgress}

Average Time per Task: ${member.averageTime?.toFixed(1) || 'N/A'} days
(Note: If average time is 0, it means the task was completed immediately for testing purposes—consider this as good work.)

Now write a performance summary with constructive feedback and suggestions for improvement (if needed). Speak directly to ${member.username}.
`,
      });
      
      
      let fullResponse = "";
      for await (const chunk of response) {
  
        fullResponse += chunk.text || "";
      }
      
    
      setFeedbacks(prev => ({ 
        ...prev, 
        [member.username]: String(fullResponse) 
      }));
      
      toast("AI Review Generated",{
        
        description: "Review has been generated successfully. You can edit it before sending."
      });
      
    } catch (error) {
      console.error("Error generating AI feedback:", error);
      toast("error",{
        description: "Failed to generate AI feedback. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGeneratingFeedback(prev => ({ ...prev, [member.username]: false }));
    }
  };


  const handleFeedbackChange = (username, value) => {
    setFeedbacks(prev => ({
      ...prev,
      [username]: value
    }));
  };


  const sendFeedback = async (username) => {
    try {
    
      await fetch(`/api/project/myprojects/feedback/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username, 
          content: feedbacks[username],
          projectId: id
        })
      });
      
     
      const newFeedback = {
        username: username,
        feedback: {
          content: feedbacks[username],
          createdAt: Date.now()
        }
      };
      
      setfetchFeedbacks(prev => [...prev, newFeedback]);
    
      setFeedbacks(prev => ({
        ...prev,
        [username]: ''
      }));
      
      toast("Feedback Sent", {
        description: `Your feedback for ${username} has been sent successfully.`,
      });
      
    } catch (error) {
      console.error("Error sending feedback:", error);
      toast("error", {
        description: "Failed to send feedback. Please try again.",
        variant: "destructive"
      });
    }
  };
  useEffect(() => {
    async function fetchStats() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/project/myprojects/task-stats/${id}`);
        const data = await res.json();
       
        if (data.feedbacks) {
          setfetchFeedbacks(data.feedbacks);
        }

        let lineData = [];
        for (let task of data.alltaskinfo) {
          if (task.status === 'completed') {
            const createdAt = new Date(task.createdAt);
            const completedAt = new Date(task.completedAt);
            const timeTakenInDays = Math.ceil((completedAt - createdAt) / (1000 * 60 * 60 * 24));
            
            lineData.push({
              username: task.username,
              taskName: task.taskName,
              timeTaken: timeTakenInDays,
              completedAt: task.completedAt
            });
          }
        }
      
        const totalTasks = data.alltaskinfo.length;
        const completedTasks = data.alltaskinfo.filter(task => task.status === 'completed').length;
        const pendingTasks = data.alltaskinfo.filter(task => task.status === 'pending').length;
        const inProgressTasks = data.alltaskinfo.filter(task => task.status === 'in-progress').length;
        
       
        const now = new Date();
        const deadline = new Date(data.deadline);
        const daysRemaining = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
        
        
        const teammateStats = data.labels.map((username, index) => {
          return {
            username,
            completed: data.completed[index],
            pending: data.pending[index],
            inProgress: data.inProgress[index],
            averageTime: data.averagetime[index]
          };
        });
        
        setProjectStats({
          totalTasks,
          completedTasks,
          pendingTasks,
          inProgressTasks,
          progress: data.progress,
          daysRemaining,
          deadline: data.deadline,
          teammateStats
        });
        
        setLineChartData(lineData);
        setChartData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching project data:", error);
        setIsLoading(false);
      }
    }
    
    fetchStats();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center gap-2">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium">Loading project dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Project Analytics Dashboard</h1>
        
        {projectStats && (
          <Badge className="px-3 py-1 text-sm" variant={projectStats.daysRemaining > 7 ? "outline" : "destructive"}>
            <Calendar className="w-4 h-4 mr-1" />
            {projectStats.daysRemaining > 0 ? 
              `${projectStats.daysRemaining} days remaining` : 
              'Deadline passed'}
          </Badge>
        )}
      </div>
      
      {projectStats && projectStats.progress < 50 && projectStats.daysRemaining < 7 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Project at Risk</AlertTitle>
          <AlertDescription>
            Project is only {projectStats.progress}% complete with {projectStats.daysRemaining} days remaining to deadline.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
       
        <Card>
          <CardHeader>
            <CardTitle>Team Task Distribution</CardTitle>
            <CardDescription>Breakdown of tasks by completion status</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData ? (
              <div className="h-64">
                <TaskCompletionChart chartData={chartData} />
              </div>
            ) : (
              <p className="text-muted-foreground">No chart data available</p>
            )}
          </CardContent>
        </Card>
        

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Task Completion Time Analysis</CardTitle>
            <CardDescription>Time taken to complete tasks per team member</CardDescription>
          </CardHeader>
          <CardContent>
            {lineChartData.length > 0 ? (
              <div className="h-64">
                <TaskCompletionLineChart tasksData={lineChartData} />
              </div>
            ) : (
              <p className="text-muted-foreground">No completed tasks data available</p>
            )}
          </CardContent>
        </Card>
      </div>
   
      <Card>
        <CardHeader>
          <CardTitle>Project Progress</CardTitle>
          <CardDescription>Overall project status and deadline information</CardDescription>
        </CardHeader>
        <CardContent>
          {projectStats && (
            <>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Progress: {projectStats.progress}%</span>
                  <span className="text-sm text-muted-foreground">
                    Deadline: {new Date(projectStats.deadline).toLocaleDateString()}
                  </span>
                </div>
                <Progress value={projectStats.progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-700">Completed</span>
                  </div>
                  <p className="text-2xl font-bold">{projectStats.completedTasks}</p>
                </div>
                
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium text-yellow-700">Pending</span>
                  </div>
                  <p className="text-2xl font-bold">{projectStats.pendingTasks}</p>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-medium text-blue-700">In Progress</span>
                  </div>
                  <p className="text-2xl font-bold">{projectStats.inProgressTasks}</p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-purple-700">Total Tasks</span>
                  </div>
                  <p className="text-2xl font-bold">{projectStats.totalTasks}</p>
                </div>
              </div>
            </>
          )}
          
          <Tabs defaultValue="team">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="team">Team Performance</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>
            
            <TabsContent value="team" className="mt-0">
              {projectStats && (
                <div className="space-y-6">
                  {projectStats.teammateStats.map((member, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-3">
                        <User className="w-5 h-5 text-gray-500" />
                        <span className="font-medium">{member.username}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Completed</p>
                          <p className="font-medium">{member.completed}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Pending</p>
                          <p className="font-medium">{member.pending}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">In Progress</p>
                          <p className="font-medium">{member.inProgress}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Avg. Time (days)</p>
                          <p className="font-medium">{member.averageTime?.toFixed(1) || 'N/A'}</p>
                        </div>
                      </div>
                      {fetchfeedbacks.filter(fb => fb.username === member.username).length > 0 && (
  <div className="mb-3 space-y-2">
    <p className="text-sm font-medium text-gray-700">Previous Feedback:</p>
    {fetchfeedbacks
      .filter(fb => fb.username === member.username)
      .map((feedback, idx) => (
        <div key={idx} className="p-3 bg-blue-50 rounded-md text-sm">
          
          <p className="text-gray-800">
        {feedback?.feedback?.content || "No content available"}
      </p>
      <p className="text-xs text-gray-500 mt-1">
        {feedback?.feedback?.createdAt ? 
          new Date(feedback.feedback.createdAt).toLocaleDateString() : 
          "Date not available"}
      </p>
        </div>
      ))
    }
  </div>
)}
                 
                      <div className="mt-4 border-t pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">Performance Feedback</span>
                          </div>
                          <div className="flex gap-2">
                          <Button
  variant="outline"
  size="sm"
  onClick={() => generateAIFeedback(member)}
  disabled={generatingFeedback[member.username]}
  className="relative overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 hover:from-purple-500 hover:to-blue-600 text-white shadow-md hover:shadow-lg transition-all duration-300 border-none"
>
  {generatingFeedback[member.username] ? (
    <>
      <Loader2 className="w-4 h-4 mr-1 animate-spin" />
      Generating...
    </>
  ) : (
    <>
      <span className="relative z-10">Generate AI Review</span>
      <span className="absolute inset-0 bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400 opacity-0 hover:opacity-20 transition-opacity duration-300"></span>
    </>
  )}
</Button>
                            <Button 
                              size="sm"
                              onClick={() => sendFeedback(member.username)}
                              disabled={!feedbacks[member.username]}
                            >
                              Send Feedback
                            </Button>
                          </div>
                        </div>
                        <Textarea
                          placeholder="Enter feedback for this team member or generate AI review..."
                          className="min-h-24"
                          value={feedbacks[member.username] || ''}
                          onChange={(e) => handleFeedbackChange(member.username, e.target.value)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="timeline" className="mt-0">
              <div className="space-y-4">
                {lineChartData.length > 0 ? (
                  lineChartData.map((task, index) => (
                    <div key={index} className="flex items-center p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{task.taskName}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <User className="w-3 h-3 mr-1" />
                          <span>{task.username}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{task.timeTaken} days</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(task.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center py-8">No timeline data available</p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}