'use client'
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    const res = await signIn("credentials", {
      username: form.username,
      password: form.password,
      redirect: false,
    });

    if (!res.error) router.push("/dashboard");
    else {
      alert("Login failed");
      console.log(res.error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-md space-y-6"
      >
        <h2 className="text-3xl font-bold text-gray-800 text-center">Login to WorkManager</h2>
        <input
          type="text"
          placeholder="Username"
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
        />

        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full px-5 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
        />

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white py-3 rounded-full font-semibold shadow hover:opacity-90 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
