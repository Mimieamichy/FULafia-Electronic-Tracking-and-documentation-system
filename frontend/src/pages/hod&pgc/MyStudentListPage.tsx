import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type Student = {
  name: string;
  matNo: string;
  proposal: number | null;
  internal: number | null;
  external: number | null;
  fileUrl: string;
  comments: { by: string; text: string }[];
};

const initialStudents: Student[] = [
  {
    name: "Camilla Park",
    matNo: "220976762",
    proposal: 85,
    internal: 90,
    external: 88,
    fileUrl: "https://example.com/sample.pdf",
    comments: [
      { by: "Dr. Moses", text: "Great improvement since last review." },
    ],
  },
  {
    name: "Jacob Philip",
    matNo: "220976765",
    proposal: 75,
    internal: 70,
    external: null,
    fileUrl: "https://example.com/sample.pdf",
    comments: [],
  },
];

const MyStudentListPage = () => {
  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<
    number | null
  >(null);
  const [comment, setComment] = useState("");

  const selectedStudent =
    selectedStudentIndex !== null ? students[selectedStudentIndex] : null;

  const handleCommentSubmit = () => {
    if (!comment.trim() || selectedStudentIndex === null) return;

    const updated = [...students];
    updated[selectedStudentIndex].comments.push({
      by: "Dr. Moses", // hardcoded for now
      text: comment.trim(),
    });

    setStudents(updated);
    setComment("");
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Assigned Students
      </h2>

      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Matric No</th>
              <th className="p-3 border">Proposal</th>
              <th className="p-3 border">Internal</th>
              <th className="p-3 border">External</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                <td
                  className="p-3 border text-amber-700 hover:underline cursor-pointer"
                  onClick={() => setSelectedStudentIndex(i)}
                >
                  {s.name}
                </td>
                <td className="p-3 border">{s.matNo}</td>
                <td className="p-3 border">{s.proposal ?? "—"}</td>
                <td className="p-3 border">{s.internal ?? "—"}</td>
                <td className="p-3 border">{s.external ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for PDF + Comments */}
      <Dialog
        open={selectedStudent !== null}
        onOpenChange={() => setSelectedStudentIndex(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {selectedStudent?.name}'s Submission
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-5">
              <div className="bg-gray-50 border rounded p-4">
                <p className="text-sm text-gray-600 mb-1">Submitted PDF:</p>
                <a
                  href={selectedStudent.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="text-amber-700 underline text-sm"
                >
                  Download PDF
                </a>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Comments:</p>
                {selectedStudent.comments.length === 0 ? (
                  <p className="text-gray-500 text-sm italic">
                    No comments yet.
                  </p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                    {selectedStudent.comments.map((c, idx) => (
                      <li key={idx}>
                        <span className="font-medium text-amber-700">
                          by {c.by}:
                        </span>{" "}
                        {c.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <Textarea
                  placeholder="Write your comment..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <Button
                  onClick={handleCommentSubmit}
                  className="bg-amber-700 text-white"
                >
                  Submit Comment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MyStudentListPage;
