"use client"

import { useSession } from 'next-auth/react'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { CalendarIcon, BarChart3, Users, Plus, FolderOpen } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'

import { useRouter } from 'next/navigation'
function ProjectsPage() {
  const { data: session, status } = useSession()
  const [myProjects, setMyProjects] = useState([])
  const [ownedProjects, setOwnedProjects] = useState([])
  const [teamProjects, setTeamProjects] = useState([])
  const [isLoading, setIsLoading] = useState(true)
const router=useRouter();
  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/project/myprojects", { method: "GET" })
      const data = await res.json()
      
      const projects = data.projects || []
      setMyProjects(projects)
      
      const owned = projects.filter(
        (project) => project.creator.toString() === session.user.id
      )
      
      const team = projects.filter(
        (project) =>
          project.creator.toString() !== session.user.id &&
          project.teammates.some((tm) => tm.userId === session.user.id)
      )
      
      setOwnedProjects(owned)
      setTeamProjects(team)
      setIsLoading(false)
    } catch (error) {
      console.error("Error while fetching projects", error)
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects()
    }
  }, [session])

  
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }


  const getStatusBadge = (progress) => {
    if (progress < 25) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Planning</Badge>
    } else if (progress < 75) {
      return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">In Progress</Badge>
    } else if (progress < 100) {
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Final Stages</Badge>
    } else {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Completed</Badge>
    }
  }


  const ProjectCard = ({ project, type }) => {
    const href = type === 'owned' 
      ? `/myprojects/project/${project._id}` 
      : `/teamproject/${project._id}`
    
    return (
      <Link href={href} className="block h-full">
        <Card className="h-full transition-all hover:shadow-lg hover:border-primary/20 cursor-pointer overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                {project.title}
              </CardTitle>
              {getStatusBadge(project.progress)}
            </div>
            <CardDescription className="line-clamp-2 h-10">
              {project.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Progress</span>
                  <span>{project.progress.toFixed(0)}%</span>
                </div>
                <Progress value={project.progress.toFixed(1)} className="h-2" />
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground">
                <CalendarIcon className="mr-1 h-3 w-3" />
                <span>Due {formatDate(project.deadline)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pt-1 border-t bg-muted/30">
            <div className="flex justify-between items-center w-full text-xs text-muted-foreground">
              <div className="flex items-center">
                <Users className="h-3 w-3 mr-1" />
                <span>{project.teammates?.length || 0} members</span>
              </div>
              {type === 'owned' ? (
                <Badge variant="secondary" className="text-xs font-normal">Owner</Badge>
              ) : (
                <Badge variant="outline" className="text-xs font-normal">Member</Badge>
              )}
            </div>
          </CardFooter>
        </Card>
      </Link>
    )
  }

 
  const ProjectCardSkeleton = () => (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-10 w-full mt-2" />
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between mb-1">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-8" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <Skeleton className="h-4 w-1/2" />
        </div>
      </CardContent>
      <CardFooter className="pt-1 border-t">
        <Skeleton className="h-4 w-full" />
      </CardFooter>
    </Card>
  )

  const EmptyState = ({ type }) => (
    <Card className="p-12 flex flex-col items-center justify-center text-center">
      <FolderOpen className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No {type} projects yet</h3>
      <p className="text-sm text-muted-foreground mb-6">
        {type === 'owned' 
          ? "Create your first project to get started tracking your work"
          : "You're not part of any team projects yet"}
      </p>
      {type === 'owned' && (
        <Button onClick={()=>router.push("/project")}>
          <Plus className="h-4 w-4 mr-2" />
          Create Project
        </Button>
      )}
    </Card>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 py-10 px-6 md:px-16 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Projects Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your projects</p>
        </header>

        <div className="mb-6 flex justify-between items-center">
          <div className="flex space-x-4">
            <div className="bg-white/50 dark:bg-black/20 border rounded-lg px-4 py-2">
              <div className="text-xs text-muted-foreground">Total Projects</div>
              <div className="text-2xl font-semibold">{myProjects.length}</div>
            </div>
            <div className="bg-white/50 dark:bg-black/20 border rounded-lg px-4 py-2">
              <div className="text-xs text-muted-foreground">Projects Owned</div>
              <div className="text-2xl font-semibold">{ownedProjects.length}</div>
            </div>
            <div className="bg-white/50 dark:bg-black/20 border rounded-lg px-4 py-2">
              <div className="text-xs text-muted-foreground">Team Member In</div>
              <div className="text-2xl font-semibold">{teamProjects.length}</div>
            </div>
          </div>
        
        </div>

        <Tabs defaultValue="owned" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="owned" className="flex gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Projects You Own</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex gap-2">
              <Users className="h-4 w-4" />
              <span>Team Projects</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="owned" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </div>
            ) : ownedProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {ownedProjects.map((project) => (
                  <ProjectCard key={project._id} project={project} type="owned" />
                ))}
              </div>
            ) : (
              <EmptyState type="owned" />
            )}
          </TabsContent>

          <TabsContent value="team" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <ProjectCardSkeleton key={i} />
                ))}
              </div>
            ) : teamProjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamProjects.map((project) => (
                  <ProjectCard key={project._id} project={project} type="team" />
                ))}
              </div>
            ) : (
              <EmptyState type="team" />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default ProjectsPage