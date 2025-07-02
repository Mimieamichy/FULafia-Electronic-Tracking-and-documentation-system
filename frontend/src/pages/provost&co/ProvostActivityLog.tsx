import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";

// Sample activity types
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

// Dummy mock logs — replace with API in production
const mockLogs: ActivityLog[] = [
  {
    id: "1",
    type: "STAGE_APPROVAL",
    actor: "Dr. Moses",
    role: "HOD",
    target: "Alice Johnson",
    description: "Approved for Second Seminar",
    timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1hr ago
  },
  {
    id: "2",
    type: "SUPERVISOR_ASSIGNED",
    actor: "PGC Florence",
    role: "PG Coordinator",
    target: "Bob Smith",
    description: "Assigned Dr. Henry as Supervisor 1",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2hrs ago
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

const activityTypeLabel = {
  STAGE_APPROVAL: "Stage Approval",
  DEFENSE_SCHEDULED: "Defense Scheduled",
  SUPERVISOR_ASSIGNED: "Supervisor Assignment",
  FILE_UPLOADED: "File Uploaded",
  COMMENT_ADDED: "Comment Added",
};

const ProvostActivityLog = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  useEffect(() => {
    // In real app, replace this with an API call
    setLogs(mockLogs);
  }, []);

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800">School Activity Log</h2>

      <ScrollArea className="h-[70vh] pr-4">
        <div className="space-y-4">
          {logs.map((log) => (
            <Card key={log.id} className="p-4 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="text-sm font-medium text-gray-900">
                  {log.actor} <span className="text-gray-500 text-xs">({log.role})</span>
                </div>
                <Badge variant="outline">{activityTypeLabel[log.type]}</Badge>
              </div>
              <p className="text-sm text-gray-700">{log.description}</p>
              <p className="text-xs text-gray-500 mt-1">
                {formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}
              </p>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ProvostActivityLog;
