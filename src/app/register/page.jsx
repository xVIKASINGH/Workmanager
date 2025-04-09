"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation"; 
import { useState } from "react";

export default function Register() {
  const router = useRouter(); 
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(form),
    });

    const data = await res.json();
    alert(data.message || data.error);
      const loggedandsign= await signIn("credentials", {
          username: form.username,
          password: form.password,
          redirect: false,
        });
        if(!loggedandsign.error && res.status===201){
            return router.push("/dashboard")
        }
   

  };

  return (
    <div className="flex justify-center items-center text-2xl flex-col">
      <form onSubmit={handleSubmit} className="flex flex-col mt-40 p-10">
        <input
          onChange={(e) => setForm({ ...form, username: e.target.value })}
          placeholder="Username"
          className="p-10 border rounded-full mb-2"
        />
        <input
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="Email"
          className="p-10 border rounded-full mb-2"
        />
        <input
          type="password"
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          placeholder="Password"
          className="p-10 border rounded-full mb-2"
        />
        <button className="bg-white text-black items-center border rounded-full">
          Register
        </button>
      </form>
    </div>
  );
}
