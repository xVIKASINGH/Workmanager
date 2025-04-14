"use client"

import { useState ,useEffect} from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, FileText, Plus, Trash2, Upload, Users, X } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function CreateProjectPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [deadline, setDeadline] = useState("")
  const [files, setFiles] = useState(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("details")
  const [teamMembers, setTeamMembers] = useState([])
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [allcollaborators,setallcollaborators]=useState([]);

  const collaborators=async()=>{
    try {
      const res=await fetch("/api/project/collaborators",{
        method:"GET"
      })
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Backend error:", errorText);
        toast.error("Failed to fetch collaborators");
        return;
      }
      const data=await res.json();
      console.log("Collaborators fetched:", data.collaborators);
      if(res.ok){
        const uniqueCollaborators = Array.from(
          new Map(data.collaborators.map(user => [user._id, user])).values()
        );
        
    setallcollaborators(uniqueCollaborators)
      }else{
        toast.message(data.message || "failed to fetch clloaboratos")
      }
    } catch (error) {
      console.log("here is error",error)
      toast.error("Erorr while fetching your collaborators")
    }

  }
  useEffect(() => {
    collaborators();
  }, []);


  const addTeamMember = (user) => {
    if (!user) return;
  
    const alreadyAdded = teamMembers.some(
      (member) => member.email === user.email
    );
  
    if (alreadyAdded) {
      toast.error("User already added");
      return;
    }
  
    setTeamMembers([...teamMembers, user]);
    setNewMemberEmail("");
  };

  const removeTeamMember = (userId) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== userId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title || !description || !deadline ) {
      toast.error("Please fill out all required fields")
      return
    }
    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("deadline", deadline)
      formData.append("teamMembers", JSON.stringify(teamMembers))

      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append("attachments", files[i])
        }
      }

      const res = await fetch("/api/project/create", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()
      if (res.ok) {
        toast.success("Project created successfully")
        router.push("/dashboard")
      } else {
        toast.error(data.message || "Failed to create project")
      }
    } catch (err) {
      toast.error("Something went wrong")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getFileNames = () => {
    if (!files) return []
    return Array.from(files).map((file) => file.name)
  }

  return (
    <div className="container max-w-6xl py-12 ml-45">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Project</h1>
          <p className="text-muted-foreground mt-1">Set up your project details and add team members</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 ">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Project Information</CardTitle>
                <CardDescription>Enter the basic details about your new project</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="details" className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Details</span>
                    </TabsTrigger>
                    <TabsTrigger value="team" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      <span>Team</span>
                    </TabsTrigger>
                    <TabsTrigger value="files" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      <span>Files</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title" className="text-base">
                          Project Title
                        </Label>
                        <Input
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="Enter project title"
                          className="mt-1.5"
                        />
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-base">
                          Project Description
                        </Label>
                        <Textarea
                          id="description"
                          rows={5}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe the project goals, scope, and deliverables"
                          className="mt-1.5 resize-none"
                        />
                      </div>

                      <div>
                        <Label htmlFor="deadline" className="text-base">
                          Deadline
                        </Label>
                        <div className="relative mt-1.5">
                          <Input
                            type="date"
                            id="deadline"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            className="pl-10"
                          />
                          <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="team" className="space-y-4">
                    <div>
                      <Label className="text-base">Team Members</Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add team members who will be working on this project
                      </p>

                      <div className="flex gap-2 mb-4">
                        <Input
                          placeholder="Enter email address"
                          value={newMemberEmail}
                          onChange={(e) => setNewMemberEmail(e.target.value)}
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={()=>{
                            const user=allcollaborators.find(
                              (u)=>u.email===newMemberEmail
                            )
                            if(!user){
                           toast.error("user not found in collaboratos")
                           return;
                            }
                           addTeamMember(user)
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" /> Add
                        </Button>
                      </div>

                      {teamMembers.length > 0 && (
                        <ScrollArea className="h-[180px] border rounded-md p-3 mb-4">
                          <div className="space-y-3">
                            {teamMembers.map((member) => (
                              <div
                                key={member._id}
                                className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback>{member.username.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <p className="text-sm font-medium">{member.name}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {member.role}
                                  </Badge>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeTeamMember(member.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}

                      <div>
                        <p className="text-sm font-medium mb-2">Suggested</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {allcollaborators.map((user) => (
                            <div
                              key={user._id}
                              className="flex items-center justify-between border rounded-md p-2 hover:bg-muted/50 cursor-pointer"
                              onClick={() => addTeamMember(user)}
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-7 w-7">
                                  <AvatarFallback>{user.username.charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{user.name}</p>
                                  <p className="text-xs text-muted-foreground">{user.email}</p>
                                </div>
                              </div>
                              <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="files" className="space-y-4">
                    <div>
                      <Label htmlFor="files" className="text-base">
                        Upload Attachments
                      </Label>
                      <p className="text-sm text-muted-foreground mb-3">
                        Add relevant files, documents, or resources for this project
                      </p>

                      <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors cursor-pointer">
                        <Input
                          type="file"
                          id="files"
                          multiple
                          className="hidden"
                          onChange={(e) => setFiles(e.target.files)}
                        />
                        <Label htmlFor="files" className="cursor-pointer">
                          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                          <p className="text-sm font-medium">Drag files here or click to browse</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Support for documents, images, and other project files
                          </p>
                        </Label>
                      </div>

                      {files && files.length > 0 && (
                        <div className="mt-4">
                          <p className="text-sm font-medium mb-2">Selected Files ({files.length})</p>
                          <ScrollArea className="h-[120px] border rounded-md p-2">
                            <div className="space-y-2">
                              {getFileNames().map((name, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between bg-muted/50 p-2 rounded-md"
                                >
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <span className="text-sm truncate max-w-[250px]">{name}</span>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={() => {
                                      // This is a mock implementation since we can't directly modify a FileList
                                      // In a real app, you'd need to create a new FileList or use a different approach
                                      setFiles(null)
                                    }}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Project Summary</CardTitle>
                <CardDescription>Review your project details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Title</h3>
                    <p className="mt-1">{title || "Not specified"}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Deadline</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p>
                        {deadline
                          ? new Date(deadline).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : "Not specified"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Team</h3>
                    <div className="mt-1">
                      {teamMembers.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {teamMembers.slice(0, 3).map((member) => (
                            <Avatar key={member.id} className="h-7 w-7 border-2 border-background">
                              <AvatarFallback className="text-xs">{member.username.charAt(0)}</AvatarFallback>
                            </Avatar>
                          ))}
                          {teamMembers.length > 3 && (
                            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted text-xs font-medium">
                              +{teamMembers.length - 3}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No team members added</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Attachments</h3>
                    <p className="text-sm mt-1">
                      {files && files.length > 0
                        ? `${files.length} file${files.length > 1 ? "s" : ""} selected`
                        : "No files attached"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="mt-6">
              <Button type="submit" disabled={loading} className="w-full" size="lg">
                {loading ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
