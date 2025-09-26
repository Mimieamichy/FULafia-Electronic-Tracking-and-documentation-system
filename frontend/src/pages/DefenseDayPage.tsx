import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import ScoreSheetPanel from "./ScoreSheetDefense";
import StudentsPanel from "./StudentsPanel";
import AssessmentPanel from "./AssessmentPanel";
import StudentCommentModal from "./StudentCommentModal";
import { useToast } from "@/hooks/use-toast";

// --- Types ---
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
  level: "MSC" | "PHD";
  sessionActive?: boolean;
  students: Student[];
  currentStage: string;
}

// --- Mock Data ---
const defaultCriteria: Criterion[] = [
  { title: "Presentation", percentage: 20 },
  { title: "Content", percentage: 40 },
  { title: "Defense Handling", percentage: 40 },
];

const makeStudent = (
  id: string,
  name: string,
  matNo: string,
  topic: string
): Student => ({
  id,
  name,
  matNo,
  topic,
  fileUrl: "https://example.com/sample.pdf",
  currentStage: "proposal defense",
  comments: [],
  scores: { Presentation: null, Content: null, "Defense Handling": null },
});

const mockDefenseDays: DefenseDay[] = [
  {
    id: "d1",
    title: "Defense Day 1",
    // today
    date: new Date().toISOString(),
    durationMinutes: 120,
    level: "MSC",
    sessionActive: false,
    students: [
      makeStudent("s1", "Alice Johnson", "220976780", "AI in Healthcare"),
      makeStudent("s2", "Bob Smith", "220976781", "Blockchain Security"),
    ],
    currentStage: "proposal defense",
  },
  {
    id: "d2",
    title: "Defense Day 2",
    // two days from now
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 90,
    level: "PHD",
    sessionActive: false,
    currentStage: "external defense",
    students: [makeStudent("s3", "Cecilia Wang", "220976782", "Edge AI")],
  },
];

