"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Search, User, UserPlus, Clock, Check, ArrowLeft, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SearchUserPage() {
  const { data: session, status } = useSession()
  const [username, setUsername] = useState("")
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [sendreq, setSendreq] = useState([])
  const [alreadyconnected, setAlreadyconnected] = useState([])
  const router = useRouter()

  if (status === "loading") {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 pb-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Not Logged In</h2>
            <p className="text-muted-foreground mb-6">Please log in to search for users</p>
            <Button onClick={() => router.push("/login")}>Go to Login</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const handleSearch = async () => {
    if (!username) return
    setLoading(true)
    setError("")
    setUsers([])
    try {
      const res = await fetch(`/api/searchuser/${username}`)
      const data = await res.json()
      console.log(data)
      if (!res.ok) throw new Error(data.message || "Something went wrong")

      const filteredUsers = data.result.filter((u) => u._id !== session.user.id)
      const already = data.result.filter((u) => u.isConnected === true).map((u) => u._id)

      setUsers(filteredUsers)
      setAlreadyconnected(already)
    } catch (err) {
      console.log(err)
      setError(err.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleRequest = async (userId) => {
    try {
      const res = await fetch(`/api/searchuser/${username}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentUserId: session?.user?.id,
          targetUserId: userId,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        alert(data.message || "Request sent successfully")
        setSendreq((prev) => [...prev, userId])
      }
    } catch (error) {
      setError(error.message)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <h1 className="text-3xl font-bold tracking-tight mb-2">Find Your Buddy</h1>
          <p className="text-muted-foreground">Search for users to connect and collaborate with</p>
        </div>

        <Card className="border shadow-sm mb-8">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="Enter exact username to find"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {loading &&
          [1, 2].map((i) => (
            <Card key={i} className="border shadow-sm mb-4">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardContent>
            </Card>
          ))}

        {!loading && users.length > 0 && (
          <div className="space-y-4 animate-fadeIn">
            {users.map((user) => (
              <Card key={user._id} className="border shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                          {user.username?.charAt(0).toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h2 className="text-lg font-medium">{user.name}</h2>
                        <p className="text-sm text-muted-foreground">@{user.username}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>

                    {alreadyconnected.includes(user._id) ? (
                      <Button variant="outline" disabled className="w-full sm:w-auto">
                        <Check className="mr-2 h-4 w-4 text-green-500" />
                        Connected
                      </Button>
                    ) : sendreq.includes(user._id) ? (
                      <Button variant="outline" disabled className="w-full sm:w-auto">
                        <Clock className="mr-2 h-4 w-4" />
                        Request Sent
                      </Button>
                    ) : (
                      <Button onClick={() => handleRequest(user._id)} className="w-full sm:w-auto">
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Connection
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && users.length === 0 && !error && (
          <div className="flex flex-col items-center justify-center text-center py-12 bg-muted/30 rounded-lg border border-dashed">
            <div className="rounded-full bg-muted p-3 mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-1">Search for users</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Enter a username to find people to connect and collaborate with
            </p>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          0% {
            opacity: 0;
            transform: translateY(10px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
