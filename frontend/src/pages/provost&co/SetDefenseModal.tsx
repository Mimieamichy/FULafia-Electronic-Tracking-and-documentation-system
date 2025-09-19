// src/pgc/SetDefenseModal.tsx
import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Lecturer {
  _id: string;
  fullName?: string;
  staffId?: string;
  user?: { firstName?: string; lastName?: string; email?: string };
  email?: string;
}

interface SetDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defenseStage: string;
  lecturers?: Lecturer[]; // optional preloaded lecturers
  schedulerRole?: "hod" | "provost" | "pgcord"; // default "hod"
  studentIds: string[]; // required: students to schedule
  program: string;
  session: string;
  baseUrl: string;
  token?: string | null;
  onScheduled?: (resp: any) => void;
}

const SetDefenseModal: React.FC<SetDefenseModalProps> = ({
  isOpen,
  onClose,
  defenseStage,
  lecturers: initialLecturers,
  schedulerRole = "hod",
  studentIds,
  program,
  session,
  baseUrl,
  token,
  onScheduled,
}) => {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [panel, setPanel] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [lecturers, setLecturers] = useState<Lecturer[]>(
    initialLecturers ?? []
  );
  const [loadingLecturers, setLoadingLecturers] = useState(false);

  const lecturerEndpoint =
    schedulerRole === "provost"
      ? `${baseUrl}/lecturer/get-external-examiner`
      : `${baseUrl}/lecturer/get-faculty-rep`;

  const fetchLecturers = useCallback(async () => {
    if (initialLecturers && initialLecturers.length > 0) {
      setLecturers(initialLecturers);
      return;
    }

    setLoadingLecturers(true);
    console.groupCollapsed(
      `[SetDefenseModal] GET lecturers -> ${lecturerEndpoint}`
    );
    try {
      const res = await fetch(lecturerEndpoint, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const text = await res.text();
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }
      console.log("Raw response:", parsed);

      const payload = parsed?.data ?? parsed;
      if (Array.isArray(payload)) {
        setLecturers(payload);
      } else if (Array.isArray(payload?.lecturers)) {
        setLecturers(payload.lecturers);
      } else {
        const maybeArray = Object.values(parsed || {}).find((v: any) =>
          Array.isArray(v)
        );
        if (Array.isArray(maybeArray)) setLecturers(maybeArray as Lecturer[]);
        else {
          console.warn(
            "[SetDefenseModal] unexpected lecturers payload:",
            parsed
          );
          setLecturers([]);
        }
      }
    } catch (err) {
      console.error("[SetDefenseModal] fetchLecturers error:", err);
      setLecturers([]);
      toast({
        title: "Failed to load panel members",
        description: "Could not fetch lecturers. Check your network or auth.",
        variant: "destructive",
      });
    } finally {
      console.groupEnd();
      setLoadingLecturers(false);
    }
  }, [initialLecturers, lecturerEndpoint, token, toast]);

  useEffect(() => {
    if (!isOpen) return;
    fetchLecturers();
    setPanel([]); // reset panel selection on open
  }, [isOpen, fetchLecturers]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!date || !time || panel.length === 0) {
      toast({
        title: "Missing fields",
        description:
          "Please provide date, time and select at least one panel member.",
        variant: "destructive",
      });
      return;
    }

    // normalize program to backend-expected values
    const programNormalized =
      typeof program === "string" ? program.trim().toUpperCase() : program;

    // if you want to be extra safe, map common client values:
    const programForApi =
      programNormalized === "MSC" || programNormalized === "PHD"
        ? programNormalized
        : programNormalized === "MSc".toUpperCase() // defensive - unnecessary but explicit
        ? "MSC"
        : programNormalized === "PhD".toUpperCase()
        ? "PHD"
        : programNormalized;

    // optional client-side validation (prevents round-trip if wrong)
    if (!["MSC", "PHD"].includes(programForApi)) {
      toast({
        title: "Invalid program",
        description: `Program must be MSC or PHD (got "${String(program)}").`,
        variant: "destructive",
      });
      return;
    }

    const payload = {
      stage: defenseStage,
      session,
      date,
      time,
      studentIds,
      panelMemberIds: panel,
      program: programForApi, // <<< send normalized value
    };

    console.groupCollapsed("[SetDefenseModal] POST /defence/schedule");
    console.log("payload:", payload);

    setSaving(true);
    try {
      const res = await fetch(`${baseUrl}/defence/schedule`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }

      if (!res.ok) {
        const msg =
          (parsed && (parsed.message || parsed.error)) ??
          `Server ${res.status}`;
        throw new Error(msg);
      }

      toast({
        title: "Defense scheduled",
        description: "Defense saved successfully.",
        variant: "default",
      });

      console.groupEnd();
      onScheduled?.(parsed);
      onClose();
    } catch (err: any) {
      console.groupEnd();
      console.error("[SetDefenseModal] schedule error:", err);
      toast({
        title: "Save failed",
        description: err?.message ?? "An error occurred while saving.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
          Schedule {defenseStage}
        </h2>

        <div className="mb-4">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full"
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full"
          />
        </div>

        <div className="mb-4">
          <Label>Panel Members</Label>

          {loadingLecturers ? (
            <p className="text-sm text-gray-500 mt-2">Loading panel members…</p>
          ) : Array.isArray(lecturers) && lecturers.length === 0 ? (
            <p className="text-sm text-gray-500 mt-2">
              No lecturers found for this role/department
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
              {lecturers.map((lec) => {
                const displayName =
                  lec.fullName ||
                  `${lec.user?.firstName ?? ""} ${
                    lec.user?.lastName ?? ""
                  }`.trim() ||
                  lec.staffId ||
                  lec._id;

                return (
                  <label
                    key={lec._id}
                    className="flex items-center gap-2 text-sm text-gray-700"
                  >
                    <Checkbox
                      checked={panel.includes(lec._id)}
                      onCheckedChange={(checked) => {
                        if (checked)
                          setPanel((p) => Array.from(new Set([...p, lec._id])));
                        else setPanel((p) => p.filter((id) => id !== lec._id));
                      }}
                    />
                    <span>{displayName}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="min-w-[90px]"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                await handleSave();
              } catch (err) {
                console.error("Save aborted:", err);
              }
            }}
            disabled={saving}
            className="bg-amber-700 hover:bg-amber-800 text-white min-w-[90px]"
          >
            {saving ? "Scheduling..." : "Schedule"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetDefenseModal;
