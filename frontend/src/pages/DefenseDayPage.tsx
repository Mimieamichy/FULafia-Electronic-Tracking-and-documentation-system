// src/defense/DefenseDayPage.tsx
import React, { useState, useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  CheckCircle,
  X,
} from "lucide-react";
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
  comments: { by: string; text: string }[];
  scores: Record<string, number | null>;
}

// --- Mock Data ---
const mockScoreSheet: Criterion[] = [
  { title: "Presentation", percentage: 20 },
  { title: "Content", percentage: 40 },
  { title: "Defense Handling", percentage: 40 },
];

const mockAssignedStudents: Student[] = [
  {
    id: "s1",
    name: "Alice Johnson",
    matNo: "220976780",
    topic: "AI in Healthcare",
    fileUrl: "https://example.com/alice.pdf",
    comments: [],
    scores: { Presentation: null, Content: null, "Defense Handling": null },
  },
  {
    id: "s2",
    name: "Bob Smith",
    matNo: "220976781",
    topic: "Blockchain Security",
    fileUrl: "https://example.com/bob.pdf",
    comments: [],
    scores: { Presentation: null, Content: null, "Defense Handling": null },
  },
];

export default function DefenseDayPage() {
  const { role, userName } = useAuth();
  const isHod = role === "HOD";
  const isPanel =
    role === "SUPERVISOR" ||
    role === "PG_COORD" ||
    role === "PROVOST" ||
    role === "DEAN";
  const canScoreOrComment = isHod || isPanel;

  const [sessionActive, setSessionActive] = useState(false);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [activeTab, setActiveTab] = useState<"submissions" | "scores">(
    "submissions"
  );

  // Modal state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    setCriteria(mockScoreSheet);
    setStudents(mockAssignedStudents);
  }, []);

  const toggleSession = () => {
    setSessionActive((prev) => !prev);
  };

  const handleScoreChange = (
    studentId: string,
    criterion: string,
    value: number
  ) => {
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, scores: { ...s.scores, [criterion]: value } }
          : s
      )
    );
  };

  const handleAddComment = () => {
    if (!selectedStudent || !newComment.trim()) return;
    setStudents((prev) =>
      prev.map((s) =>
        s.id === selectedStudent.id
          ? {
              ...s,
              comments: [
                ...s.comments,
                { by: userName, text: newComment.trim() },
              ],
            }
          : s
      )
    );
    setNewComment("");
  };

  // Prevent panel from viewing before session start
  if (isPanel && !sessionActive && !isHod) {
    return (
      <div className="p-6 text-center text-gray-500">
        The defense session has not started yet.
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* HOD Controls */}
      {isHod && (
        <div className="flex items-center gap-4">
          <Button
            className={`${
              sessionActive ? "bg-red-600" : "bg-green-600"
            } text-white`}
            onClick={toggleSession}
          >
            {sessionActive ? "End Defense Session" : "Start Defense Session"}
          </Button>
          <span
            className={`font-medium ${
              sessionActive ? "text-green-700" : "text-red-600"
            }`}
          >
            Session {sessionActive ? "Active" : "Not Started"}
          </span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2 -mb-px font-medium text-sm ${
            activeTab === "submissions"
              ? "border-b-2 border-amber-700 text-amber-700"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Submissions & Comments
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
      </div>

      {/* Submissions & Comments Tab */}
      {activeTab === "submissions" && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border">Matric No</th>
                <th className="p-3 border">Full Name</th>
                <th className="p-3 border">Topic</th>
                <th className="p-3 border">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr
                  key={s.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}
                >
                  <td className="p-3 border">{s.matNo}</td>
                  <td className="p-3 border">
                    <button
                      className="text-amber-700 hover:underline"
                      onClick={() => setSelectedStudent(s)}
                    >
                      {s.name}
                    </button>
                  </td>
                  <td className="p-3 border">{s.topic}</td>
                  <td className="p-3 border">
                    <button
                      className="inline-flex items-center text-amber-700 hover:underline"
                      onClick={() => setSelectedStudent(s)}
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

      {/* Score Sheet Tab */}
      {activeTab === "scores" && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="w-full min-w-[600px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 border">Matric No</th>
                <th className="p-3 border">Full Name</th>
                <th className="p-3 border">Topic</th>
                {criteria.map((c) => (
                  <th key={c.title} className="p-3 border whitespace-nowrap">
                    {c.title} <br />
                    <span className="text-xs text-gray-500">
                      ({c.percentage}%)
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((s, idx) => (
                <tr
                  key={s.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}
                >
                  <td className="p-3 border">{s.matNo}</td>
                  <td className="p-3 border">{s.name}</td>
                  <td className="p-3 border">{s.topic}</td>
                  {criteria.map((c) => (
                    <td key={c.title} className="p-2 border">
                      {canScoreOrComment ? (
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={s.scores[c.title] ?? ""}
                          onChange={(e) =>
                            handleScoreChange(
                              s.id,
                              c.title,
                              parseInt(e.target.value, 10)
                            )
                          }
                          className="w-16 text-sm"
                        />
                      ) : (
                        <span className="text-gray-600">
                          {s.scores[c.title] ?? "—"}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
            <DialogTitle>
              {selectedStudent?.name}’s Submission & Comments
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-4">
              {/* Download */}
              <div className="p-4 border rounded bg-gray-50">
                <a
                  href={selectedStudent.fileUrl}
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
                {selectedStudent.comments.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">
                    No comments yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {selectedStudent.comments.map((c, i) => (
                      <li key={i} className="bg-gray-100 p-2 rounded text-sm">
                        <strong className="text-amber-700">{c.by}:</strong>{" "}
                        {c.text}
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
                  <Button
                    className="bg-amber-700 text-white flex items-center"
                    onClick={handleAddComment}
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Save Comment
                  </Button>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStudent(null)}>
              <X className="w-4 h-4 mr-1" />
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
