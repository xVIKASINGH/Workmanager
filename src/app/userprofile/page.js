"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { UserCheck, UserPlus, Users, Mail, AtSign, CheckCircle, XCircle, ArrowLeft, AlertCircle } from "lucide-react"

export default function UserProfilePage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [incoming, setIncoming] = useState([])
  const [outgoing, setOutgoing] = useState([])
  const [connections, setConnections] = useState([])
  const router = useRouter()

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
      return
    }

    if (status === "authenticated") {
      fetchConnections()
      fetchAcceptedConnections()
    }
  }, [status, session, router])

  const fetchConnections = async () => {
    if (!session?.user?.id) return
    setLoading(true)
    try {
      const res = await fetch(`/api/request/${session.user.id}`)
      const data = await res.json()

      const userId = session.user.id
      const inReq = data.requests.filter(
        (req) =>
          (typeof req.reciever === "object" ? req.reciever._id?.toString?.() : req.reciever) === userId &&
          req.status !== "accepted" &&
          req.status !== "rejected",
      )

      const outReq = data.requests.filter(
        (req) =>
          (typeof req.sender === "object" ? req.sender._id?.toString?.() : req.sender) === userId &&
          req.status !== "accepted" &&
          req.status !== "rejected",
      )

      setIncoming(inReq)
      setOutgoing(outReq)
    } catch (error) {
      console.error("Error fetching connections", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAcceptedConnections = async () => {
    try {
      const res = await fetch("/api/connections")
      const data = await res.json()
      if (res.ok) {
        setConnections(data.connections)
      }
    } catch (error) {
      console.error("Error fetching accepted connections:", error)
    }
  }

  const handleRequest = async (user, reqId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/acceptreq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqId }),
      })
      const data = await res.json()
      if (res.ok) {
       
        setIncoming((prev) => prev.filter((req) => req._id !== reqId))
  
        fetchAcceptedConnections()
      }
    } catch (error) {
      console.error("Error accepting request", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequest = async (reqId) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/deletereq`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reqId }),
      })
      const data = await res.json()
      if (res.ok) {
        setOutgoing((prev) => prev.filter((req) => req._id !== reqId))
      }
    } catch (error) {
      console.error("Error deleting request", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-4">
          <Skeleton className="h-12 w-3/4 mx-auto" />
          <Skeleton className="h-[120px] w-full rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-[200px] rounded-lg" />
            <Skeleton className="h-[200px] rounded-lg" />
          </div>
          <Skeleton className="h-[300px] rounded-lg" />
        </div>
      </div>
    )
  }

  if (!session) {
    router.push("/login")
    return null
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold tracking-tight mb-2">My Network</h1>
        <p className="text-muted-foreground">Manage your connections and collaboration network</p>
      </div>

      <Card className="mb-8">
        <CardHeader className="pb-3">
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Your personal information and account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <Avatar className="h-16 w-16 border">
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {session?.user?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <h2 className="text-xl font-semibold">{session?.user?.name}</h2>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  <span>{session?.user?.email}</span>
                </div>

                <div className="hidden sm:block text-muted-foreground">•</div>

                <div className="flex items-center">
                  <AtSign className="h-4 w-4 mr-1" />
                  <span>{session?.user?.username || "no_username"}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="connections" className="mb-8">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="connections">
            <Users className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Connections</span>
            <Badge variant="secondary" className="ml-2">
              {connections.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="incoming">
            <UserCheck className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Incoming</span>
            <Badge variant="secondary" className="ml-2">
              {incoming.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Outgoing</span>
            <Badge variant="secondary" className="ml-2">
              {outgoing.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>My Connections</CardTitle>
              <CardDescription>People you've connected with for collaboration</CardDescription>
            </CardHeader>
            <CardContent>
              {connections.length === 0 ? (
                <EmptyState
                  icon={<Users className="h-12 w-12 text-muted-foreground" />}
                  title="No connections yet"
                  description="Start building your network by connecting with other users"
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {connections.map((connection) => (
                    <ConnectionCard key={connection._id} user={connection} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incoming">
          <Card>
            <CardHeader>
              <CardTitle>Incoming Requests</CardTitle>
              <CardDescription>People who want to connect with you</CardDescription>
            </CardHeader>
            <CardContent>
              {incoming.length === 0 ? (
                <EmptyState
                  icon={<UserCheck className="h-12 w-12 text-muted-foreground" />}
                  title="No incoming requests"
                  description="When someone sends you a connection request, it will appear here"
                />
              ) : (
                <div className="space-y-4">
                  {incoming.map((request) => (
                    <RequestCard
                      key={request._id}
                      user={request.sender}
                      requestId={request._id}
                      type="incoming"
                      onAccept={() => handleRequest(request.sender, request._id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outgoing">
          <Card>
            <CardHeader>
              <CardTitle>Outgoing Requests</CardTitle>
              <CardDescription>People you've invited to connect</CardDescription>
            </CardHeader>
            <CardContent>
              {outgoing.length === 0 ? (
                <EmptyState
                  icon={<UserPlus className="h-12 w-12 text-muted-foreground" />}
                  title="No outgoing requests"
                  description="When you send connection requests, they will appear here"
                />
              ) : (
                <div className="space-y-4">
                  {outgoing.map((request) => (
                    <RequestCard
                      key={request._id}
                      user={request.reciever}
                      requestId={request._id}
                      type="outgoing"
                      onCancel={() => handleDeleteRequest(request._id)}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function ConnectionCard({ user }) {
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.username?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{user.username}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </CardContent>
   
    </Card>
  )
}

function RequestCard({ user, requestId, type, onAccept, onCancel }) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-primary">
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{user.username}</h3>
              <p className="text-xs text-muted-foreground">
                {type === "incoming" ? "Wants to connect with you" : "Pending acceptance"}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            {type === "incoming" ? (
              <Button size="sm" onClick={onAccept}>
                <CheckCircle className="h-4 w-4 mr-2" />
                Accept
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={onCancel}>
                <XCircle className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-12">
      <div className="rounded-full bg-muted p-3 mb-4">
        {icon || <AlertCircle className="h-6 w-6 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  )
}
