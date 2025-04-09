"use client";
import React from "react";
import { useSession, signOut } from "next-auth/react";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return <div>You are not signed in</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Welcome to WorkManager Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card title="Total Tasks" value="24" color="bg-blue-500" />
          <Card title="Completed" value="18" color="bg-green-500" />
          <Card title="Pending" value="6" color="bg-yellow-500" />
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <ActionButton text="Add Task" color="bg-indigo-600" />
            <ActionButton text="View All Tasks" color="bg-gray-800" />
            <button
              className="bg-red-800 text-white px-6 py-2 rounded-lg font-medium shadow hover:opacity-90"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className={`rounded-xl shadow-md text-white p-6 ${color}`}>
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}

function ActionButton({ text, color }) {
  return (
    <button className={`px-6 py-2 text-white rounded-lg font-medium shadow ${color} hover:opacity-90`}>
      {text}
    </button>
  );
}
