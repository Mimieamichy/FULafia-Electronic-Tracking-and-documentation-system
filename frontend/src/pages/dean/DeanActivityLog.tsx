// src/dean/DeanActivityLog.tsx
import React, { useEffect, useState } from "react";
import { Clock, UserCheck, Calendar, FileText } from "lucide-react";

type Activity = {
  id: string;
  type: "stage-approval" | "defense-scheduled" | "supervisor-assigned" | "upload" | "comment";
  actor: string;
  target: string;
  time: string;
  department: string;
  description: string;
};

// 🧪 Mock fetch function (filtering for Dean's faculty)
const fetchFacultyActivityLogs = async (): Promise<Activity[]> => {
  return new Promise((res) =>
    setTimeout(
      () =>
        res([
          {
            id: "1",
            type: "stage-approval",
            actor: "Dr. Johnson",
            target: "Sarah Paul (220976888)",
            time: "2025-07-03T09:30:00Z",
            department: "Computer Science",
            description: "Approved advancement to Second Seminar.",
          },
          {
            id: "2",
            type: "defense-scheduled",
            actor: "HOD - Engr. Musa",
            target: "Michael Lee (220976812)",
            time: "2025-07-02T15:00:00Z",
            department: "Electrical Engineering",
            description: "Scheduled Third Seminar for July 5, 2025.",
          },
          {
            id: "3",
            type: "supervisor-assigned",
            actor: "PGC - Dr. Ifeoma",
            target: "Grace Obi (220976799)",
            time: "2025-07-01T11:00:00Z",
            department: "Mechanical Engineering",
            description: "Assigned Dr. Akpan as 1st Supervisor.",
          },
          {
            id: "4",
            type: "upload",
            actor: "Student - Chidera Benson",
            target: "First Seminar Submission",
            time: "2025-06-30T17:45:00Z",
            department: "Computer Science",
            description: "Uploaded seminar document.",
          },
        ]),
      300
    )
  );
};

const activityIcons = {
  "stage-approval": <UserCheck className="w-5 h-5 text-amber-700" />,
  "defense-scheduled": <Calendar className="w-5 h-5 text-blue-600" />,
  "supervisor-assigned": <UserCheck className="w-5 h-5 text-green-600" />,
  "upload": <FileText className="w-5 h-5 text-purple-600" />,
  "comment": <FileText className="w-5 h-5 text-gray-600" />,
};

export default function DeanActivityLog() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacultyActivityLogs().then((data) => {
      setActivities(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Faculty Activity Log</h2>
        <p className="text-gray-600 text-sm mt-1">
          Real-time overview of academic events within your faculty.
        </p>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading activity logs...</p>
      ) : activities.length === 0 ? (
        <p className="text-center text-gray-400 py-10 italic">
          No activities recorded yet.
        </p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden divide-y divide-gray-100">
          {activities.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-amber-50 transition">
              <div className="mt-1">{activityIcons[log.type]}</div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <span className="font-medium text-amber-800">{log.actor}</span>{" "}
                  performed <span className="font-medium">{log.type.replace(/-/g, " ")}</span> on{" "}
                  <span className="font-medium">{log.target}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">{log.description}</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Clock className="w-4 h-4" />
                  {new Date(log.time).toLocaleString()}
                  <span className="ml-3">• {log.department}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
