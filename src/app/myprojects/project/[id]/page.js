"use client";

import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const ProjectDetailsPage = () => {
  const { id } = useParams(); 
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchProjectInfo = async () => {
      try {
        const res = await fetch(`/api/myprojects/project/${id}`); 
        const data = await res.json();

        if (res.ok) {
          setProject(data.project);
          console.log(data.project);
        }
      } catch (error) {
        console.error("Failed to fetch project:", error);
      }
    };

    if (id) fetchProjectInfo();
  }, [id]);

  if (!project) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">{project.title}</h1>
      <p className="mb-2">{project.description}</p>
      <p className="text-sm text-gray-600">
        Deadline: {new Date(project.deadline).toLocaleDateString()}
      </p>
      <p className="text-sm text-gray-600">Progress: {project.progress}%</p>
    </div>
  );
};

export default ProjectDetailsPage;
