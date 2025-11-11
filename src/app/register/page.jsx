"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Register() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleGoogleLogin = async () => {
    await signIn("google", {
      callbackUrl: "/dashboard",
    });
  };

  const handlegithub = async () => {
    await signIn("github", {
      callbackUrl: "/dashboard",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!form.username || !form.email || !form.password){
      return toast.error("All field are required");
    }else if(form.password.length<5 || form.password.length>20){
      return toast.error("Password must be between 1 to 20 characters");
    }else if(form.username.length<3 || form.username.length>15){
      return toast.error("Username must be between 3 to 15 characters");
    }
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if(!res.ok){
      toast.error(res.message || "Error occurred")
    }

    const loggedAndSignedIn = await signIn("credentials", {
      username: form.username,
      password: form.password,
      redirect: false,
    });

    if (!loggedAndSignedIn.error && res.status === 201) {
      return router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#f8f9fa] via-[#e9ecef] to-[#dee2e6] p-6 md:p-10 relative overflow-hidden">
     
      <div className="absolute w-72 h-72 bg-black/5 rounded-full top-10 left-10 blur-3xl animate-pulse" />
      <div className="absolute w-80 h-80 bg-black/10 rounded-full bottom-20 right-10 blur-2xl animate-pulse" />

      <div className="z-10 flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">Welcome..</CardTitle>
              <CardDescription>
                Signup with your GitHub or Google account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid gap-6">
                  <div className="flex flex-col gap-4">
                    <Button
  variant="outline"
  className="w-full h-11"
  type="button"
  onClick={handlegithub}
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className="h-5 w-5"
  >
    <path
      d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"
      fill="#181717"
    />
  </svg>
Login with Github
</Button>

<Button
  variant="outline"
  className="w-full h-11"
  onClick={handleGoogleLogin}
  type="button"
>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 48 48"
    className="h-5 w-5"
  >
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.63 1.22 9.1 3.6l6.77-6.77C35.44 2.89 30.14.5 24 .5 14.82.5 7.05 5.88 3.38 13.43l7.9 6.13C12.91 13.52 17.98 9.5 24 9.5z"
    />
    <path
      fill="#34A853"
      d="M46.5 24.5c0-1.57-.14-3.08-.41-4.5H24v9h12.7c-.54 2.83-2.13 5.22-4.52 6.83l7.05 5.46C43.63 37.22 46.5 31.31 46.5 24.5z"
    />
    <path
      fill="#4A90E2"
      d="M24 46.5c6.14 0 11.29-2.03 15.06-5.52l-7.05-5.46c-2.06 1.39-4.67 2.21-8.01 2.21-6.02 0-11.09-4.02-12.72-9.46l-7.9 6.13C7.05 42.12 14.82 46.5 24 46.5z"
    />
    <path
      fill="#FBBC05"
      d="M11.28 28.77A13.48 13.48 0 0110.5 24c0-1.66.29-3.27.78-4.77l-7.9-6.13A23.81 23.81 0 00.5 24c0 3.77.89 7.34 2.38 10.9l8.4-6.13z"
    />
  </svg>
  Login with Google
</Button>

                  </div>
                  <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username</Label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="john_123"
                        onChange={(e) =>
                          setForm({ ...form, username: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Enter strong password"
                        onChange={(e) =>
                          setForm({ ...form, password: e.target.value })
                        }
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full">
                     Signup
                    </Button>
                  </div>
                  <div className="text-center text-sm">
                    Already have an account?{" "}
                    <a href="/login" className="underline underline-offset-4">
                      Log in
                    </a>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
            By clicking continue, you agree to our{" "}
            <a href="#">Terms of Service</a> and{" "}
            <a href="#">Privacy Policy</a>.
          </div>
        </div>
      </div>
    </div>
  );
}




