import { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Download, CheckCircle, X } from "lucide-react";
import ScoreSheetPanel from "./ScoreSheetDefense";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
  currentStage: "proposal_defense",
  comments: [],
  scores: { Presentation: null, Content: null, "Defense Handling": null },
});

const mockDefenseDays: DefenseDay[] = [
  {
    id: "d1",
    title: "Defense 1",
    // today
    date: new Date().toISOString(),
    durationMinutes: 120,
    level: "MSC",
    sessionActive: false,
    students: [
      makeStudent("s1", "Alice Johnson", "220976780", "AI in Healthcare"),
      makeStudent("s2", "Bob Smith", "220976781", "Blockchain Security"),
    ],
  },
  {
    id: "d2",
    title: "Defense 2",
    // two days from now
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    durationMinutes: 90,
    level: "PHD",
    sessionActive: false,
    students: [makeStudent("s3", "Cecilia Wang", "220976782", "Edge AI")],
  },
];

export default function DefenseDayPage() {
  // --- auth & roles
  const { user, roles = [] } = useAuth();
  const userName = user?.userName ?? "User";

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

  // true if any role matches a panel keyword (exact match or startsWith)
  const isPanel = normalizedRoles.some((r) =>
    PANEL_KEYWORDS.some((k) => r === k || r.startsWith(k))
  );

  // HOD / Provost membership checks
  const isHodOrProvost =
    normalizedRoles.includes("hod") || normalizedRoles.includes("provost");

  // optional single-role string you can use elsewhere (falls back to first role)
  const role = (user?.role ?? normalizedRoles[0] ?? "").toUpperCase();

  // --- Hooks: MUST be declared unconditionally at the top of the component ---
  const [defenseDays, setDefenseDays] = useState<DefenseDay[]>(mockDefenseDays);
  const [activeDefenseIdx, setActiveDefenseIdx] = useState(0);
  const [criteria, setCriteria] = useState<Criterion[]>(defaultCriteria);

  // tab control: students | scores | assessment
  const [activeTab, setActiveTab] = useState<
    "students" | "scores" | "assessment"
  >("students");

  // Modal state
  const [selectedStudent, setSelectedStudent] = useState<{
    student: Student;
    defenseId: string;
  } | null>(null);
  const [newComment, setNewComment] = useState("");

  // Countdown 'now'
  const [now, setNow] = useState(Date.now());

  // Always register effects after hooks
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

  const isDefenseDay = (def: DefenseDay) => {
    return isSameDay(def.date);
  };

  const formatCountdown = (ms: number) => {
    if (ms <= 0) return "00:00:00";
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600)
      .toString()
      .padStart(2, "0");
    const minutes = Math.floor((totalSeconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${hours}:${minutes}:${seconds}`;
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

  const toggleSession = (defenseId: string) => {
    setDefenseDays((prev) =>
      prev.map((d) =>
        d.id === defenseId ? { ...d, sessionActive: !d.sessionActive } : d
      )
    );
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

  const handleAddComment = () => {
    if (!selectedStudent || !newComment.trim()) return;
    const { defenseId, student } = selectedStudent;
    updateStudentNested(defenseId, student.id, (s) => ({
      ...s,
      comments: [...s.comments, { by: userName, text: newComment.trim() }],
    }));
    setNewComment("");
    // refresh local selectedStudent
    setSelectedStudent((prev) =>
      prev
        ? {
            defenseId: prev.defenseId,
            student: {
              ...prev.student,
              comments: [
                ...prev.student.comments,
                { by: userName, text: newComment.trim() },
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
    alert("Scores submitted (mock). Replace with API call.");
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
              i === activeDefenseIdx ? "bg-amber-700 text-white" : "bg-gray-100 text-gray-700"
            }`}
          >
            {d.title}
          </button>
        ))}
      </div>

      {/* Active defense header */}
      {activeDefense && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">{activeDefense.title}</h2>
            <p className="text-sm text-gray-600">
              {new Date(activeDefense.date).toLocaleString()} — Level:{" "}
              <strong>{activeDefense.level}</strong>
            </p>
            <p className="text-sm text-gray-700 mt-2">
              Countdown:{" "}
              <strong>{formatCountdown(getCountdownFor(activeDefense))}</strong>
              {activeDefense.sessionActive ? " (Session active)" : " (Not started)"}
            </p>
          </div>

          {/* HOD / Provost controls */}
          {isHodOrProvost && (
            <div className="flex gap-2">
              <Button
                className={`flex items-center ${
                  activeDefense.sessionActive ? "bg-red-600 text-white" : "bg-green-600 text-white"
                }`}
                onClick={() => toggleSession(activeDefense.id)}
              >
                {activeDefense.sessionActive ? "End Defense Session" : "Start Defense Session"}
              </Button>
            </div>
          )}
        </div>
      )}

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
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border">Matric No</th>
                  <th className="p-3 border">Full Name</th>
                  <th className="p-3 border">Topic</th>
                  <th className="p-3 border">Current Stage</th>
                  <th className="p-3 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeDefense.students.map((s, idx) => (
                  <tr key={s.id} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                    <td className="p-3 border">{s.matNo}</td>
                    <td className="p-3 border">{s.name}</td>
                    <td className="p-3 border">{s.topic}</td>
                    <td className="p-3 border">{s.currentStage}</td>
                    <td className="p-3 border">
                      <button
                        className="inline-flex items-center text-amber-700 hover:underline"
                        onClick={() =>
                          setSelectedStudent({
                            student: s,
                            defenseId: activeDefense.id,
                          })
                        }
                      >
                        <Download className="w-4 h-4 mr-1" />
                        View & Comment
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
          <div className="space-y-3">
            <h3 className="text-md font-semibold">Assessment (Approve to next stage)</h3>
            <div className="overflow-x-auto bg-white rounded-lg shadow">
              <table className="w-full min-w-[600px] text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 border">Matric No</th>
                    <th className="p-3 border">Full Name</th>
                    <th className="p-3 border">Current Stage</th>
                    <th className="p-3 border">Score</th>
                    <th className="p-3 border">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeDefense.students.map((s, idx) => (
                    <tr key={s.id} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                      <td className="p-3 border">{s.matNo}</td>
                      <td className="p-3 border">{s.name}</td>
                      <td className="p-3 border">{s.currentStage}</td>
                      <td className="p-3 border">{computeScore(s, criteria)}</td>
                      <td className="p-3 border">
                        <Button
                          onClick={() => handleApprove(activeDefense.id, s.id)}
                          disabled={!!s.approved}
                          className={`px-3 py-1 ${s.approved ? "bg-gray-300" : "bg-green-600 text-white"}`}
                        >
                          {s.approved ? "Approved" : "Approve"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Comments & PDF Modal */}
      <Dialog
        open={selectedStudent !== null}
        onOpenChange={() => {
          setSelectedStudent(null);
          setNewComment("");
        }}
      >
        <DialogContent className="max-w-lg w-full">
          <DialogHeader>
            <DialogTitle>{selectedStudent?.student.name}’s Submission & Comments</DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4">
              {/* Download */}
              <div className="p-4 border rounded bg-gray-50">
                <a
                  href={selectedStudent.student.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-amber-700 hover:underline"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download PDF
                </a>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Comments</h3>
                {selectedStudent.student.comments.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">No comments yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {selectedStudent.student.comments.map((c, i) => (
                      <li key={i} className="bg-gray-100 p-2 rounded text-sm">
                        <strong className="text-amber-700">{c.by}:</strong> {c.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Add Comment */}
              {canScoreOrComment && (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Write your comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                  />
                  <Button className="bg-amber-700 text-white flex items-center" onClick={handleAddComment}>
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Save Comment
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>
              <X className="w-4 h-4 mr-1" /> Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
