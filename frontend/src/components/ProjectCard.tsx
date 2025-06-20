
import { Badge } from "@/components/ui/badge";

interface ProjectCardProps {
  topicNumber: number;
  title: string;
  status: "REJECTED" | "ONGOING" | "COMPLETED";
}

const ProjectCard = ({ topicNumber, title, status }: ProjectCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case "REJECTED":
        return (
          <Badge className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 text-sm font-medium">
            REJECTED
          </Badge>
        );
      case "ONGOING":
        return (
          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 text-sm font-medium">
            ONGOING
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-green-500 hover:bg-green-600 text-white px-4 py-1 text-sm font-medium">
            COMPLETED
          </Badge>
        );
    }
  };

  return (
    <div className="bg-yellow-200 rounded-lg shadow-md overflow-hidden">
      <div className="bg-yellow-300 px-6 py-3 border-b border-yellow-400">
        <h3 className="text-lg font-semibold text-gray-800">TOPIC {topicNumber}</h3>
      </div>
      <div className="p-6">
        <p className="text-gray-800 font-medium text-base leading-relaxed mb-6">
          {title}
        </p>
        <div className="flex justify-end">
          {getStatusBadge()}
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
