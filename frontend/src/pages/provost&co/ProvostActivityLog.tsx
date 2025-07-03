// src/provost/ProvostActivityLog.tsx
import React, { useEffect, useState } from "react";
import { Clock, UserCheck, Calendar, FileText, MessageSquareText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type ActivityType =
  | "STAGE_APPROVAL"
  | "DEFENSE_SCHEDULED"
  | "SUPERVISOR_ASSIGNED"
  | "FILE_UPLOADED"
  | "COMMENT_ADDED";

type ActivityLog = {
  id: string;
  type: ActivityType;
  actor: string;
  role: string;
  target: string;
  description: string;
  timestamp: string; // ISO
};

// 🧪 Mock data (to be replaced with actual API fetch)
const mockLogs: ActivityLog[] = [
  {
    id: "1",
    type: "STAGE_APPROVAL",
    actor: "Dr. Moses",
    role: "HOD",
    target: "Alice Johnson",
    description: "Approved for Second Seminar",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
  {
    id: "2",
    type: "SUPERVISOR_ASSIGNED",
    actor: "PGC Florence",
    role: "PG Coordinator",
    target: "Bob Smith",
    description: "Assigned Dr. Henry as Supervisor 1",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    type: "DEFENSE_SCHEDULED",
    actor: "Provost Bello",
    role: "PROVOST",
    target: "External Defense",
    description: "Scheduled External Defense for Faculty of Engineering",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    type: "FILE_UPLOADED",
    actor: "Alice Johnson",
    role: "Student",
    target: "Dr. Moses",
    description: "Uploaded Second Seminar Draft",
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    type: "COMMENT_ADDED",
    actor: "Dr. Henry",
    role: "Supervisor",
    target: "Bob Smith",
    description: "Commented on uploaded proposal draft",
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

// 👁 Icon mapping
const typeIcons: Record<ActivityType, JSX.Element> = {
  STAGE_APPROVAL: <UserCheck className="w-5 h-5 text-amber-700" />,
  DEFENSE_SCHEDULED: <Calendar className="w-5 h-5 text-blue-600" />,
  SUPERVISOR_ASSIGNED: <UserCheck className="w-5 h-5 text-green-600" />,
  FILE_UPLOADED: <FileText className="w-5 h-5 text-purple-600" />,
  COMMENT_ADDED: <MessageSquareText className="w-5 h-5 text-gray-600" />,
};

const ProvostActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    setLogs(mockLogs); // Replace with actual fetch later
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">School-wide Activity Log</h2>
        <p className="text-gray-600 text-sm mt-1">
          Real-time overview of academic and administrative activity across all faculties.
        </p>
      </div>

      {logs.length === 0 ? (
        <p className="text-center text-gray-400 py-10 italic">No activity logged yet.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden divide-y divide-gray-100">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-amber-50 transition">
              <div className="mt-1">{typeIcons[log.type]}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <span className="font-medium text-amber-800">{log.actor}</span>{" "}
                  <span className="text-xs text-gray-500">({log.role})</span> performed{" "}
                  <span className="font-medium lowercase">
                    {log.type.replace(/_/g, " ")}
                  </span>{" "}
                  on <span className="font-medium">{log.target}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProvostActivityLog;
