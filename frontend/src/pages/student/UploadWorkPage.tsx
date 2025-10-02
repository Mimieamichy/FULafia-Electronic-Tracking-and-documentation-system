// src/pages/UploadWorkPage.tsx
import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, FileText, Download, Send } from "lucide-react";
import { useAuth } from "../AuthProvider";
import { useToast } from "@/hooks/use-toast";
import { log } from "console";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

type CommentItem = {
  by: string;
  text: string;
  uploadedAt?: string; // ISO date preferred
  versionNumber?: number;
};

export default function UploadWorkPage() {
  const { token, user } = useAuth();
  const { toast } = useToast();
  const userName = user?.userName ?? user?.email ?? "User";

  // file upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewFileName, setPreviewFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingTopic, setUploadingTopic] = useState(false);
  const [stuId, setStuId] = useState<string | null>(null);

  // project & versions
  const [projectId, setProjectId] = useState<string | null>(null);
  const [projectVersions, setProjectVersions] = useState<
    {
      versionNumber: number;
      fileUrl?: string;
      topic?: string;
      uploadedAt?: string;
      comments?: CommentItem[];
    }[]
  >([]);
  const [latestVersionIndex, setLatestVersionIndex] = useState<number>(-1);

  // aggregated comments from all versions
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loadingProject, setLoadingProject] = useState(false);

  // comment UI
  const [studentComment, setStudentComment] = useState("");
  const [sendingComment, setSendingComment] = useState(false);

  // ---------- helpers ----------
  const mapComment = (c: any, versionNumber?: number): CommentItem => {
    const authorName =
      (c.author
        ? `${c.author.firstName ?? ""} ${c.author.lastName ?? ""}`.trim()
        : undefined) ??
      c.author?.email ??
      c.by ??
      "Unknown";
    return {
      by: authorName,
      text: c.text ?? c.comment ?? c.body ?? "",
      uploadedAt: c.date ?? c.uploadedAt ?? c.createdAt ?? undefined,
      versionNumber,
    };
  };

  // Fetch canonical project and aggregate all comments across versions
  const fetchProject = async () => {
    if (!user) return;
    setLoadingProject(true);
    try {
      const studentId = String(user.id ?? "");
      const url = `${baseUrl}/project/${encodeURIComponent(studentId)}`;
      const res = await fetch(url, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const payload = await res.json().catch(() => null);
      console.log("payload:", payload);

      if (!res.ok) {
        console.warn("fetchProject non-OK", res.status);
        setProjectId(null);
        setProjectVersions([]);
        setLatestVersionIndex(-1);
        setComments([]);
        return;
      }

      const projectObj =
        payload?.project ?? payload?.data?.project ?? payload?.data ?? null;
      if (!projectObj) {
        setProjectId(null);
        setProjectVersions([]);
        setLatestVersionIndex(-1);
        setComments([]);
        return;
      }

      console.log("projectObj:", projectObj);

      const versions: any[] = Array.isArray(projectObj.versions)
        ? projectObj.versions
        : [];

      setProjectId(projectObj._id ?? projectObj.id ?? null);

      // first try payload.student._id, then fallback to payload.project.student
      const studentIdFromApi = projectObj.student;

      setStuId(studentIdFromApi);

      console.log("student _id:", studentIdFromApi);

      const mappedVersions = versions.map((v: any) => {
        const verNum = v.versionNumber ?? v.version ?? 0;
        const mappedComments = Array.isArray(v.comments)
          ? v.comments.map((c: any) => mapComment(c, verNum))
          : [];
        return {
          versionNumber: verNum,
          fileUrl: v.fileUrl ?? v.file ?? v.fileUrlPath ?? "",
          topic: v.topic ?? "",
          uploadedAt: v.uploadedAt ?? v.date ?? v.createdAt ?? undefined,
          comments: mappedComments,
        };
      });

      setProjectVersions(mappedVersions);
      const li = mappedVersions.length > 0 ? mappedVersions.length - 1 : -1;
      setLatestVersionIndex(li);

      // AGGREGATE comments across all versions into a single array
      const allComments: CommentItem[] = [];
      mappedVersions.forEach((mv) => {
        if (Array.isArray(mv.comments)) {
          mv.comments.forEach((c) => allComments.push(c));
        }
      });

      // Sort comments by date (newest first). If no date, place at end.
      // sort comments oldest -> newest, keep comments without date at the end
      allComments.sort((a, b) => {
        const ta = a.uploadedAt ? Date.parse(a.uploadedAt) : Infinity;
        const tb = b.uploadedAt ? Date.parse(b.uploadedAt) : Infinity;
        return ta - tb;
      });

      setComments(allComments);
    } catch (err) {
      console.error("fetchProject error:", err);
      setProjectId(null);
      setProjectVersions([]);
      setLatestVersionIndex(-1);
      setComments([]);
    } finally {
      setLoadingProject(false);
    }
  };

  // Post comment to the latest project version (server should set author from token)
  const postComment = async (versionNumber: number, text: string) => {
    try {
      const url = `${baseUrl}/project/comment/${encodeURIComponent(
        stuId
      )}/${encodeURIComponent(String(versionNumber))}`;
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Failed to post comment: ${res.status} ${txt}`);
      }
      // refresh canonical project data (which includes versions + comments)
      await fetchProject();
    } catch (err) {
      console.error("postComment error:", err);
      throw err;
    }
  };

  // Force download: fetch blob and use content-disposition or fallback filename
  const handleDownload = async (
    studentId: string,
    versionNumber: number,
    fileUrl?: string
  ) => {
    try {
      // Try fetching the direct file URL first so we can force a download
      if (
        fileUrl &&
        (fileUrl.startsWith("http://") || fileUrl.startsWith("https://"))
      ) {
        try {
          const res = await fetch(fileUrl, {
            headers: {
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          });
          if (res.ok) {
            const blob = await res.blob();

            // extract filename from content-disposition or from URL
            let filename = `project-${studentId}-v${versionNumber}`;
            const cd = res.headers.get("content-disposition");
            if (cd) {
              const fileNameMatch = cd.match(
                /filename\*?=(?:UTF-8'')?["']?([^;"']+)/i
              );
              if (fileNameMatch && fileNameMatch[1]) {
                try {
                  filename = decodeURIComponent(
                    fileNameMatch[1].replace(/['"]/g, "")
                  );
                } catch {
                  filename = fileNameMatch[1].replace(/['"]/g, "");
                }
              }
            } else {
              try {
                const parsed = new URL(fileUrl);
                const p = parsed.pathname.split("/").pop();
                if (p) filename = p;
              } catch {
                /* ignore */
              }
            }

            const objectUrl = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = objectUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(objectUrl);
            return;
          } else {
            console.warn("Direct fileUrl fetch returned non-OK:", res.status);
            // fall through to fallback below
          }
        } catch (err) {
          console.warn("Direct fileUrl fetch failed (maybe CORS):", err);
          // fall back to server-streaming
        }
      }

      // Fallback: stream from backend download endpoint under canonical path
      const fallbackUrl = `${baseUrl}/project/${encodeURIComponent(
        studentId
      )}/download/${encodeURIComponent(String(versionNumber))}`;
      const fallbackRes = await fetch(fallbackUrl, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!fallbackRes.ok)
        throw new Error(`Download failed: ${fallbackRes.status}`);

      const fallbackBlob = await fallbackRes.blob();

      let fallbackFilename = `project-${studentId}-v${versionNumber}`;
      const fallbackCd = fallbackRes.headers.get("content-disposition");
      if (fallbackCd) {
        const m = fallbackCd.match(/filename\*?=(?:UTF-8'')?["']?([^;"']+)/i);
        if (m && m[1]) {
          try {
            fallbackFilename = decodeURIComponent(m[1].replace(/['"]/g, ""));
          } catch {
            fallbackFilename = m[1].replace(/['"]/g, "");
          }
        }
      }

      const obj = window.URL.createObjectURL(fallbackBlob);
      const a = document.createElement("a");
      a.href = obj;
      a.download = fallbackFilename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(obj);
    } catch (err) {
      console.error("Download error:", err);
      toast({
        title: "Download failed",
        description: "Unable to download file. See console for details.",
        variant: "destructive",
      });
    }
  };

  // file input change handler (validation)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) {
      setSelectedFile(null);
      setPreviewFileName(null);
      return;
    }

    const allowedMimeTypes = new Set([
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]);
    const allowedExtensions = new Set([".pdf", ".doc", ".docx"]);
    const getExtension = (name: string) => {
      const idx = name.lastIndexOf(".");
      return idx >= 0 ? name.slice(idx).toLowerCase() : "";
    };

    const mimeOk = allowedMimeTypes.has(file.type);
    const extOk = allowedExtensions.has(getExtension(file.name));
    const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB

    if (!mimeOk && !extOk) {
      toast({
        title: "Invalid File Type",
        description: "Only PDF and Word documents are allowed.",
        variant: "destructive",
      });
      e.currentTarget.value = "";
      setSelectedFile(null);
      setPreviewFileName(null);
      return;
    }

    if (file.size > MAX_FILE_BYTES) {
      toast({
        title: "File Too Large",
        description: "Maximum allowed size is 5 MB.",
        variant: "destructive",
      });
      e.currentTarget.value = "";
      setSelectedFile(null);
      setPreviewFileName(null);
      return;
    }

    setSelectedFile(file);
    setPreviewFileName(file.name);
  };

  // Upload project file
  const handleSubmitTopic = async () => {
    if (!selectedFile) {
      toast({
        title: "File Required",
        description: "Please select a file to upload.",
        variant: "destructive",
      });
      return;
    }
    setUploadingTopic(true);
    try {
      const form = new FormData();
      form.append("project", selectedFile);
      if (user?.id) form.append("studentId", String(user.id));

      const res = await fetch(`${baseUrl}/project/upload`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: form,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Upload failed: ${res.status} ${txt}`);
      }

      setSelectedFile(null);
      setPreviewFileName(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      if (res.ok) {
        toast({
          title: "Upload successful",
          description: "Project uploaded.",
          variant: "default",
        });
      }

      await fetchProject();
    } catch (err) {
      console.error("Upload error:", err);
      toast({
        title: "Upload error",
        description: "See console for details.",
        variant: "destructive",
      });
    } finally {
      setUploadingTopic(false);
    }
  };

  // initial load
  useEffect(() => {
    if (!user?.id) return;
    void fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, user?.id]);

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <h1 className="text-2xl font-bold text-gray-800">Upload Work</h1>

      <div className="bg-white p-4 sm:p-6 rounded-lg shadow space-y-5 w-full max-w-2xl mx-auto">
        {/* File Upload */}
        <div className="space-y-1">
          <label className="text-gray-700 font-medium block">
            Upload File (PDF / DOC / DOCX, max 5MB):
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf,.doc,application/msword,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange}
            className="w-full text-sm"
          />
          {previewFileName && (
            <div className="mt-2 flex items-center gap-2 text-green-600 text-sm break-all">
              <FileText size={18} /> {previewFileName}
            </div>
          )}
        </div>

        <div className="pt-2">
          <Button
            onClick={handleSubmitTopic}
            className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white"
            disabled={uploadingTopic}
          >
            <Upload className="mr-2 h-5 w-5" />
            {uploadingTopic ? "Submitting ..." : "Submit"}
          </Button>
        </div>

        {/* Project & Comments (aggregated across versions) */}
        <div className="space-y-4 mt-4">
          <label className="text-gray-700 font-medium block">
            Project & Comments
          </label>

          <div className="p-4 border rounded bg-gray-50">
            {loadingProject ? (
              <div className="text-sm text-gray-500">Loading project…</div>
            ) : projectVersions.length > 0 && latestVersionIndex >= 0 ? (
              (() => {
                const latest = projectVersions[latestVersionIndex];
                const verNum = latest.versionNumber;
                const studentIdForDownload = String(user?.id ?? "");
                return (
                  <>
                    <div className="flex flex-col items-center">
                      <Button
                        className="bg-amber-700 text-white"
                        onClick={() =>
                          handleDownload(
                            studentIdForDownload,
                            verNum,
                            latest.fileUrl
                          )
                        }
                      >
                        <Download className="mr-1 h-4 w-4" />
                        Download
                      </Button>
                      <div className="text-xs text-gray-500">
                        Latest Version #{verNum}
                      </div>
                    </div>
                  </>
                );
              })()
            ) : (
              <div className="text-sm text-gray-500">
                No project uploaded yet.
              </div>
            )}
          </div>

          {/* Comments (ALL versions aggregated) */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">All Comments</p>

            <div className="h-64 overflow-y-auto border rounded p-3 bg-gray-50 flex flex-col gap-2">
              {loadingProject ? (
                <p className="text-sm text-gray-500 self-center">
                  Loading comments…
                </p>
              ) : comments.length === 0 ? (
                <p className="text-gray-500 italic text-sm self-center">
                  No comments yet.
                </p>
              ) : (
                comments.map((c, i) => (
                  <div
                    key={`${c.uploadedAt ?? i}-${i}`}
                    className={`relative p-2 rounded-lg capitalize max-w-[100%] text-sm ${
                      (c.by || "").toLowerCase() ===
                      (userName || "").toLowerCase()
                        ? "bg-amber-200 self-end text-right"
                        : "bg-white self-start text-left border"
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <div className="font-medium text-xs text-gray-600">
                        {c.by}
                      </div>
                    </div>
                    <div className="mt-1 whitespace-pre-wrap">{c.text}</div>
                    <div className="text-[10px] text-gray-500 mt-1 text-right">
                      {c.versionNumber ? `v${c.versionNumber}` : ""}
                      {c.uploadedAt
                        ? ` • ${new Date(c.uploadedAt).toLocaleString()}`
                        : ""}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add new comment textarea -> posts to latest version */}
            <div className="space-y-2">
              <Textarea
                placeholder="Write your comment..."
                value={studentComment}
                onChange={(e) => setStudentComment(e.target.value)}
                className="w-full"
              />
              <div className="flex justify-end">
                <Button
                  className="bg-amber-700 text-white"
                  onClick={async () => {
                    if (!studentComment.trim()) return;
                    if (latestVersionIndex < 0) {
                      toast({
                        title: "No project version",
                        description:
                          "There is no uploaded project version to comment on.",
                        variant: "destructive",
                      });
                      return;
                    }
                    setSendingComment(true);
                    try {
                      const verNum =
                        projectVersions[latestVersionIndex].versionNumber;

                      await postComment(verNum, studentComment.trim());
                      setStudentComment("");
                      toast({
                        title: "Comment sent",
                        description: "Your comment was sent.",
                        variant: "default",
                      });
                    } catch (err) {
                      console.error("Error posting comment:", err);
                      toast({
                        title: "Failed to send comment",
                        description: "See console for details.",
                        variant: "destructive",
                      });
                    } finally {
                      setSendingComment(false);
                    }
                  }}
                  disabled={sendingComment}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {sendingComment ? "Sending..." : "Send"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
