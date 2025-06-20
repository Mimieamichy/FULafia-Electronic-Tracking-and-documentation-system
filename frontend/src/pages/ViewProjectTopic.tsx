import { useState } from "react";
import AssignSupervisorModal from "./AssignSupervisorModal";

interface ProjectTopic {
  id: string;
  matNo: string;
  fullName: string;
  projectTitle: string;
  supervisor1: string;
  supervisor2: string;
}

const ViewProjectTopic = () => {
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Replace with real data or fetch logic
  const [data, setData] = useState<ProjectTopic[]>([
    {
      id: "1",
      matNo: "220976762",
      fullName: "Camilla Park",
      projectTitle: "Secure Online Auction System",
      supervisor1: "Not Assigned",
      supervisor2: "Not Assigned",
    },
    // ...more entries
  ]);

  const openAssignModal = (topicId: string) => {
    setSelectedTopicId(topicId);
    setAssignModalOpen(true);
  };

  const handleAssign = (info: any) => {
    // info.topicId, info.firstName, lastName, supervisorType, etc.
    const fullName = `${info.firstName} ${info.lastName}`;
    setData(prev =>
      prev.map(d =>
        d.id === info.topicId
          ? {
              ...d,
              [info.supervisorType]: fullName,
            }
          : d
      )
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Project Topics</h2>
      </div>
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 text-left">Mat. No</th>
            <th className="p-3 text-left">Full Name</th>
            <th className="p-3 text-left">Project Title</th>
            <th className="p-3 text-left">1st Supervisor</th>
            <th className="p-3 text-left">2nd Supervisor</th>
            <th className="p-3 text-left">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={item.id} className={`${idx % 2 === 0 ? "bg-amber-50" : ""}`}>
              <td className="p-3">{item.matNo}</td>
              <td className="p-3">{item.fullName}</td>
              <td className="p-3">{item.projectTitle}</td>
              <td className="p-3">{item.supervisor1}</td>
              <td className="p-3">{item.supervisor2}</td>
              <td className="p-3">
                <button
                  onClick={() => openAssignModal(item.id)}
                  className="bg-amber-700 text-white px-4 py-1 rounded hover:bg-amber-800"
                >
                  Assign
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <AssignSupervisorModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        onSubmit={handleAssign}
        topicId={selectedTopicId}
      />
    </div>
  );
};

export default ViewProjectTopic;
