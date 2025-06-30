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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-6">
        Assigned Students
      </h2>

      <div className="overflow-x-auto rounded-lg shadow bg-white">
        <table className="min-w-[600px] w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-sm sm:text-base">
              <th className="p-3 border whitespace-nowrap">Name</th>
              <th className="p-3 border whitespace-nowrap">Matric No</th>
              <th className="p-3 border whitespace-nowrap">Proposal</th>
              <th className="p-3 border whitespace-nowrap">Internal</th>
              <th className="p-3 border whitespace-nowrap">External</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s, i) => (
              <tr
                key={i}
                className={i % 2 === 0 ? "bg-white" : "bg-amber-50"}
              >
                <td
                  className="p-3 border text-amber-700 hover:underline cursor-pointer whitespace-nowrap"
                  onClick={() => setSelectedStudentIndex(i)}
                >
                  {s.name}
                </td>
                <td className="p-3 border whitespace-nowrap">{s.matNo}</td>
                <td className="p-3 border whitespace-nowrap">{s.proposal ?? "—"}</td>
                <td className="p-3 border whitespace-nowrap">{s.internal ?? "—"}</td>
                <td className="p-3 border whitespace-nowrap">{s.external ?? "—"}</td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No students assigned.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for PDF + Comments */}
      <Dialog
        open={selectedStudent !== null}
        onOpenChange={() => setSelectedStudentIndex(null)}
      >
        <DialogContent className="max-w-full sm:max-w-2xl p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {selectedStudent?.name}&apos;s Submission
            </DialogTitle>
          </DialogHeader>

          {selectedStudent && (
            <div className="space-y-6 mt-4">
              <div className="bg-gray-50 border rounded p-4">
                <p className="text-sm sm:text-base text-gray-600 mb-2">
                  Submitted PDF:
                </p>
                <a
                  href={selectedStudent.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="text-amber-700 underline text-sm sm:text-base"
                >
                  Download PDF
                </a>
              </div>

              <div>
                <p className="text-sm sm:text-base font-medium text-gray-700 mb-2">
                  Comments:
                </p>
                {selectedStudent.comments.length === 0 ? (
                  <p className="text-gray-500 italic text-sm sm:text-base">
                    No comments yet.
                  </p>
                ) : (
                  <ul className="list-disc pl-6 space-y-1 text-sm sm:text-base text-gray-800 max-h-48 overflow-y-auto">
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
                  className="w-full min-h-[100px]"
                />
                <Button
                  onClick={handleCommentSubmit}
                  className="w-full sm:w-auto bg-amber-700 text-white"
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
