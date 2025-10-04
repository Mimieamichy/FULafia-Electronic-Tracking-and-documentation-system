// DefenseDayPage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import ScoreSheetPanel from "./ScoreSheetDefense";
import StudentsPanel from "./StudentsPanel";
import AssessmentPanel from "./AssessmentPanel";
import StudentCommentModal from "./StudentCommentModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import { useToast } from "@/hooks/use-toast";


type Level = "MSC" | "PHD";

interface Criterion {
  title: string;
  percentage: number;
}

interface Student {
  id: string;
  name: string;
  matNo: string;
  topic: string;
  fileUrl: string;
  currentStage: string;
  comments: { by: string; text: string }[];
  scores: Record<string, number | null>;
  approved?: boolean;
}

interface DefenseDay {
  id: string;
  title: string;
  date: string; // ISO string
  durationMinutes: number;
  level: Level;
  sessionActive?: boolean;
  students: Student[];
  currentStage: string;
  criteria?: Criterion[];
}

const baseUrl = import.meta.env.VITE_BACKEND_URL ?? "";

export default function DefenseDayPage() {
  const { user, token, roles } = useAuth();
  const { toast } = useToast();
  const userName = user?.userName;

  // state for the confirm dialog
  const [confirmingSession, setConfirmingSession] = useState<{
    defenseId: string;
    action: "start" | "end";
    title?: string;
  } | null>(null);
  const [confirmProcessing, setConfirmProcessing] = useState(false);

  const rolesArray: string[] = (() => {
    if (!roles) return [];
    if (Array.isArray(roles)) return roles.map((r) => String(r).toLowerCase());
    if (typeof roles === "string") {
      // handle comma-separated string as well
      return roles
        .split?.(",")
        .map((r) => r.trim())
        .filter(Boolean)
        .map((r) => r.toLowerCase());
    }
    return [];
  })();

  const [rolesLoaded, setRolesLoaded] = useState<boolean>(
    () => roles !== undefined
  );
  useEffect(() => {
    if (roles !== undefined) setRolesLoaded(true);
  }, [roles]);

  // Use memoized checks from normalized roles
  const PANEL_KEYWORDS = [
    "panel_member",
    "internal_examiner",
    "supervisor",
    "major_supervisor",
    "provost",
  ];

  const isPanel = React.useMemo(() => {
    if (!rolesLoaded) return false;
    return rolesArray.some((r) =>
      PANEL_KEYWORDS.some((k) => r === k || r.startsWith(k) || r.includes(k))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolesLoaded, rolesArray.join("|")]);
  console.log("isPanel:", isPanel);
  console.log("rolesArray:", rolesArray);

  const isHodOrProvost = React.useMemo(() => {
    if (!rolesLoaded) return false;
    return rolesArray.some(
      (r) =>
        r === "hod" ||
        r === "provost" ||
        r.includes("hod") ||
        r.includes("provost") ||
        r.startsWith("hod") ||
        r.startsWith("provost")
    );
  }, [rolesLoaded, rolesArray.join("|")]);

  // --- hooks (always declared, never conditional) ---
  const [defenseCache, setDefenseCache] = useState<Record<Level, DefenseDay[]>>(
    {
      MSC: [],
      PHD: [],
    }
  );
  const [defenseDays, setDefenseDays] = useState<DefenseDay[]>([]);
  const [activeDefenseIdx, setActiveDefenseIdx] = useState(0);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [level, setLevel] = useState<Level>("MSC"); // controls which level to fetch
  const [activeTab, setActiveTab] = useState<
    "students" | "scores" | "assessment"
  >("students");
  const [selectedStudent, setSelectedStudent] = useState<{
    student: Student;
    defenseId: string;
  } | null>(null);
  const [now, setNow] = useState(Date.now());
  const [toggling, setToggling] = useState(false);
  // add near other hooks at top of the component
  const [submittingScores, setSubmittingScores] = useState(false);
  // add near other useState hooks
  const [processingIds, setProcessingIds] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // ------- helpers to map API shapes to our UI model -------
  const mapRawStudent = (s: any, fallbackStage = ""): Student => {
    const sid = s?.id ?? s?._id ?? s?.studentId ?? s?.matricId ?? "s_unknown";
    const name =
      s?.name ??
      (s?.user
        ? `${s.user.firstName ?? ""} ${s.user.lastName ?? ""}`.trim()
        : "") ??
      s?.fullName ??
      "";
    const matNo = s?.matricNo ?? s?.matNo ?? s?.registration ?? s?.regNo ?? "";
    const topic =
      s?.projectTopic ?? s?.topic ?? s?.title ?? s?.researchTopic ?? "";
    const fileUrl = s?.latestFile ?? s?.fileUrl ?? s?.file ?? "";
    const currentStageStudent =
      s?.currentStage ?? s?.stage ?? s?.status ?? fallbackStage ?? "";
    const comments = Array.isArray(s?.comments) ? s.comments : [];
    const scores = s?.scores ?? s?.stageScores ?? {};
    const approved = Boolean(s?.approved ?? s?.isApproved ?? false);
    return {
      id: String(sid),
      name: String(name),
      matNo: String(matNo),
      topic: String(topic),
      fileUrl: String(fileUrl),
      currentStage: String(currentStageStudent),
      comments,
      scores,
      approved,
    };
  };

  const mapDefenseFromDefenceObj = (def: any, extraData?: any): DefenseDay => {
    const id = def?._id ?? def?.id ?? "unknown";
    const title = def?.title ?? def?.name ?? def?.label ?? `Defense ${id}`;
    const date =
      def?.date ??
      def?.dateTime ??
      def?.startTime ??
      def?.start ??
      def?.scheduledAt ??
      new Date().toISOString();
    const durationMinutes =
      Number(
        def?.durationMinutes ??
          def?.duration ??
          def?.length ??
          def?.minutes ??
          0
      ) || 120;
    const levelRaw = (def?.program ??
      def?.level ??
      def?.levelName ??
      "MSC") as string;
    const levelMapped: Level = String(levelRaw).toUpperCase().includes("PHD")
      ? "PHD"
      : "MSC";
    const sessionActive = Boolean(
      def?.started ??
        def?.sessionActive ??
        def?.active ??
        def?.isActive ??
        false
    );
    const currentStage =
      def?.stage ?? def?.currentStage ?? def?.defenseStage ?? "";

    // students: try def.students first, then extraData.students
    const rawStudents = Array.isArray(def?.students)
      ? def.students
      : Array.isArray(extraData?.students)
      ? extraData.students
      : [];
    const students = (rawStudents as any[]).map((s) =>
      mapRawStudent(s, currentStage)
    );

    // criteria: from extraData.criteria or extraData.data.criteria or def.criteria
    const rawCriteria =
      extraData?.criteria ??
      extraData?.data?.criteria ??
      def?.criteria ??
      extraData?.criteria?.criteria ??
      null;

    const criteriaMapped: Criterion[] = Array.isArray(rawCriteria)
      ? rawCriteria.map((c: any) => ({
          title: String(c?.name ?? c?.title ?? ""),
          percentage: Number(c?.weight ?? c?.percentage ?? 0),
        }))
      : Array.isArray(extraData?.criteria?.criteria)
      ? extraData.criteria.criteria.map((c: any) => ({
          title: String(c?.name ?? c?.title ?? ""),
          percentage: Number(c?.weight ?? c?.percentage ?? 0),
        }))
      : [];

    return {
      id: String(id),
      title: String(title),
      date: String(date),
      durationMinutes: Number(durationMinutes),
      level: levelMapped,
      sessionActive: Boolean(sessionActive),
      students,
      currentStage: String(currentStage),
      criteria: criteriaMapped.length ? criteriaMapped : undefined,
    };
  };

  useEffect(() => {
    let cancelled = false;

    // show cached immediately if present (so switching levels doesn't blank UI)
    setDefenseDays(defenseCache[level] ?? []);
    setActiveDefenseIdx(0);
    // set criteria from first cached if exists
    if (
      (defenseCache[level] ?? []).length > 0 &&
      (defenseCache[level] ?? [])[0].criteria
    ) {
      setCriteria((defenseCache[level] ?? [])[0].criteria ?? []);
    } else {
      setCriteria([]); // clear criteria while fetching
    }

    const fetchIdsAndDetails = async () => {
      try {
        const recentUrl = `${baseUrl}/defence/panel-member/${encodeURIComponent(
          level
        )}`;
        
        const resRecent = await fetch(recentUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        const textRecent = await resRecent.text();
       

        

        let parsedRecent: any = null;
        try {
          parsedRecent = textRecent ? JSON.parse(textRecent) : null;
        } catch {
          parsedRecent = textRecent;
        }
       

        if (cancelled) return;

        // robust extraction of ids:
        let ids: string[] = [];
        if (!parsedRecent) {
          ids = [];
        } else if (Array.isArray(parsedRecent)) {
          if (
            parsedRecent.every(
              (it) => typeof it === "string" || typeof it === "number"
            )
          ) {
            ids = parsedRecent.map(String);
          } else {
            ids = parsedRecent
              .map(
                (it: any) =>
                  it?.id ?? it?._id ?? it?.defenceId ?? it?.defenseId ?? null
              )
              .filter(Boolean)
              .map(String);
          }
        } else if (typeof parsedRecent === "object") {
          // single-object case like: { _id: "68d5b548...", department: "Computer Science" }
          if (
            parsedRecent._id ||
            parsedRecent.id ||
            parsedRecent.defenceId ||
            parsedRecent.defenseId
          ) {
            ids = [
              String(
                parsedRecent._id ??
                  parsedRecent.id ??
                  parsedRecent.defenceId ??
                  parsedRecent.defenseId
              ),
            ];
          } else {
            const cand =
              parsedRecent?.data ??
              parsedRecent?.ids ??
              parsedRecent?.defenseIds ??
              parsedRecent?.result ??
              parsedRecent?.items ??
              null;

            if (Array.isArray(cand)) {
              if (
                cand.every(
                  (it: any) => typeof it === "string" || typeof it === "number"
                )
              ) {
                ids = cand.map(String);
              } else {
                ids = cand
                  .map(
                    (it: any) =>
                      it?.id ??
                      it?._id ??
                      it?.defenceId ??
                      it?.defenseId ??
                      null
                  )
                  .filter(Boolean)
                  .map(String);
              }
            } else {
              const maybeArray = Object.values(parsedRecent).find((v: any) =>
                Array.isArray(v)
              );
              if (Array.isArray(maybeArray)) {
                ids = maybeArray
                  .map((it: any) =>
                    typeof it === "string" || typeof it === "number"
                      ? String(it)
                      : it?.id ?? it?._id ?? null
                  )
                  .filter(Boolean);
              }
            }
          }
        }

       

        if (cancelled) return;

        if (!ids || ids.length === 0) {
          console.warn(
            "[DefenseDayPage] no defence IDs returned for level",
            level
          );
          // leave cache as-is (don't clear other level); nothing to set
          return;
        }

        // fetch details for each id in parallel
        const fetchDetailForId = async (did: string) => {
          try {
            const dUrl = `${baseUrl}/defence/${encodeURIComponent(did)}`;
            console.log(`[DefenseDayPage] GET /defence/${did} -> ${dUrl}`);
            const res = await fetch(dUrl, {
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
            

            // API returns { success: true, data: { defence, students, criteria } }
            const defObj =
              parsed?.data?.defence ??
              parsed?.defence ??
              parsed?.data ??
              parsed;
            const extra = parsed?.data ?? parsed;
            // map using the defence object and extra data (students + criteria)
            const mapped = mapDefenseFromDefenceObj(defObj, extra);
            return mapped;
          } catch (err) {
            console.error(
              `[DefenseDayPage] failed to fetch details for ${did}:`,
              err
            );
            return null;
          }
        };

        const detailPromises = ids.map((id) => fetchDetailForId(id));
        const results = await Promise.all(detailPromises);
        const normalizedDefs = results.filter(Boolean) as DefenseDay[];

        if (cancelled) return;

        if (normalizedDefs.length === 0) {
          console.warn(
            "[DefenseDayPage] could not normalize any defence details for ids:",
            ids
          );
          return;
        }

        // update cache for this level and immediately show
        setDefenseCache((prev) => {
          const next = { ...prev, [level]: normalizedDefs };
          return next;
        });
        setDefenseDays(normalizedDefs);
        setActiveDefenseIdx(0);

        // seed criteria from first defense if available
        if (normalizedDefs[0]?.criteria) {
          setCriteria(normalizedDefs[0].criteria ?? []);
        } else {
          setCriteria([]);
        }

        
      } catch (err) {
        console.error(
          "[DefenseDayPage] error fetching recent ids or details:",
          err
        );
      }
    };

    void fetchIdsAndDetails();

    return () => {
      cancelled = true;
    };
  }, [level, token]);

  if (!rolesLoaded) {
    return (
      <div className="p-6 text-center text-gray-600">Loading permissions…</div>
    );
  }

  if (!isPanel) {
    return (
      <div className="p-6 text-center text-red-600">
        Only panel members can access this page.
      </div>
    );
  }

  // --- UI helpers & actions ---
  const activeDefense = defenseDays[activeDefenseIdx];

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return days > 0
      ? `${days}d ${hours}:${minutes}:${seconds}`
      : `${hours}:${minutes}:${seconds}`;
  };

  const getCountdownFor = (def: DefenseDay) => {
    const start = new Date(def.date).getTime();
    const end = start + def.durationMinutes * 60 * 1000;
    if (def.sessionActive) {
      return Math.max(0, end - now);
    }
    return Math.max(0, start - now);
  };

  const updateStudentNested = (
    defenseId: string,
    studentId: string,
    updater: (s: Student) => Student
  ) => {
    setDefenseCache((prev) => {
      const updatedCache = { ...prev };
      const list = (updatedCache[level] ?? []).map((d) =>
        d.id !== defenseId
          ? d
          : {
              ...d,
              students: d.students.map((s) =>
                s.id === studentId ? updater(s) : s
              ),
            }
      );
      updatedCache[level] = list;
      setDefenseDays(list);
      return updatedCache;
    });
  };

  // open the confirm dialog (no network call here)
  const handleToggleSession = (defenseId: string) => {
    const def = defenseDays.find((d) => d.id === defenseId);
    if (!def) return;
    if (toggling) return; // global throttle
    const currentlyActive = !!def.sessionActive;
    const action = currentlyActive ? "end" : "start";
    setConfirmingSession({ defenseId, action, title: def.title });
  };

  // called when user confirms in the dialog
  const performToggleSession = async () => {
    if (!confirmingSession) return;
    const { defenseId, action } = confirmingSession;

    setConfirmProcessing(true);
    setToggling(true); // reuse existing toggling flag
    try {
      const url = `${baseUrl}/defence/${action}/${encodeURIComponent(
        defenseId
      )}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        let errText = `Failed to ${action} session (${res.status})`;
        try {
          const j = await res.json();
          if (j?.message) errText = j.message;
        } catch {}
        throw new Error(errText);
      }

      // update cache + UI (toggle sessionActive)
      setDefenseCache((prev) => {
        const updated = { ...prev };
        updated[level] = (updated[level] ?? []).map((d) =>
          d.id === defenseId
            ? { ...d, sessionActive: !(d.sessionActive ?? false) }
            : d
        );
        setDefenseDays(updated[level] ?? []);
        return updated;
      });

      toast({
        title: `Session ${action === "start" ? "Started" : "Ended"}`,
        description: `The defense session has been ${
          action === "start" ? "started" : "ended"
        } successfully.`,
        variant: "default",
      });

      // close the dialog
      setConfirmingSession(null);
    } catch (err: any) {
      console.error("Failed to toggle session:", err);
      toast({
        title: "Session Toggle Failed",
        description: err?.message ?? "Network error while toggling session.",
        variant: "destructive",
      });
    } finally {
      setConfirmProcessing(false);
      setToggling(false);
    }
  };

  const handleScoreChange = (
    defenseId: string,
    studentId: string,
    criterion: string,
    value: number
  ) => {
    updateStudentNested(defenseId, studentId, (s) => ({
      ...s,
      scores: { ...s.scores, [criterion]: isNaN(value) ? null : value },
    }));
  };

  const handleAddCommentFromModal = (text: string) => {
    if (!selectedStudent || !text.trim()) return;
    const { defenseId, student } = selectedStudent;
    updateStudentNested(defenseId, student.id, (s) => ({
      ...s,
      comments: [...s.comments, { by: userName, text: text.trim() }],
    }));
    setSelectedStudent((prev) =>
      prev
        ? {
            defenseId: prev.defenseId,
            student: {
              ...prev.student,
              comments: [
                ...prev.student.comments,
                { by: userName, text: text.trim() },
              ],
            },
          }
        : null
    );
  };

  // replace or add these handlers in DefenseDayPage.tsx

  const setProcessing = (studentId: string, v: boolean) =>
    setProcessingIds((p) => ({ ...p, [studentId]: v }));

  const handleApprove = async (studentId: string) => {
    if (!studentId) return;
    setProcessing(studentId, true);
    try {
      const url = `${baseUrl}/defence/approve/${encodeURIComponent(studentId)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        let txt = await res.text().catch(() => "");
        try {
          const parsed = txt ? JSON.parse(txt) : null;
          txt = parsed?.message ?? parsed?.error ?? txt;
        } catch {}
        throw new Error(txt || `Server ${res.status}`);
      }

      // update UI cache: mark approved true
      // we don't need to know defenseId here; update all defenses in current level where student exists
      setDefenseCache((prev) => {
        const updated = { ...prev };
        updated[level] = (updated[level] ?? []).map((d) => ({
          ...d,
          students: d.students.map((s) =>
            s.id === studentId ? { ...s, approved: true } : s
          ),
        }));

        setDefenseDays(updated[level] ?? []);
        return updated;
      });

      toast({
        title: "Student approved",
        description: "The student has been approved.",
        variant: "default",
      });
    } catch (err: any) {
      console.error("approve error", err);
      toast({
        title: "Approve failed",
        description: err?.message ?? "Network error while approving student.",
        variant: "destructive",
      });
    } finally {
      setProcessing(studentId, false);
    }
  };

  const handleReject = async (studentId: string) => {
    if (!studentId) return;
    setProcessing(studentId, true);
    try {
      const url = `${baseUrl}/defence/reject/${encodeURIComponent(studentId)}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        let txt = await res.text().catch(() => "");
        try {
          const parsed = txt ? JSON.parse(txt) : null;
          txt = parsed?.message ?? parsed?.error ?? txt;
        } catch {}
        throw new Error(txt || `Server ${res.status}`);
      }

      // update UI cache: mark approved false (rejected)
      setDefenseCache((prev) => {
        const updated = { ...prev };
        updated[level] = (updated[level] ?? []).map((d) => ({
          ...d,
          students: d.students.map((s) =>
            s.id === studentId ? { ...s, approved: false } : s
          ),
        }));
        setDefenseDays(updated[level] ?? []);
        return updated;
      });

      toast({
        title: "Student rejected",
        description: "The student has been rejected.",
        variant: "default",
      });
    } catch (err: any) {
      console.error("reject error", err);
      toast({
        title: "Reject failed",
        description: err?.message ?? "Network error while rejecting student.",
        variant: "destructive",
      });
    } finally {
      setProcessing(studentId, false);
    }
  };

  const handleSubmitScores = async (defenseId: string) => {
    if (!defenseId) {
      toast({
        title: "No defense selected",
        description: "Cannot submit scores: no defense ID provided.",
        variant: "destructive",
      });
      return;
    }

    const def = defenseDays.find((d) => d.id === defenseId);
    if (!def) {
      toast({
        title: "Defense not found",
        description: "Could not find the selected defense.",
        variant: "destructive",
      });
      return;
    }

    const panelMemberId = String(user?.id ?? user?._id ?? "");
    if (!panelMemberId) {
      toast({
        title: "No panel member id",
        description: "You must be signed in to submit scores.",
        variant: "destructive",
      });
      return;
    }

    // Build payloads: for each student create both an object and an array representation
    const payloads = def.students
      .map((s) => {
        const scoresObj: Record<string, number> = {};
        const scoresArray: Array<{ criterion: string; score: number }> = [];

        Object.entries(s.scores ?? {}).forEach(([k, v]) => {
          const n = Number(v);
          if (v !== null && v !== undefined && !Number.isNaN(n)) {
            scoresObj[k] = n;
            scoresArray.push({ criterion: k, score: n });
          }
        });

        return {
          studentId: s.id,
          panelMemberId,
          // primary payload shape uses an array (server appears to expect this)
          scores: scoresArray,
          // include object variant too in case backend accepts it
        };
      })
      .filter((p) => Array.isArray(p.scores) && p.scores.length > 0);

    if (payloads.length === 0) {
      toast({
        title: "No scores to submit",
        description: "There are no entered scores to submit for this defense.",
        variant: "destructive",
      });
      return;
    }

    setSubmittingScores(true);

    try {
      const results = await Promise.all(
        payloads.map(async (pl) => {
          const url = `${baseUrl}/defence/submit-score/${encodeURIComponent(
            defenseId
          )}`;

          // LOG payload so you can inspect in console
          console.log("Submitting score payload:", url, pl);

          const res = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(pl),
          });

          const raw = await res.text().catch(() => "");
          let parsed: any = null;
          try {
            parsed = raw ? JSON.parse(raw) : null;
          } catch {
            parsed = raw;
          }

        

          if (!res.ok) {
            const msg =
              (parsed && (parsed.message || parsed.error)) ||
              `HTTP ${res.status}`;
            return { ok: false, studentId: pl.studentId, msg };
          }
          return { ok: true, studentId: pl.studentId, data: parsed };
        })
      );

      // inside handleSubmitScores after `const results = await Promise.all(...)` and after you compute `failed` / `results`
      const failed = results.filter((r) => !r.ok);
      const succeeded = results.filter((r) => r.ok).map((r) => r.studentId);

      // Clear scores for only the succeeded students
      if (succeeded.length > 0) {
        succeeded.forEach((studentId) => {
          updateStudentNested(defenseId, studentId, (s) => ({
            ...s,
            // remove all scores so inputs become blank
            scores: {},
          }));
        });
      }

      if (failed.length === 0) {
        toast({
          title: "Scores Submitted",
          description: `Submitted scores for ${results.length} student(s).`,
          variant: "default",
        });
      } else {
        const failSummary = failed
          .map((f) => `${f.studentId}${f.msg ? ` (${f.msg})` : ""}`)
          .slice(0, 6)
          .join(", ");
        toast({
          title: "Partial failure",
          description: `Failed for ${failed.length} student(s): ${failSummary}${
            failed.length > 6 ? ", ..." : ""
          }`,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("submit scores error", err);
      toast({
        title: "Submit failed",
        description:
          err?.message || "Network or server error while submitting scores.",
        variant: "destructive",
      });
    } finally {
      setSubmittingScores(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Level toggle */}
      <div className="flex gap-2 items-center justify-end">
        <div className="text-sm text-gray-600 mr-2">Level:</div>
        <div className="flex gap-2">
          <button
            onClick={() => setLevel("MSC")}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              level === "MSC"
                ? "bg-amber-700 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            MSc
          </button>
          <button
            onClick={() => setLevel("PHD")}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
              level === "PHD"
                ? "bg-amber-700 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            PhD
          </button>
        </div>
      </div>

      {/* Defence day tabs */}

      <div className="flex gap-2 items-center overflow-x-auto">
        {defenseDays.map((d, i) => (
          <button
            key={d.id}
            onClick={() => {
              setActiveDefenseIdx(i);
              setActiveTab("students");
              setCriteria(d.criteria ?? []);
            }}
            title={`${d.title ?? `Defense ${i + 1}`} • ${new Date(
              d.date
            ).toLocaleString()}`}
            aria-label={`Defense ${i + 1}`}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              i === activeDefenseIdx
                ? "bg-amber-700 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {`Defense ${i + 1}`}
          </button>
        ))}
      </div>

      {/* Active defense header */}
      {activeDefense && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="bg-white border border-amber-100 rounded-lg p-6 w-full flex sm:flex-1 items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="text-3xl font-extrabold text-gray-900">
                Defense Day Details
              </h2>
              <p className="text-sm text-amber-700/90 mt-1">
                {new Date(activeDefense.date).toLocaleString()} | Level:{" "}
                <strong>{activeDefense.level}</strong> | Defense:{" "}
                <strong className="capitalize">
                  {activeDefense.currentStage}
                </strong>
              </p>
              <p className="text-sm text-gray-700 mt-3">
                Countdown:{" "}
                <strong className="text-amber-700">
                  {formatCountdown(getCountdownFor(activeDefense))}
                </strong>{" "}
                {activeDefense.sessionActive
                  ? " (Session active)"
                  : " (Not started)"}
              </p>
            </div>

            {isHodOrProvost && (
              <div className="flex-shrink-0">
                <Button
                  onClick={() => handleToggleSession(activeDefense.id)}
                  disabled={toggling}
                  className={`flex items-center px-4 py-2 rounded-full shadow-sm ${
                    activeDefense.sessionActive
                      ? "bg-amber-50 border border-amber-100 text-amber-700"
                      : "bg-amber-700 text-white"
                  }`}
                >
                  {toggling
                    ? activeDefense.sessionActive
                      ? "Ending..."
                      : "Starting..."
                    : activeDefense.sessionActive
                    ? "End Session"
                    : "Start Session"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Secondary controlled tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("students")}
          className={`px-4 py-2 -mb-px font-medium text-sm ${
            activeTab === "students"
              ? "border-b-2 border-amber-700 text-amber-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Students
        </button>
        <button
          onClick={() => setActiveTab("scores")}
          className={`px-4 py-2 -mb-px font-medium text-sm ${
            activeTab === "scores"
              ? "border-b-2 border-amber-700 text-amber-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Score Sheet
        </button>
        {isHodOrProvost && (
          <button
            onClick={() => setActiveTab("assessment")}
            className={`px-4 py-2 -mb-px font-medium text-sm ${
              activeTab === "assessment"
                ? "border-b-2 border-amber-700 text-amber-700"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Assessment
          </button>
        )}
      </div>

      <div>
        {activeTab === "students" && (
          <StudentsPanel
            students={activeDefense?.students ?? []}
            onOpen={(s) =>
              setSelectedStudent({
                student: s,
                defenseId: activeDefense?.id ?? "",
              })
            }
          />
        )}

        {activeTab === "scores" && (
          <ScoreSheetPanel
            defense={activeDefense ?? ({} as any)}
            criteria={activeDefense?.criteria ?? criteria}
            canScore={isPanel}
            onScoreChange={(studentId, crit, value) =>
              handleScoreChange(activeDefense?.id ?? "", studentId, crit, value)
            }
            onSubmit={() => handleSubmitScores(activeDefense?.id ?? "")}
          />
        )}

        {activeTab === "assessment" && isHodOrProvost && (
          <AssessmentPanel
            students={activeDefense?.students ?? []}
            criteria={activeDefense?.criteria ?? criteria}
            onApprove={(studentId) => handleApprove(studentId)}
            onReject={(studentId) => handleReject(studentId)}
            processingIds={processingIds}
            defenseStage={activeDefense?.currentStage}
          />
        )}
      </div>

      {/* Confirm dialog for starting/ending session */}
      <Dialog
        open={!!confirmingSession}
        onOpenChange={() => {
          // close dialog when user clicks outside / presses ESC
          if (!confirmProcessing) setConfirmingSession(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmingSession?.action === "start"
                ? "Start Defense Session"
                : "End Defense Session"}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-700">
              {confirmingSession?.action === "start" ? (
                <>
                  You are about to <strong>start</strong> the session for{" "}
                  <span className="font-medium">
                    {confirmingSession?.title ?? ""}
                  </span>
                  . Panel members will be able to submit scores.
                </>
              ) : (
                <>
                  You are about to <strong>end</strong> the session for{" "}
                  <span className="font-medium">
                    {confirmingSession?.title ?? ""}
                  </span>
                  . Ending will stop further submissions.
                </>
              )}
            </p>
          </div>

          <DialogFooter className="flex gap-2 justify-end">
            <Button
              onClick={() => {
                if (confirmProcessing) return;
                setConfirmingSession(null);
              }}
              variant="secondary"
              className="px-4 py-2"
            >
              Cancel
            </Button>

            <Button
              onClick={performToggleSession}
              disabled={confirmProcessing}
              className="bg-amber-700 text-white px-4 py-2"
            >
              {confirmProcessing
                ? confirmingSession?.action === "start"
                  ? "Starting..."
                  : "Ending..."
                : confirmingSession?.action === "start"
                ? "Start Session"
                : "End Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <StudentCommentModal
        openItem={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onAddComment={handleAddCommentFromModal}
        canComment={isPanel}
        baseUrl={baseUrl}
        token={token}
        currentUserName={userName}
      />
    </div>
  );
}
