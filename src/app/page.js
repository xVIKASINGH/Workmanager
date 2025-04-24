"use client"

import { useState } from "react"
import { useSession, signIn, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle2, 
  Users, 
  BarChart3, 
  ArrowRight, 
  Calendar, 
  Bell, 
  Zap, 
  Star, 
  ChevronRight,
  ArrowUpRight,
  Menu,
  User,
  Bot,
  File,
  MessageSquare
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Home() {
  const { data: session } = useSession()
  const [isHovering, setIsHovering] = useState(false)

  return (
    <main className="min-h-screen bg-background">

      <header className="border-b sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">WorkManager</span>
          </div>
          

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#testimonials" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Testimonials</a>
     
          </nav>

          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      Account
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => (window.location.href = "/dashboard")}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => (window.location.href = "/userprofile")}>
                      Profile
                    </DropdownMenuItem>
                   
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Button size="sm" onClick={() => (window.location.href = "/dashboard")}>
                  Dashboard
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => (window.location.href = "/register")}>
                  Login
                </Button>
                <Button size="sm" >
                  Sign Up
                </Button>
              </>
            )}
          </div>
          

          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-6 mt-8">
                <a href="#features" className="text-lg font-medium">Features</a>
                <a href="#testimonials" className="text-lg font-medium">Testimonials</a>
              
                <Separator />
                {session ? (
                  <>
                    <Button variant="default" onClick={() => (window.location.href = "/dashboard")}>
                      Dashboard
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={() => signOut()}>
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" onClick={() => signIn()}>
                      Login
                    </Button>
                    <Button onClick={() => (window.location.href = "/register")}>
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <section className="relative overflow-hidden border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-blue-50 z-0" />
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=200')] bg-repeat opacity-[0.02] z-0" />

        <div className="container relative z-10 mx-auto px-4 py-24 md:py-36 flex flex-col items-center text-center">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary font-medium">
            Streamline your workflow
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-6 text-slate-900 max-w-3xl">
            Manage work efficiently with <span className="text-primary">WorkManager</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10">
            Simplify your workflow, organize tasks, and boost productivity with our intuitive 
            task management platform designed for modern teams.
          </p>

       
          <div className="w-full max-w-md mx-auto">
            {session ? (
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
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 w-full">
                <Button size="lg" className="w-full" onClick={() => signIn()}>
                  Get Started For Free
                </Button>
               
              </div>
            )}
          </div>
          
        
        </div>
      </section>

    
      <section id="features" className="py-24 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/20 bg-primary/5 text-primary font-medium">
              Features
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Everything you need to stay organized</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools you need to manage your tasks efficiently and collaborate 
              with your team seamlessly.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
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

   <div className="grid md:grid-cols-3 gap-8 mt-8">
  <FeatureCard
    icon={<File className="h-6 w-6 text-primary" />}
    title="File Attachment System"
    description="Easily attach documents, images, and files to tasks for better collaboration and documentation."
  />
  <FeatureCard
    icon={<Bot className="h-6 w-6 text-primary" />}
    title="AI-Generated Work Progress"
    description="Get intelligent insights and analysis on your project progress powered by advanced AI."
  />
  <FeatureCard
    icon={<MessageSquare className="h-6 w-6 text-primary" />}
    title="Feedback System"
    description="Give and receive targeted feedback to team members to improve project outcomes and performance."
  />
</div>
        </div>
      </section>

      
  

     
      <section id="testimonials" className="py-24 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/20 bg-primary/5 text-primary font-medium">
              Testimonials
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Don't just take our word for it. Here's what professionals like you think about WorkManager.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
            <TestimonialCard
              quote="The team collaboration features are incredible. We've improved our productivity by 40% since switching to WorkManager."
              author="Anjali Patel"
              role="Team Lead"
              rating={5}
            />
          </div>
        </div>
      </section>

   
      <section className="py-24 px-4">
        <div className="container mx-auto max-w-5xl bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 md:p-16">
          <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
            <div className="flex-1">
              <Badge variant="outline" className="mb-4 px-3 py-1 border-primary/20 bg-primary/5 text-primary font-medium">
                Get Started Today
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Ready to boost your productivity?</h2>
              <p className="text-muted-foreground mb-8">
                Join thousands of professionals who use WorkManager to organize their work and achieve more every day.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {session ? (
                  <Button size="lg" onClick={() => (window.location.href = "/dashboard")}>
                    Go to Dashboard
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <>
                    <Button size="lg" onClick={() => signIn()}>
                      Start Now
                    </Button>
                  
                  </>
                )}
              </div>
            </div>
            <div className="flex-1 hidden md:block">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-sm"></div>
                <div className="relative  overflow-hidden border-4 border-white shadow-lg ">
                  <img 
                    src="Screenshot 2025-04-17 114817.png" 
                    alt="WorkManager App" 
                    className="w-full h-auto" 
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

     
      <footer className="border-t py-16 px-4 bg-slate-50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div>
              <h3 className="font-bold mb-4">Product</h3>
              <ul className="space-y-2">
                <li><a href="#features" className="text-sm text-muted-foreground hover:text-primary transition-colors">Features</a></li>
                <li><a href="/pricing" className="text-sm text-muted-foreground hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="/integrations" className="text-sm text-muted-foreground hover:text-primary transition-colors">Integrations</a></li>
                <li><a href="/updates" className="text-sm text-muted-foreground hover:text-primary transition-colors">Updates</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About</a></li>
                <li><a href="/blog" className="text-sm text-muted-foreground hover:text-primary transition-colors">Blog</a></li>
                <li><a href="/careers" className="text-sm text-muted-foreground hover:text-primary transition-colors">Careers</a></li>
                <li><a href="/press" className="text-sm text-muted-foreground hover:text-primary transition-colors">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="/help" className="text-sm text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">Contact Us</a></li>
                <li><a href="/status" className="text-sm text-muted-foreground hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="/privacy" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</a></li>
                <li><a href="/cookies" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>
          
          <Separator />
          
          <div className="mt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">WorkManager</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} WorkManager. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="h-full transition-all hover:shadow-md border-primary/10 hover:border-primary/20 overflow-hidden group">
      <div className="absolute h-1 bg-primary w-0 group-hover:w-full transition-all duration-300 top-0 left-0"></div>
      <CardHeader className="pb-2">
        <div className="mb-2 p-2 rounded-lg bg-primary/5 w-fit">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function TestimonialCard({ quote, author, role, rating }) {
  return (
    <Card className="h-full transition-all hover:shadow-md relative">
      <div className="absolute top-0 right-0 bg-primary/5 p-2 rounded-bl-lg">
        <div className="flex">
          {[...Array(rating)].map((_, i) => (
            <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />
          ))}
        </div>
      </div>
      
      <CardContent className="pt-10">
        <p className="italic text-muted-foreground mb-6">"{quote}"</p>
      </CardContent>
      
      <CardFooter className="border-t pt-4">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 bg-primary/10 text-primary font-medium">
            <AvatarFallback>{author.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="font-medium">{author}</p>
            <p className="text-sm text-muted-foreground">{role}</p>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}