
import { useState } from "react";
import { Menu, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProjectCard from "@/components/ProjectCard";
import AddProjectModal from "@/components/AddProjectModal";
import { Link } from "react-router-dom";

export interface Project {
  id: string;
  title: string;
  status: "REJECTED" | "ONGOING" | "COMPLETED";
}

const Index = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: "1",
      title: "MOBILE BASED INFORMATION SYSTEM FOR VEGETABLE FARMING",
      status: "REJECTED"
    },
    {
      id: "2", 
      title: "DESIGN OF COMPUTERIZED CHILD CARE INFORMATION SYSTEM",
      status: "REJECTED"
    },
    {
      id: "3",
      title: "WEB BASED CIVIL SERVICE PERFORMANCE EVALUATION SYSTEM", 
      status: "ONGOING"
    }
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleAddProject = (title: string, document: File | null) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: title.toUpperCase(),
      status: "ONGOING"
    };
    setProjects([...projects, newProject]);
    console.log("Added project:", title, "Document:", document?.name);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <Menu className="w-6 h-6 text-gray-600" />
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Tue April 2024</span>
          <Link to="/signin">
            <Power className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              topicNumber={index + 1}
              title={project.title}
              status={project.status}
            />
          ))}
        </div>

        {/* Add Project Button */}
        <div className="flex justify-end">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-3 text-lg font-medium"
          >
            Add Project
          </Button>
        </div>
      </main>

      <AddProjectModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddProject}
      />
    </div>
  );
};

export default Index;
