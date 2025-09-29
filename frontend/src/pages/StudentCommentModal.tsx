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
  // optional raw flag for optimistic items
  _optimistic?: boolean;
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
  currentUserName: string;
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

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

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

  // === Helper: normalize API response to CommentItem[]
  const normalizeFromApi = (raw: any): CommentItem[] => {
    if (!raw) return [];
    // common shape: { success: true, message: "...", data: [ { author: {...}, text, createdAt, _id } ] }
    let arr: any[] = [];
    if (Array.isArray(raw)) arr = raw;
    else if (Array.isArray(raw.data)) arr = raw.data;
    else if (Array.isArray(raw.comments)) arr = raw.comments;
    else return [];

    const mapped = arr.map((it: any) => {
      const author = it?.author;
      const by =
        (author && `${author.firstName ?? ""} ${author.lastName ?? ""}`.trim()) ||
        author?.email ||
        it?.by ||
        "Unknown";
      return {
        id: it?._id ?? it?.id ?? `${by}-${it?.createdAt ?? Math.random()}`,
        by,
        text: it?.text ?? it?.message ?? "",
        createdAt: it?.createdAt ?? it?.created_at ?? undefined,
      } as CommentItem;
    });

    // dedupe by id, keeping order
    const seen = new Set<string>();
    return mapped.filter((m) => {
      if (!m.id) return true;
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  };

  // fetch comments (robust to multiple shapes)
  async function fetchComments() {
    if (!openItem?.student?.id) return;
    setLoadingComments(true);

    try {
      const url = `${baseUrl}/project/defence-comments/${encodeURIComponent(
        openItem.student.id
      )}/${encodeURIComponent(openItem.defenseId)}`;

      console.log("fetching comments from", url);

      const res = await fetch(url, { headers: { ...authHeaders } });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        console.warn("GET comments failed", res.status, txt);
        // fallback to existing student.comments if available
        setComments(
          Array.isArray(openItem.student.comments)
            ? openItem.student.comments
            : []
        );
        return;
      }

      let parsed: any = null;
      try {
        parsed = await res.json();
      } catch {
        parsed = null;
      }
      console.log("fetched comments (raw):", parsed);

      const normalized = normalizeFromApi(parsed);
      // merge with any optimistic local comments (keep optimistic ones that server hasn't returned yet)
      setComments((prev) => {
        const optimistic = prev.filter((c) => c._optimistic);
        // dedupe server list against optimistic by text+createdAt if no id
        const serverIds = new Set(normalized.map((n) => n.id));
        const remainingOptimistic = optimistic.filter(
          (o) => ![...serverIds].some((id) => id === o.id)
        );
        return [...normalized, ...remainingOptimistic].sort((a, b) => {
          // sort by createdAt ascending; fallback keep original order
          const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return ta - tb;
        });
      });
    } catch (err) {
      console.error("fetchComments error", err);
      setComments(
        Array.isArray(openItem.student.comments) ? openItem.student.comments! : []
      );
    } finally {
      setLoadingComments(false);
    }
  }

  // Polling: start immediate fetch and poll every 3s while modal open
  useEffect(() => {
    if (!openItem) return;
    // immediately fetch once
    void fetchComments();
    const id = window.setInterval(() => {
      void fetchComments();
    }, 3000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openItem?.student?.id, openItem?.defenseId, token, baseUrl]);

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
    if (!openItem?.student?.id) {
      toast({
        title: "No student",
        description: "No student selected.",
        variant: "destructive",
      });
      return;
    }

    // optimistic update: show immediately
    const optimisticId = `tmp-${Date.now()}`;
    const optimistic: CommentItem = {
      id: optimisticId,
      by: currentUserName ?? "You",
      text,
      createdAt: new Date().toISOString(),
      _optimistic: true,
    };
    console.log("by:", currentUserName);
    
    setComments((c) => [...c, optimistic]);
    setLocalComment("");
    // keep parent callback backward compatible
    try {
      onAddComment(text);
    } catch {}

    setPosting(true);
    try {
      const url = `${baseUrl}/project/defence-comments/${encodeURIComponent(
        openItem.student.id
      )}/${encodeURIComponent(openItem.defenseId)}`;

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ text }),
      });

      const raw = await res.text();
      let parsed: any = null;
      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch {
        parsed = raw;
      }

      console.log("post comment response", res.status, raw);

      if (!res.ok) {
        const msg =
          (parsed && (parsed.message || parsed.error)) ||
          `Server ${res.status}`;
        throw new Error(msg);
      }

      // On success re-fetch to get server timestamps / ids and replace optimistic
      await fetchComments();

      toast({
        title: "Comment added",
        description: "Your comment was submitted.",
        variant: "default",
      });
    } catch (err: any) {
      console.error("post comment error", err);
      // remove optimistic comment on failure
      setComments((prev) => prev.filter((c) => c.id !== optimisticId));
      toast({
        title: "Post failed",
        description: err?.message || "Could not submit comment.",
        variant: "destructive",
      });
    } finally {
      setPosting(false);
    }
  }

  // ===== Render - match screenshot exactly as Tailwind allows =====
  if (!openItem) return null;
  const { student } = openItem;

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
                <Button
                  className="bg-amber-700 text-white"
                  onClick={() => handleDownload(student.id)}
                  disabled={downloading || !student.fileUrl}
                >
                  <Download className="mr-1 h-4 w-4" />
                  {downloading ? "Downloading..." : "Download"}
                </Button>
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

              <div
                ref={scrollRef}
                className="h-64 overflow-y-auto border rounded p-3 bg-gray-50 flex flex-col gap-2"
              >
                {loadingComments && comments.length === 0 ? (
                  <p className="text-gray-500 italic text-sm self-center">
                    Loading comments...
                  </p>
                ) : !comments || comments.length === 0 ? (
                  <p className="text-gray-500 italic text-sm self-center">
                    No comments yet.
                  </p>
                ) : (
                  comments.map((c, i) => (
                    <div
                      key={c.id ?? i}
                      className={`relative p-2 capitalize rounded-lg max-w-[80%] text-sm ${
                        c.by === currentUserName
                          ? "bg-amber-200 self-end text-right"
                          : "bg-white self-start text-left border"
                      } ${c._optimistic ? "opacity-80" : ""}`}
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
