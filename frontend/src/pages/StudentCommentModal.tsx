// src/defense/StudentModal.tsx
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Student {
  id: string;
  name: string;
  matNo: string;
  topic: string;
  fileUrl: string | null;
  currentStage: string;
  comments: { by: string; text: string }[];
  scores: Record<string, number | null>;
  approved?: boolean;
}

interface OpenItem {
  student: Student;
  defenseId: string;
}

interface StudentModalProps {
  openItem: OpenItem | null;
  onClose: () => void;
  onAddComment: (text: string) => void;
  canComment?: boolean;
  baseUrl: string; // e.g. import.meta.env.VITE_BACKEND_URL
  token?: string | null;
}

export default function StudentCommentModal({
  openItem,
  onClose,
  onAddComment,
  canComment = true,
  baseUrl,
  token,
}: StudentModalProps) {
  const [localComment, setLocalComment] = useState("");
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  // Clear local input when modal changes
  useEffect(() => {
    setLocalComment("");
  }, [openItem]);

  if (!openItem) return null;

  const { student } = openItem;

  

 const handleDownload = async (studentId: string,) => {
    try {
      const res = await fetch(
        `${baseUrl}/project/download/${studentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`, // 👈 token included
          },
        }
      );

      if (!res.ok) {
        throw new Error(`Failed to download: ${res.status}`);
      }

      // Convert response to blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      // Create hidden link and click it
      const link = document.createElement("a");
      link.href = url;
      link.download = `project-${studentId}`; // optional file name
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  return (
    <Dialog open={!!openItem} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full">
        <DialogHeader>
          <DialogTitle>{student.name}’s Submission & Comments</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Download block */}
          <div className="p-4 border rounded bg-gray-50 flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Project file</div>
              <div className="mt-1 text-sm text-gray-800">{student.fileUrl ? "Available" : "No file uploaded"}</div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => handleDownload(student.id)}
                disabled={downloading || !student.fileUrl}
                className="inline-flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                {downloading ? "Downloading..." : "Download Project"}
              </Button>

              {/* keep original direct link if you still want it */}
              {student.fileUrl ? (
                <a
                  href={student.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-amber-700 underline"
                >
                  Open latest file
                </a>
              ) : null}
            </div>
          </div>

          {/* Comments list */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Comments</h3>
            {student.comments.length === 0 ? (
              <p className="text-gray-500 italic text-sm">No comments yet.</p>
            ) : (
              <ul className="space-y-2">
                {student.comments.map((c, i) => (
                  <li key={i} className="bg-gray-100 p-2 rounded text-sm">
                    <strong className="text-amber-700 mr-2">{c.by}:</strong>
                    <span>{c.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Add comment (if allowed) */}
          {canComment && (
            <div className="space-y-2">
              <Textarea
                placeholder="Write your comment..."
                value={localComment}
                onChange={(e) => setLocalComment(e.target.value)}
                rows={3}
              />
              <div className="flex gap-2">
                <Button
                  className="bg-amber-700 text-white flex items-center"
                  onClick={() => {
                    const txt = localComment.trim();
                    if (!txt) return;
                    onAddComment(txt);
                    setLocalComment("");
                  }}
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Save Comment
                </Button>
                <Button variant="outline" onClick={() => setLocalComment("")}>
                  Clear
                </Button>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-1" /> Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
