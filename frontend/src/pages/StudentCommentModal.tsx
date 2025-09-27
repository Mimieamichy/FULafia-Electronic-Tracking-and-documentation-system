// src/defense/StudentCommentModal.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Download, Send, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommentItem {
  id?: string;
  by: string;
  text: string;
  createdAt?: string; // ISO timestamp
}

interface Student {
  id: string;
  name: string;
  matNo: string;
  topic?: string;
  fileUrl: string | null;
  fileVersion?: string | null;
  comments?: CommentItem[];
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
  baseUrl: string;
  token?: string | null;
  currentUserName?: string;
}

export default function StudentCommentModal({
  openItem,
  onClose,
  onAddComment,
  canComment = true,
  baseUrl,
  token,
  currentUserName,
}: StudentModalProps) {
  // ===== Hooks (always at top-level) =====
  const [localComment, setLocalComment] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);

  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement | null>(null);


  // clear state when modal changes
  useEffect(() => {
    setLocalComment("");
    setComments([]);
  }, [openItem]);

  // auto-scroll when comments update
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const t = window.setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 60);
    return () => clearTimeout(t);
  }, [comments]);

  // fetch comments when openItem changes
  useEffect(() => {
    if (!openItem) return;
    void fetchComments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openItem?.student?.id, openItem?.defenseId]);

  // early return guard (hooks above — no hooks after this)
  if (!openItem) return null;
  const { student } = openItem;

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  async function fetchComments() {
    if (!student?.id) return;
    setLoadingComments(true);
    try {
      const url = `${baseUrl}/project/defence-comments/${encodeURIComponent(
        student.id
      )}/${encodeURIComponent(openItem.defenseId)}`;

      const res = await fetch(url, { headers: { ...authHeaders } });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.warn("GET comments failed", res.status, txt);
        setComments(Array.isArray(student.comments) ? student.comments! : []);
        return;
      }

      const parsed = await res.json().catch(() => null);
      console.log("fetched comments",  parsed);

      
      
      if (Array.isArray(parsed)) setComments(parsed);
      else if (parsed && Array.isArray(parsed.comments))
        setComments(parsed.comments);
      else
        setComments(Array.isArray(student.comments) ? student.comments! : []);
    } catch (err) {
      console.error("fetchComments error", err);
      setComments(Array.isArray(student.comments) ? student.comments! : []);
    } finally {
      setLoadingComments(false);
    }
  }


  async function handleDownload(studentId: string) {
    try {
      setDownloading(true);
      const res = await fetch(`${baseUrl}/project/download/${studentId}`, {
        headers: { ...authHeaders },
      });
      if (!res.ok) throw new Error(`Download failed ${res.status}`);

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      // try extract filename
      const disposition = res.headers.get("content-disposition") || "";
      const m = disposition.match(/filename="?([^";]+)"?/);
      link.download = m ? m[1] : `project-${studentId}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error("download error", err);
      toast({
        title: "Download failed",
        description: err?.message || "",
        variant: "destructive",
      });
    } finally {
      setDownloading(false);
    }
  }

  async function handleSubmitComment() {
    const text = localComment.trim();
    if (!text) {
      toast({
        title: "Empty comment",
        description: "Write something before submitting.",
        variant: "destructive",
      });
      return;
    }
    if (!student?.id) {
      toast({
        title: "No student",
        description: "No student selected.",
        variant: "destructive",
      });
      return;
    }

    setPosting(true);
    try {
      const url = `${baseUrl}/project/defence-comments/${encodeURIComponent(
        student.id
      )}/${encodeURIComponent(openItem.defenseId)}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ text }),
      });

      const raw = await res.text();
      let parsed: any = null;
      console.log("post comment response", res.status, raw);
      
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch {
        parsed = raw;
      }

      if (!res.ok) {
        const msg =
          (parsed && (parsed.message || parsed.error)) ||
          `Server ${res.status}`;
        throw new Error(msg);
      }

      // keep parent callback for backwards compatibility
      try {
        onAddComment(text);
      } catch {}

      // re-fetch comments to get server timestamps and ordering
      await fetchComments();
      setLocalComment("");
      toast({
        title: "Comment added",
        description: "Your comment was submitted.",
        variant: "default",
      });
    } catch (err: any) {
      console.error("post comment error", err);
      toast({
        title: "Post failed",
        description: err?.message || "Could not submit comment.",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  }

  // ===== Render - match screenshot exactly as close as Tailwind allows =====
  return (
    <Dialog open={!!openItem} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <div className="text-lg font-semibold">
              {student.name}'s Submission
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 px-2 pb-4">
          {/* Top download card - matches screenshot styling */}
          <div className="p-4 border rounded bg-gray-50">
            <p className="text-sm text-gray-600 mb-2">Project File:</p>
            {student.fileUrl ? (
              <>
                {(() => {
                  return (
                    <>
                      <Button
                        className="bg-amber-700 text-white"
                        onClick={() => handleDownload(student.id)}
                        disabled={downloading || !student.fileUrl}
                      >
                        <Download className="mr-1 h-4 w-4" />
                        {downloading ? "Downloading..." : "Download"}
                      </Button>
                    </>
                  );
                })()}
              </>
            ) : (
              <div className="text-sm text-gray-500">
                No project file uploaded yet.
              </div>
            )}
          </div>

          {/* Comments panel */}
          <div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Comments :</p>

              <div className="h-64 overflow-y-auto border rounded p-3 bg-gray-50 flex flex-col gap-2">
                {!comments || comments.length === 0 ? (
                  <p className="text-gray-500 italic text-sm self-center">
                    No comments yet.
                  </p>
                ) : (
                  comments.map((c, i) => (
                    <div
                      key={i}
                      className={`relative p-2 capitalize rounded-lg max-w-[80%] text-sm ${
                        c.by === currentUserName
                          ? "bg-amber-200 self-end text-right"
                          : "bg-white self-start text-left border"
                      }`}
                    >
                      <div className="font-medium text-xs text-gray-600 mb-1">
                        {c.by}
                      </div>
                      <div>{c.text}</div>

                      {/* timestamp bottom-right */}
                      <div className="text-[10px] text-gray-500 mt-1 text-right">
                        {c.createdAt
                          ? `${new Date(c.createdAt).toLocaleString([], {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : ""}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* bottom input area */}
            {canComment && (
                <div className="space-y-2 m-4">
                  <Textarea
                    value={localComment}
                    onChange={(e) => setLocalComment(e.target.value)}
                    placeholder="Write your comment..."
                    rows={3}
                    className="w-full"
                  />

                  <div className="flex items-end">
                    <Button
                      onClick={handleSubmitComment}
                      disabled={posting}
                      className="bg-amber-700 text-white px-4 py-2 rounded-md flex items-center"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      {posting ? "Sending..." : "Send"}
                    </Button>
                  </div>
                </div>
              
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
