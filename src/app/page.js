"use client"

import { useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Users, BarChart3, ArrowRight, Calendar, Bell, Zap, Star, ChevronRight } from "lucide-react"

export default function Home() {
  const { data: session } = useSession()
  const [isHovering, setIsHovering] = useState(false)

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-50 z-0" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat opacity-[0.015] z-0" />

        <div className="container relative z-10 mx-auto px-4 py-24 md:py-32 flex flex-col items-center text-center">
          <div className="inline-block mb-6 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            Streamline your workflow
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-4 text-slate-900">
            Welcome to <span className="text-primary">WorkManager</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mb-8">
            Simplify your workflow, organize tasks, and boost your productivity with our intuitive task management
            platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mx-auto">
            {session ? (
              <>
                <Button
                  size="lg"
                  className="w-full relative group"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                  onClick={() => (window.location.href = "/dashboard")}
                >
                  Go to Dashboard
                  <ArrowRight
                    className={`ml-2 h-4 w-4 transition-transform duration-300 ${isHovering ? "translate-x-1" : ""}`}
                  />
                </Button>
                <Button variant="outline" size="lg" className="w-full" onClick={() => signOut()}>
                  Logout
                </Button>
              </>
            ) : 
            (
              <>
                <Button size="lg" className="w-full" onClick={() => signIn()}>
                  Login
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={() => (window.location.href = "/register")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to stay organized</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools you need to manage your tasks efficiently and collaborate with your
              team.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={<CheckCircle2 className="h-6 w-6 text-primary" />}
              title="Task Tracking"
              description="Keep track of all your tasks in one place with deadlines, priorities, and status updates."
            />
            <FeatureCard
              icon={<Users className="h-6 w-6 text-primary" />}
              title="Team Collaboration"
              description="Work together seamlessly with your team using real-time updates and shared workspaces."
            />
            <FeatureCard
              icon={<BarChart3 className="h-6 w-6 text-primary" />}
              title="Progress Reports"
              description="Visualize your productivity with intuitive charts and detailed analytics."
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-6">
            <FeatureCard
              icon={<Calendar className="h-6 w-6 text-primary" />}
              title="Calendar Integration"
              description="Sync your tasks with your calendar to never miss an important deadline."
            />
            <FeatureCard
              icon={<Bell className="h-6 w-6 text-primary" />}
              title="Smart Notifications"
              description="Get timely reminders about upcoming deadlines and important updates."
            />
            <FeatureCard
              icon={<Zap className="h-6 w-6 text-primary" />}
              title="Quick Actions"
              description="Perform common actions with just a few clicks to save time and stay focused."
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it. Here's what professionals like you think about WorkManager.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <TestimonialCard
              quote="WorkManager changed the way I work – everything is smooth and organized now. I can focus on what matters most."
              author="Vikas Singh"
              role="Product Manager"
              rating={5}
            />
            <TestimonialCard
              quote="I love the dashboard! It's super clean, easy to use, and helps me stay on top of all my projects effortlessly."
              author="Rudra Yadav"
              role="UX Designer"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl bg-primary/5 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Ready to boost your productivity?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of professionals who use WorkManager to organize their work and achieve more every day.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Button size="lg" onClick={() => (window.location.href = "/dashboard")}>
                Go to Dashboard
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={() => signIn()}>
                  Get Started for Free
                </Button>
                <Button variant="outline" size="lg" onClick={() => (window.location.href = "/about")}>
                  Learn More
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-4">
        <div className="container mx-auto">
        
          <div className="mt-8 pt-8 border-t text-center md:text-left text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} WorkManager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="mb-2">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  )
}

function TestimonialCard({ quote, author, role, rating }) {
  return (
    <Card className="h-full transition-all hover:shadow-md">
      <CardContent className="pt-6">
        <div className="flex mb-4">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
          ))}
        </div>
        <p className="italic text-muted-foreground mb-6">"{quote}"</p>
        <div className="flex items-center">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
            {author.charAt(0)}
          </div>
          <div className="ml-3">
            <p className="font-medium">{author}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
