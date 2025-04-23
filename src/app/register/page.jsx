"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; 
import { useState } from "react";

export default function Register() {
  const router = useRouter(); 
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleGoogleLogin = async () => {
    await signIn("google", {
      callbackUrl: "/dashboard",
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message || data.error);
    
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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center">Create a WorkManager Account</h2>

        <input
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Username"
          className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
        />
        <input
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
        />
        <input
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
          className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
        />
         <button
         type="button"
        onClick={handleGoogleLogin}
        className="flex items-center gap-2 bg-white border px-4 py-2 rounded-md shadow hover:shadow-md transition"
      >
        
        <span>Sign in with Google</span>
      </button>
        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-full font-semibold shadow hover:opacity-90 transition"
        >
          Register
        </button>
      </form>
    </div>
  );
}
