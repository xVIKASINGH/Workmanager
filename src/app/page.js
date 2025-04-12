"use client"
import Image from "next/image";
import { useSession, signIn, signOut } from "next-auth/react";
export default function Home() {
    const { data: session } = useSession();

    return (
      <main className="bg-white text-gray-900">
        
        <section className="min-h-screen flex flex-col justify-center items-center text-center p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
          <h1 className="text-5xl font-bold mb-4">Welcome to WorkManager 🚀</h1>
          <p className="text-xl mb-6 max-w-xl">
            Simplify your workflow, organize tasks, and boost your productivity.
          </p>
  
          {session ? (
            <>
              <a
                href="/dashboard"
                className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-100 transition"
              >
                Go to Dashboard
              </a>
              <button
                onClick={() => signOut()}
                className="mt-4 bg-red-500 px-5 py-2 rounded-full hover:bg-red-600 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="space-x-4">
              <button
                onClick={() => signIn()}
                className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold hover:bg-blue-100 transition"
              >
                Login
              </button>
              <a
                href="/register"
                className="bg-gray-100 text-blue-700 px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition"
              >
                Signup
              </a>
            </div>
          )}
        </section>
  
        <section className="py-16 px-6 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Task Tracking</h3>
              <p className="text-sm">Track all your tasks in one place, from start to finish.</p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
              <p className="text-sm">Work with your team seamlessly using real-time updates.</p>
            </div>
            <div className="bg-gray-100 p-6 rounded-lg shadow-md hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-2">Progress Reports</h3>
              <p className="text-sm">Visualize your productivity with easy-to-read reports.</p>
            </div>
          </div>
        </section>

        <section className="py-16 bg-gray-50 text-center px-6">
          <h2 className="text-3xl font-bold mb-10">What Our Users Say</h2>
          <div className="max-w-3xl mx-auto space-y-8">
            <blockquote className="italic text-gray-700">
              “WorkManager changed the way I work – everything is smooth and organized now.”
              <div className="mt-2 font-semibold">— Vikas Singh</div>
            </blockquote>
            <blockquote className="italic text-gray-700">
              “I love the dashboard! It's super clean and easy to use.”
              <div className="mt-2 font-semibold">— Rudra Yadav</div>
            </blockquote>
          </div>
        </section>
  
        {/* Footer */}
        <footer className="bg-gray-900 text-white text-center p-6 mt-12">
          © {new Date().getFullYear()} WorkManager. All rights reserved.
        </footer>
      </main>
  );
}
