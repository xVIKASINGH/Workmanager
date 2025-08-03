"use client"
import { useState, useEffect, Fragment } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Dialog, Transition } from "@headlessui/react"
import { Calendar } from "@/components/ui/calendar"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import {
  CalendarIcon,
  CheckCheck,
  Trash,
  PlusCircle,
  ClipboardList,
  LogOut,
  User,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  Users,
  Boxes,
  Menu,
  X,
  Sparkles,
  Send
} from "lucide-react"
import { MessageCircleMoreIcon } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

export default function Dashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [task, setTask] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState(null)
  const [completedTasks, setCompletedTasks] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [progress, setProgress] = useState(13)
  const [loadingTasks, setLoadingTasks] = useState(false)
  const [isAssistantOpen, setIsAssistantOpen] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [chatInput, setChatInput] = useState("")
  const [chatHistory, setChatHistory] = useState([])
  const [isLoadingResponse, setIsLoadingResponse] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setProgress(66), 500)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (session) {
      showalltask()
    }
  }, [session])

  useEffect(() => {
    if (allTasks.length > 0) {
      const filtered = allTasks.filter((task) => task.completion === true)
      setCompletedTasks(filtered)
    }
  }, [allTasks])

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-[60%] max-w-md">
          <Progress value={progress} className="h-2" />
        </div>
      </div>
    )
  }

  if (!session) {
    router.push("/login")
    return null
  }

  const handleAddTask = () => setIsOpen(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await fetch("/api/addtask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: task,
        description,
        deadline,
      }),
    })

    const data = await res.json()
    if (res.ok) {
      setIsOpen(false)
      setTask("")
      setDescription("")
      setDeadline(null)
      showalltask()
      toast.success("Task added successfully!")
    } else {
      toast.error("All fields are required")
    }
  }
  
  const showassistant = () => {
    console.log("AI Assistant Opened")
    setIsAssistantOpen(true)
  }
  
  const closeassistant = () => {
    setIsAssistantOpen(false)
    // Reset chat state when closing
    setChatHistory([])
    setSelectedTaskId(null)
    setChatInput("")
  }

  const showalltask = async () => {
    setLoadingTasks(true)
    try {
      const res = await fetch("/api/showtask")
      if (!res.ok) throw new Error("Failed to fetch tasks")
      const data = await res.json()
      setAllTasks(data)
    } catch (error) {
      console.error("Error while fetching tasks:", error)
      toast.error("Failed to fetch tasks")
    } finally {
      setLoadingTasks(false)
    }
  }

  const updateCompletion = async (id) => {
    setLoadingTasks(true)
    try {
      const res = await fetch(`/api/updatetask/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      })

      await res.json()
      showalltask()
      toast.success("Task updated successfully!")
    } catch (error) {
      toast.error("Server error try again later.")
      console.error("Error in PUT request", error)
    } finally {
      setLoadingTasks(false)
    }
  }

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/deletetask/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      })

      await res.json()
      setAllTasks((prev) => prev.filter((item) => item._id !== id))
      setCompletedTasks((prev) => prev.filter((item) => item._id !== id))
      toast.success("Task deleted successfully!")
    } catch (error) {
      console.log("Error while deleting task, please wait...")
      toast.error("Failed to delete task")
    }
  }

  // AI Assistant Functions
  const callAIAPI = async (message, taskContext = null) => {
    try {
      // Replace this with your actual AI API endpoint and key
      const API_KEY = "YOUR_API_KEY_HERE" // Change this to your actual API key
      const API_ENDPOINT = "https://api.openai.com/v1/chat/completions" // Change this to your AI service endpoint
      
      let systemPrompt = "You are a helpful task management assistant. Help users with their tasks, provide suggestions for productivity, and answer questions about task management."
      
      if (taskContext) {
        systemPrompt += ` The user is asking about this specific task: Title: "${taskContext.title}", Description: "${taskContext.description}", Due Date: ${taskContext.deadline ? new Date(taskContext.deadline).toLocaleDateString() : "Not set"}, Status: ${taskContext.completion ? "Completed" : "Pending"}.`
      }

      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo", // Change this to your preferred model
          messages: [
            {
              role: "system",
              content: systemPrompt
            },
            {
              role: "user",
              content: message
            }
          ],
          max_tokens: 500,
          temperature: 0.7
        })
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data = await response.json()
      return data.choices[0].message.content

    } catch (error) {
      console.error('AI API Error:', error)
      throw error
    }
  }

  const pendingTasks = allTasks.filter((task) => !task.completion)
  const selectedTask = pendingTasks.find((t) => t._id === selectedTaskId) || null

  const handleSend = async () => {
    if (!chatInput.trim() || isLoadingResponse) return
    
    const message = chatInput.trim()
    setChatInput("")
    
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      from: "user",
      text: message,
      timestamp: new Date()
    }
    
    setChatHistory(prev => [...prev, userMessage])
    setIsLoadingResponse(true)

    try {
      const aiResponse = await callAIAPI(message, selectedTask)
      
      // Add AI response to chat
      const assistantMessage = {
        id: Date.now() + 1,
        from: "assistant",
        text: aiResponse,
        timestamp: new Date()
      }
      
      setChatHistory(prev => [...prev, assistantMessage])
      
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        from: "assistant",
        text: "Sorry, I'm having trouble connecting to the AI service. Please try again later.",
        timestamp: new Date(),
        isError: true
      }
      
      setChatHistory(prev => [...prev, errorMessage])
      toast.error("Failed to get AI response")
    } finally {
      setIsLoadingResponse(false)
    }
  }

  const sidebarItems = [
    {
      label: "Create Group Project",
      icon: Users,
      onClick: () => router.push("/project"),
      variant: "ghost"
    },
    {
      label: "Group Projects",
      icon: Boxes,
      onClick: () => router.push("/myprojects"),
      variant: "ghost"
    },
    {
      label: "Profile",
      icon: User,
      onClick: () => router.push("/userprofile"),
      variant: "ghost"
    },
    {
      label: "Search Users",
      icon: Search,
      onClick: () => router.push("/searchuser"),
      variant: "ghost"
    },
    {
     label:"Messages",
     icon: MessageCircleMoreIcon,
     onClick: () => router.push("/socket-test"),
     variant: "ghost",
    },
    {
      label:"Live Board(Sketch Pad)",
      icon: ClipboardList,
      onClick: () => router.push("/whiteboard"),
      variant: "ghost",
    },
    {
      label:"AI Assistant",
      icon: Sparkles,
      onClick: () => showassistant(),
      variant: 'ghost',
    },
    {
      label: "Log Out",
      icon: LogOut,
      onClick: () => signOut({ callbackUrl: "/" }),
      variant: "ghost",
      className: "text-red-600 hover:text-red-700 hover:bg-red-50 mt-auto"
    }
  ]

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 shadow-sm transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <ClipboardList className="h-5 w-5 text-white" />
              </div>
              <span className="font-semibold text-lg">WorkManager</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{session?.user?.username || "User"}</p>
                <p className="text-xs text-muted-foreground">Welcome back</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <div className="space-y-2">
              {sidebarItems.map((item, index) => (
                <Button
                  key={index}
                  variant={item.variant}
                  className={cn(
                    "w-full justify-start h-10 px-3 font-normal",
                    item.className
                  )}
                  onClick={() => {
                    item.onClick()
                    setIsSidebarOpen(false)
                  }}
                >
                  <item.icon className="h-4 w-4 mr-3" />
                  {item.label}
                </Button>
              ))}
            </div>
          </nav>
        </div>
      </aside>

      {/* AI Assistant Sheet */}
      <Sheet open={isAssistantOpen} onOpenChange={setIsAssistantOpen}>
        <SheetContent className="flex flex-col h-full w-[600px] sm:w-[540px] p-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              AI Task Assistant
            </SheetTitle>
            <SheetDescription>
              Get help with your tasks, productivity tips, and task management advice. Select a task for context-aware assistance.
            </SheetDescription>
          </SheetHeader>

          {/* Task Selection */}
          <div className="border-b pb-4">
            <p className="font-medium mb-2 text-sm">Select a task for context (optional):</p>
            <div className="max-h-32 overflow-y-auto space-y-1 py-2">
              <Button
                variant={selectedTaskId === null ? "default" : "outline"}
                size="sm"
                className="w-full justify-start text-left h-auto p-2 py-6"
                onClick={() => setSelectedTaskId(null)}
              >
                General assistance (no specific task)
              </Button>
              {pendingTasks.map((task) => (
                <Button
                  key={task._id}
                  variant={selectedTaskId === task._id ? "default" : "outline"}
                  size="sm"
                  className="w-full justify-start text-left h-auto p-2"
                  onClick={() => setSelectedTaskId(task._id)}
                >
                  <div className="truncate">
                    <div className="font-medium truncate">{task.title}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      Due: {task.deadline ? new Date(task.deadline).toLocaleDateString() : "No deadline"}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 py-4">
            {chatHistory.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation with your AI assistant!</p>
                <p className="text-sm mt-2">
                  {selectedTask ? `Context: ${selectedTask.title}` : "Ask anything about task management"}
                </p>
              </div>
            ) : (
              chatHistory.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.from === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-3 py-2",
                      message.from === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.isError
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            )}
            {isLoadingResponse && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg px-3 py-2 max-w-[80%]">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <span className="text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t pt-4">
            {selectedTask && (
              <div className="mb-2 p-2 bg-blue-50 rounded-md">
                <p className="text-xs text-blue-600 font-medium">
                  Context: {selectedTask.title}
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                placeholder={selectedTask ? `Ask about "${selectedTask.title}"...` : "Ask your assistant anything..."}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                disabled={isLoadingResponse}
              />
              <Button 
                onClick={handleSend} 
                disabled={!chatInput.trim() || isLoadingResponse}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        <div className="container mx-auto p-4 md:p-6">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Dashboard</h1>
            <div className="w-10" />
          </div>

          {/* Desktop Header */}
          <header className="hidden lg:block mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
              <p className="text-muted-foreground mt-1">Manage your tasks and projects</p>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <ClipboardList className="h-5 w-5 text-primary mr-2" />
                  <span className="text-2xl font-bold">{allTasks.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-2xl font-bold">{completedTasks.length || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="text-2xl font-bold">{allTasks.length - completedTasks.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 mb-8">
            <Button onClick={handleAddTask}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Task
            </Button>
            <Button variant="secondary" onClick={showalltask}>
              <ClipboardList className="h-4 w-4 mr-2" />
              Refresh Tasks
            </Button>
          </div>

          {/* Tasks Tabs */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Tasks</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              {loadingTasks ? (
                <div className="w-full flex justify-center py-8">
                  <Progress value={66} className="w-[60%] max-w-md" />
                </div>
              ) : allTasks.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No tasks found. Add a new task to get started.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allTasks.map((task) => (
                    <TaskCard key={task._id} task={task} onComplete={updateCompletion} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {pendingTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-4" />
                  <p className="text-muted-foreground">All tasks completed! Great job!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pendingTasks.map((task) => (
                    <TaskCard key={task._id} task={task} onComplete={updateCompletion} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedTasks.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No completed tasks yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedTasks.map((task) => (
                    <TaskCard key={task._id} task={task} onComplete={updateCompletion} onDelete={handleDelete} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Add Task Modal */}
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
            <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
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
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-background p-6 shadow-xl transition-all">
                  <Dialog.Title className="text-xl font-semibold mb-4">Add a New Task</Dialog.Title>
                  <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="title" className="text-sm font-medium block mb-1">
                          Task Title
                        </label>
                        <Input
                          id="title"
                          placeholder="Enter task title"
                          value={task}
                          onChange={(e) => setTask(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="description" className="text-sm font-medium block mb-1">
                          Description
                        </label>
                        <Textarea
                          id="description"
                          placeholder="Enter description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                          className="min-h-[100px]"
                        />
                      </div>

                      <div>
                        <label htmlFor="deadline" className="text-sm font-medium block mb-1">
                          Deadline
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              id="deadline"
                              variant="outline"
                              className={cn("w-full justify-start text-left", !deadline && "text-muted-foreground")}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {deadline ? format(deadline, "PPP") : <span>Select a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar mode="single" selected={deadline} onSelect={setDeadline} initialFocus />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Add Task</Button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  )
}

function TaskCard({ task, onComplete, onDelete }) {
  const isCompleted = task.completion === true
  const deadlineDate = new Date(task.deadline)
  const isPastDue = !isCompleted && deadlineDate < new Date()

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isCompleted ? "bg-green-50 border-green-200" : isPastDue ? "bg-red-50 border-red-200" : "",
      )}
    >
      <CardHeader className="pb-2">
        <CardTitle
          className={cn(
            "text-lg font-medium line-clamp-1",
            isCompleted && "text-green-700",
            isPastDue && "text-red-700",
          )}
        >
          {task.title}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

        <div className="flex items-center gap-2 text-xs">
          <CalendarIcon className="h-3.5 w-3.5" />
          <span className={cn(isPastDue && "text-red-600 font-medium")}>{format(deadlineDate, "PPP")}</span>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex justify-between">
        <Badge variant={isCompleted ? "success" : isPastDue ? "destructive" : "outline"}>
          {isCompleted ? "Completed" : isPastDue ? "Past Due" : "Pending"}
        </Badge>

        <div className="flex gap-2">
          {!isCompleted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onComplete(task._id)}
              className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-100"
            >
              <CheckCheck className="h-4 w-4" />
              <span className="sr-only">Mark as complete</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task._id)}
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-100"
          >
            <Trash className="h-4 w-4" />
            <span className="sr-only">Delete task</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}