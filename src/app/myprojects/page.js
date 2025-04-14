"use client"
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import React, { useEffect, useState } from 'react'

function Page() {
  const { data: session, status } = useSession();
  const [myprojects, setMyProjects] = useState([]);
  const [ownedProjects, setOwnedProjects] = useState([]);
  const [teamProjects, setTeamProjects] = useState([]);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/project/myprojects", { method: "GET" });
      const data = await res.json();
      setMyProjects(data.projects || []);

      const owned = data.projects.filter(
        (project) => project.creator.toString() === session.user.id
      );

      const team = data.projects.filter(
        (project) =>
          project.creator.toString() !== session.user.id &&
          project.teammates.some((tm) => tm.userId === session.user.id)
      );

      setOwnedProjects(owned);
      setTeamProjects(team);
    } catch (error) {
      console.error("error while fetching", error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetchProjects();
    }
  }, [session]);

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6 md:px-16 lg:px-24">
      <h1 className="text-4xl font-bold mb-8">My Projects</h1>

   
      <section className="mb-12">
  <h2 className="text-2xl font-semibold mb-4">Projects You Own</h2>
  {ownedProjects.length > 0 ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {ownedProjects.map((project) => (
        <Link key={project._id} href={`/myprojects/project/${project._id}`}>
          <div className="bg-white shadow-md rounded-lg p-4 border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
            <h3 className="text-xl font-semibold mb-1">{project.title}</h3>
            <p className="text-sm text-gray-600 mb-2">
              {project.description}
            </p>
            <p className="text-xs text-gray-500">
              Deadline: {new Date(project.deadline).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-500">Progress: {project.progress}%</p>
          </div>
        </Link>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-500">You don’t own any projects yet.</p>
  )}
</section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Projects You're a Team Member In</h2>
        {teamProjects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white shadow-md rounded-lg p-4 border border-gray-200"
              >
                <h3 className="text-xl font-semibold mb-1">{project.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  {project.description}
                </p>
                <p className="text-xs text-gray-500">
                  Deadline: {new Date(project.deadline).toLocaleDateString()}
                </p>
                <p className="text-xs text-gray-500">Progress: {project.progress}%</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">You’re not a team member in any projects yet.</p>
        )}
      </section>
    </div>
  );
}

export default Page;
