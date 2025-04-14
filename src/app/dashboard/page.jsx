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
  Boxes
} from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Dashboard() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [task, setTask] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState(null)
  const [completedTasks, setCompletedTasks] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [progress, setProgress] = useState(13)
  const [loadingTasks, setLoadingTasks] = useState(false)

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
    } else {
      alert(data.message || "Failed to add task")
    }
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
    } catch (error) {
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
    } catch (error) {
      console.log("Error while deleting task, please wait...")
    }
  }

  const pendingTasks = allTasks.filter((task) => !task.completion)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-6">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">WorkManager Dashboard</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {session?.user?.name || "User"}</p>
          </div>

          <div className="flex gap-2 mt-4 md:mt-0">
          <Button variant="outline" size="sm" onClick={() => router.push("/project")}>
          <Users className="h-4 w-4 mr-2" />
             
             Create group project
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/myprojects")}>
            <Boxes className="h-4 w-4 mr-2" />
            Group projects
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/userprofile")}>
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push("/searchuser")}>
              <Search className="h-4 w-4 mr-2" />
              Search Users
            </Button>
            <Button variant="destructive" size="sm" onClick={() => signOut({ callbackUrl: "/" })}>
              <LogOut className="h-4 w-4 mr-2" />
              Log out
            </Button>
          </div>
        </header>

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
