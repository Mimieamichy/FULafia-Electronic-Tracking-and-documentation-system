// src/provost/ProvostActivityLog.tsx
import React, { useEffect, useState, useCallback } from "react";
import {
  Clock,
  UserCheck,
  Calendar,
  FileText,
  MessageSquareText,
  RefreshCw,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/pages/AuthProvider";
import { useToast } from "@/hooks/use-toast";

type ActivityType =
  | "STAGE_APPROVAL"
  | "DEFENSE_SCHEDULED"
  | "SUPERVISOR_ASSIGNED"
  | "FILE_UPLOADED"
  | "COMMENT_ADDED"
  | string; // allow unknown/custom types

type ActivityLog = {
  id: string;
  type: ActivityType;
  actor: string;
  target: string;
  description: string;
  timestamp: string; // ISO
};

const typeIcons: Record<string, JSX.Element> = {
  STAGE_APPROVAL: <UserCheck className="w-5 h-5 text-amber-700" />,
  DEFENSE_SCHEDULED: <Calendar className="w-5 h-5 text-blue-600" />,
  SUPERVISOR_ASSIGNED: <UserCheck className="w-5 h-5 text-green-600" />,
  FILE_UPLOADED: <FileText className="w-5 h-5 text-purple-600" />,
  COMMENT_ADDED: <MessageSquareText className="w-5 h-5 text-gray-600" />,
};

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const ProvostActivityLog: React.FC = () => {
  const { token, user } = useAuth();
  const { toast } = useToast();

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);

  // defensive mapper: convert various backend shapes into ActivityLog
  const mapRawToLog = useCallback((raw: any): ActivityLog => {
    const id = String(
      raw.id ?? raw._id ?? raw.logId ?? Math.random().toString(36).slice(2)
    );
    // type may be under `type`, `event`, `action`
    const type = (
      raw.type ??
      raw.eventType ??
      raw.action ??
      "UNKNOWN"
    ).toString();
    // actor name may be under actorName, actor, user.name etc.
    const actor =
      raw.actorName ??
      (raw.actor && typeof raw.actor === "string" ? raw.actor : undefined) ??
      (raw.actor && raw.actor.name) ??
      (raw.user && (raw.user.firstName || raw.user.lastName)
        ? `${raw.user.firstName ?? ""} ${raw.user.lastName ?? ""}`.trim()
        : undefined) ??
      raw.by ??
      "Unknown";
  
      
    const target =
      raw.targetName ??
      raw.target ??
      (raw.subject && (raw.subject.name ?? raw.subject.title)) ??
      raw.entity ??
      "";
    const description =
      raw.description ?? raw.message ?? raw.note ?? raw.details ?? "";
    const timestamp =
      raw.timestamp ?? raw.createdAt ?? raw.date ?? new Date().toISOString();

    return {
      id,
      type,
      actor: String(actor),
      target: String(target),
      description: String(description),
      timestamp: String(timestamp),
    };
  }, []);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${baseUrl}/user/activity-logs`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Failed to load activity logs (${res.status}) ${text}`);
      }

      const payload = await res.json().catch(() => null);
      console.log("loadLogs payload:", payload);

      // payload may be an array, or { data: [...] }, or { logs: [...] }
      let arr: any[] = [];
      if (Array.isArray(payload)) arr = payload;
      else if (Array.isArray(payload?.data)) arr = payload.data;
      else if (Array.isArray(payload?.logs)) arr = payload.logs;
      else if (Array.isArray(payload?.activity)) arr = payload.activity;
      else if (typeof payload === "object") {
        // maybe the object itself is a single log
        arr = Object.values(payload).filter(
          (v) => v && typeof v === "object" && (v.id || v._id || v.type)
        );
        // fallback: if couldn't collect, treat payload as single
        if (arr.length === 0) arr = [payload];
      }

      const mapped = arr.map(mapRawToLog).sort((a, b) => {
        // newest first
        const ta = Date.parse(a.timestamp) || 0;
        const tb = Date.parse(b.timestamp) || 0;
        return tb - ta;
      });

      setLogs(mapped);
    } catch (err: any) {
      console.error("loadLogs error:", err);
      toast({
        title: "Error loading activity log",
        description: err?.message ?? "See console for details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [mapRawToLog, token, toast]);

  useEffect(() => {
    void loadLogs();
  }, [loadLogs]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            School-wide Activity Log
          </h2>
          <p className="text-gray-600 text-sm mt-1">
            Real-time overview of academic and administrative activity across
            all faculties.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => void loadLogs()}
            title="Refresh"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border hover:bg-amber-50"
            disabled={loading}
          >
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm text-gray-600">
              {loading ? "Refreshing..." : "Refresh"}
            </span>
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <p className="text-center text-gray-400 py-10 italic">
          {loading ? "Loading activity…" : "No activity logged yet."}
        </p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden divide-y divide-gray-100">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-4 p-4 hover:bg-amber-50 transition"
            >
              <div className="mt-1">
                {typeIcons[log.type] ?? (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
              </div>

              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <span className="font-medium text-amber-800">
                    {log.actor}
                  </span>{" "}
                  
                  performed an action{" "}
                  <span className="font-medium">{log.target}</span>
                </p>

                {log.description ? (
                  <p className="text-sm text-gray-600 mt-1">
                    {log.description}
                  </p>
                ) : null}

                <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                  <Clock className="w-4 h-4" />
                  {formatDistanceToNow(new Date(log.timestamp), {
                    addSuffix: true,
                  })}
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