export default function DefenseDayPage() {
  // --- auth & roles
  const { user, roles = [] } = useAuth();
  const userName = user?.userName ?? "User";
  const { toast } = useToast();

  // normalize roles to a predictable lowercase array
  const normalizedRoles: string[] = Array.isArray(roles)
    ? roles.map((r) => String(r).toLowerCase())
    : [];

  // panel role keywords
  const PANEL_KEYWORDS = [
    "panel_member",
    "internal_examiner",
    "supervisor",
    "major_supervisor",
  ];

  // true if any role matches a panel keyword (exact match or startsWith/includes)
  const isPanel = normalizedRoles.some((r) =>
    PANEL_KEYWORDS.some((k) => r === k || r.startsWith(k) || r.includes(k))
  );

  // HOD / Provost membership checks (be forgiving to variants)
  const isHodOrProvost = normalizedRoles.some(
    (r) =>
      r === "hod" ||
      r === "provost" ||
      r.includes("hod") ||
      r.includes("provost") ||
      r.startsWith("hod") ||
      r.startsWith("provost")
  );

  // optional single-role string you can use elsewhere (falls back to first role)
  const role = (user?.role ?? normalizedRoles[0] ?? "").toUpperCase();

  // --- Hooks
  const [defenseDays, setDefenseDays] = useState<DefenseDay[]>(mockDefenseDays);
  const [activeDefenseIdx, setActiveDefenseIdx] = useState(0);
  const [criteria, setCriteria] = useState<Criterion[]>(defaultCriteria);

  // tab control: students | scores | assessment
  const [activeTab, setActiveTab] = useState<
    "students" | "scores" | "assessment"
  >("students");

  // Modal state (open student)
  const [selectedStudent, setSelectedStudent] = useState<{
    student: Student;
    defenseId: string;
  } | null>(null);

  // Countdown 'now'
  const [now, setNow] = useState(Date.now());

  // toggling state for Start/End API request
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    setCriteria(defaultCriteria);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Early return AFTER hooks
  if (!isPanel) {
    return (
      <div className="p-6 text-center text-red-600">
        Only panel members can access this page.
      </div>
    );
  }

  // safety: if no defense days
  if (!defenseDays || defenseDays.length === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        No defense days scheduled.
      </div>
    );
  }

  const canScoreOrComment = isPanel; // any panel member can score/comment

  const activeDefense = defenseDays[activeDefenseIdx];

  // Helpers
  const isSameDay = (iso: string) => {
    const d = new Date(iso);
    const n = new Date();
    return (
      d.getFullYear() === n.getFullYear() &&
      d.getMonth() === n.getMonth() &&
      d.getDate() === n.getDate()
    );
  };

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
    // show days when > 0, otherwise hh:mm:ss
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
    // not active yet: countdown to start
    return Math.max(0, start - now);
  };

  // Update helpers for nested student modifications
  const updateStudentNested = (
    defenseId: string,
    studentId: string,
    updater: (s: Student) => Student
  ) => {
    setDefenseDays((prev) =>
      prev.map((d) =>
        d.id !== defenseId
          ? d
          : {
              ...d,
              students: d.students.map((s) =>
                s.id === studentId ? updater(s) : s
              ),
            }
      )
    );
  };

  // API-backed toggling for session start/end
  const handleToggleSession = async (defenseId: string) => {
    // find defense current state
    const def = defenseDays.find((d) => d.id === defenseId);
    if (!def) return;

    const currentlyActive = !!def.sessionActive;

    // confirm before ending
    if (currentlyActive) {
      const ok = confirm("Are you sure you want to end this defense session?");
      if (!ok) return;
    }

    if (toggling) return; // guard double-clicks
    setToggling(true);

    const action = currentlyActive ? "end" : "start";
    const url = `/defence/${action}/${encodeURIComponent(defenseId)}`;

    try {
      // If your API needs auth headers, add them here.
      // e.g. headers: { Authorization: `Bearer ${user?.token}` }
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}`, // <-- add if required
        },
        // body: JSON.stringify({}), // include payload if your API expects one
      });

      if (!res.ok) {
        // try to parse server error
        let errText = `Failed to ${action} session (${res.status})`;
        try {
          const json = await res.json();
          if (json?.message) errText = json.message;
        } catch {
          // ignore parse error
        }
        throw new Error(errText);
      }

      // optionally parse response to get updated sessionActive value from server
      // const payload = await res.json();
      // const newActive = payload?.sessionActive ?? !currentlyActive;

      // update UI state after success
      setDefenseDays((prev) =>
        prev.map((d) =>
          d.id === defenseId ? { ...d, sessionActive: !currentlyActive } : d
        )
      );

      toast({
        title: `Session ${action === "start" ? "Started" : "Ended"}`,
        description: `The defense session has been ${
          action === "start" ? "started" : "ended"
        } successfully.`,
        variant: "default",
      });
    } catch (err: any) {
      console.error("Failed to toggle session:", err);
     
      toast({
        title: "Session Toggle Failed",
        description: err?.message ?? "Network error while toggling session.",
        variant: "destructive",
      });
    } finally {
      setToggling(false);
    }
  };

  const toggleSession = (defenseId: string) => {
    // kept for compatibility; call the API-backed handler
    void handleToggleSession(defenseId);
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
    // update the open modal's student comments too
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

  const computeScore = (s: Student, crit: Criterion[]) => {
    let total = 0;
    crit.forEach((c) => {
      const sc = s.scores[c.title];
      if (typeof sc === "number" && !isNaN(sc)) {
        total += (sc * c.percentage) / 100;
      }
    });
    return Math.round(total * 100) / 100;
  };

  const handleApprove = (defenseId: string, studentId: string) => {
    updateStudentNested(defenseId, studentId, (s) => ({
      ...s,
      approved: true,
    }));
  };

  const handleSubmitScores = (defenseId: string) => {
    // In a real app you'd call an API here. We'll just show a tiny UI effect.
    
    toast({
      title: "Scores Submitted",
      description: "The scores have been submitted successfully.",
      variant: "default",
    });
  };

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Defense Days Tabs */}
      <div className="flex gap-2 items-center overflow-x-auto">
        {defenseDays.map((d, i) => (
          <button
            key={d.id}
            onClick={() => {
              setActiveDefenseIdx(i);
              setActiveTab("students"); // reset to students when switching defense day
            }}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap ${
              i === activeDefenseIdx
                ? "bg-amber-700 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {d.title}
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
                  className={`flex items-center px-4 py-2 rounded-full shadow-sm ${
                    activeDefense.sessionActive
                      ? "bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-700 hover:text-white"
                      : "bg-amber-700 text-white hover:bg-amber-50 hover:text-amber-700 border hover:border-amber-700"
                  }`}
                  onClick={() => handleToggleSession(activeDefense.id)}
                  disabled={toggling}
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

      {/* Countdown summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-amber-50 border border-amber-100 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-900">2</div>
          <div className="text-sm text-amber-700 mt-1">Days</div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-900">14</div>
          <div className="text-sm text-amber-700 mt-1">Hours</div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-900">30</div>
          <div className="text-sm text-amber-700 mt-1">Minutes</div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-lg p-6 text-center">
          <div className="text-3xl font-bold text-gray-900">15</div>
          <div className="text-sm text-amber-700 mt-1">Seconds</div>
        </div>
      </div>

      {/* Secondary controlled tabs: Students, Score Sheet, Assessment */}
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

      {/* Panels (only the active tab renders) */}
      <div>
        {activeTab === "students" && (
          <StudentsPanel
            students={activeDefense.students}
            onOpen={(s) =>
              setSelectedStudent({ student: s, defenseId: activeDefense.id })
            }
          />
        )}

        {activeTab === "scores" && (
          <ScoreSheetPanel
            defense={activeDefense}
            criteria={criteria}
            canScore={canScoreOrComment}
            onScoreChange={(studentId, crit, value) =>
              handleScoreChange(activeDefense.id, studentId, crit, value)
            }
            onSubmit={() => handleSubmitScores(activeDefense.id)}
          />
        )}

        {activeTab === "assessment" && isHodOrProvost && (
          <AssessmentPanel
            students={activeDefense.students}
            criteria={criteria}
            onApprove={(studentId) =>
              handleApprove(activeDefense.id, studentId)
            }
          />
        )}
      </div>

      {/* Student Modal (separate file) */}
      <StudentCommentModal
        openItem={selectedStudent}
        onClose={() => setSelectedStudent(null)}
        onAddComment={handleAddCommentFromModal}
        canComment={canScoreOrComment}
      />
    </div>
  );
}
