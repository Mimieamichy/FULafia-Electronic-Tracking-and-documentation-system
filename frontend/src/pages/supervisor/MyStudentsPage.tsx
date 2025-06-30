// src/supervisor/MyStudentsPage.tsx
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../AuthProvider";

type Student = {
  id: string;
  name: string;
  matNo: string;
  topic: string;
  stage: string;
  scores: {
    proposal: number | null;
    internal: number | null;
    external: number | null;
  };
  fileUrl: string;
  comments: { by: string; text: string }[];
};

// **Mock data** — replace with real fetch when ready
const mockMyStudents: Student[] = [
  {
    id: "s1",
    name: "Alice Johnson",
    matNo: "220976780",
    topic: "AI in Healthcare",
    stage: "Second Seminar",
    scores: { proposal: 90, internal: 85, external: null },
    fileUrl: "https://example.com/alice.pdf",
    comments: [{ by: "Dr. Moses", text: "Well structured draft." }],
  },
  {
    id: "s2",
    name: "Bob Smith",
    matNo: "220976781",
    topic: "Blockchain Security",
    stage: "First Seminar",
    scores: { proposal: 75, internal: null, external: null },
    fileUrl: "https://example.com/bob.pdf",
    comments: [],
  },
];

export default function MyStudentsPage() {
  const { userName } = useAuth();
  const [students, setStudents] = useState<Student[]>(mockMyStudents);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  const selected = selectedIdx !== null ? students[selectedIdx] : null;

  const handleComment = () => {
    if (selectedIdx === null || !commentText.trim()) return;
    const copy = [...students];
    copy[selectedIdx].comments.push({
      by: userName,
      text: commentText.trim(),
    });
    setStudents(copy);
    setCommentText("");
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">My Students</h2>

      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Matric No</th>
              <th className="p-3 border">Topic</th>
              <th className="p-3 border">Stage</th>
              <th className="p-3 border">Proposal</th>
              <th className="p-3 border">Internal</th>
              <th className="p-3 border">External</th>
            </tr>
          </thead>
          <tbody>
            {students.map((stu, idx) => (
              <tr
                key={stu.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}
              >
                <td
                  className="p-3 border text-amber-700 hover:underline cursor-pointer"
                  onClick={() => setSelectedIdx(idx)}
                >
                  {stu.name}
                </td>
                <td className="p-3 border">{stu.matNo}</td>
                <td className="p-3 border">{stu.topic}</td>
                <td className="p-3 border">{stu.stage}</td>
                <td className="p-3 border">{stu.scores.proposal ?? "—"}</td>
                <td className="p-3 border">{stu.scores.internal ?? "—"}</td>
                <td className="p-3 border">{stu.scores.external ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal: view PDF & comments */}
      <Dialog
        open={selected !== null}
        onOpenChange={() => setSelectedIdx(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selected?.name}'s Submission
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-6">
              {/* PDF Download */}
              <div className="p-4 border rounded bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  Download Submitted Work:
                </p>
                <a
                  href={selected.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="text-amber-700 underline"
                >
                  {selected.topic}.pdf
                </a>
              </div>

              {/* Existing Comments */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Comments:</p>
                {selected.comments.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">
                    No comments yet.
                  </p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                    {selected.comments.map((c, i) => (
                      <li key={i}>
                        <span className="font-medium">by {c.by}:</span>{" "}
                        {c.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Add Comment */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Write your comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    className="bg-amber-700 text-white"
                    onClick={handleComment}
                  >
                    Submit Comment
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
