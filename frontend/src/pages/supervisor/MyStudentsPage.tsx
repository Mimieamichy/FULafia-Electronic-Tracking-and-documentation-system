import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../AuthProvider";
import { Download, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ---------- add after imports ----------
/** Convert a stage key like "proposal_defense" to "Proposal Defense" */
const stageDisplayMap: Record<string, string> = {
  start: "Start",
  proposal: "Proposal",
  "internal defense": "Internal Defense",
  "external defense": "External Defense",
  "proposal defense": "Proposal Defense",
  "2nd seminar": "2nd Seminar",
  "3rd seminar": "3rd Seminar",
};

function formatStage(raw: string | undefined | null): string {
  if (!raw) return "Unknown";

  const key = String(raw).trim().toLowerCase();

  if (stageDisplayMap[key]) return stageDisplayMap[key];

  // fallback: replace underscore/dash with space, split camelCase, then title-case each word
  const withSpaces = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2");

  return withSpaces
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
// ---------------------------------------

type Student = {
  id: string; // derived from student._id
  matNo: string;
  name: string;
  topic: string; // project topic (fallback to project.latest.topic)
  stage: string;
  stageKey?: string; // raw key from backend, e.g. "proposal_defense"
  stageLabel?: string; // human-friendly label, e.g. "Proposal Defense"
  department?: string;

  scores: {
    proposal: number | null;
    internal: number | null;
    external: number | null;
  };
  approvalStatus?: string;
  // project-specific:
  projectId?: string;
  projectVersions?: Array<{
    versionNumber: number;
    fileUrl?: string;
    topic?: string;
    comments?: {
      by?: string;
      text: string;
      uploadedAt?: string;
      version?: number;
    }[];
  }>;
  latestVersionIndex?: number; // index into projectVersions (latest)
  // UI-only:
  supervisorFileUrl?: string;
  comments: {
    by: string;
    text: string;
    uploadedAt?: string;
    version?: number;
  }[]; // comments from latest version
};

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function MyStudentsPage() {
  const { user, token } = useAuth();
  const userName = user?.userName || "Supervisor";
  const { toast } = useToast();
  // students + loading / error

  // two separate lists
  const [studentsMsc, setStudentsMsc] = useState<Student[]>([]);
  const [studentsPhd, setStudentsPhd] = useState<Student[]>([]);

  // track which students are currently being approved (to disable button)
  const [approvingIds, setApprovingIds] = useState<Set<string>>(new Set());

  // loading / error per degree
  const [loadingMsc, setLoadingMsc] = useState<boolean>(true);
  const [loadingPhd, setLoadingPhd] = useState<boolean>(true);
  const [errorMsc, setErrorMsc] = useState<string | null>(null);
  const [errorPhd, setErrorPhd] = useState<string | null>(null);

  // which degree tab is active
  const [selectedDegree, setSelectedDegree] = useState<"MSc" | "PhD">("MSc");

  // modal / comment UI state
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  const displayedStudents =
    selectedDegree === "MSc" ? studentsMsc : studentsPhd;

  const selected = selectedIdx !== null ? displayedStudents[selectedIdx] : null;

  // fetching my students

  const fetchMyStudentsByDegree = async (degree: "msc" | "phd") => {
    const controller = new AbortController(); // local controller for this call
    try {
      if (degree === "msc") {
        setLoadingMsc(true);
        setErrorMsc(null);
      } else {
        setLoadingPhd(true);
        setErrorPhd(null);
      }

      const res = await fetch(`${baseUrl}/student/getMyStudents/${degree}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        signal: controller.signal,
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Server returned ${res.status}: ${txt}`);
      }

      const raw = await res.json();
      const arr: any[] = Array.isArray(raw)
        ? raw
        : Array.isArray(raw.data)
        ? raw.data
        : Array.isArray(raw.students)
        ? raw.students
        : [];

      console.log("Fetched students:", arr);

      // normalization
      const normalized: Student[] = arr.map((item: any) => {
        const studentObj = item.student ?? item;
        const projectObj = item.project ?? undefined;

        const stageScores = studentObj.stageScores ?? studentObj.scores ?? {};
        const proposal =
          stageScores.proposal ?? stageScores.proposalDefense ?? null;
        const internal =
          stageScores.internal ?? stageScores.internalDefense ?? null;
        const external =
          stageScores.external ?? stageScores.externalDefense ?? null;

        const first = studentObj.user?.firstName ?? studentObj.firstName ?? "";
        const last = studentObj.user?.lastName ?? studentObj.lastName ?? "";

        const versions: any[] =
          Array.isArray(projectObj?.versions) && projectObj.versions.length > 0
            ? projectObj.versions.slice()
            : [];

        const latestIdx = versions.length > 0 ? versions.length - 1 : -1;
        const latest = latestIdx >= 0 ? versions[latestIdx] : null;

        // Collect comments across all versions
        const allComments: {
          by: string;
          text: string;
          uploadedAt?: string;
        }[] = versions.flatMap((v: any) =>
          Array.isArray(v.comments)
            ? v.comments.map((c: any) => ({
                by: c.by ?? c.authorName ?? c.author ?? "Unknown",
                text: c.text ?? c.comment ?? "",
                uploadedAt: c.date ?? c.uploadedAt ?? c.createdAt,
                version: v.versionNumber ?? v.versions ?? null,
              }))
            : []
        );

        // Sort oldest → newest
        allComments.sort((a, b) => {
          const ta = a.uploadedAt ? Date.parse(a.uploadedAt) : Infinity;
          const tb = b.uploadedAt ? Date.parse(b.uploadedAt) : Infinity;
          return ta - tb;
        });

        return {
          id:
            studentObj._id ??
            studentObj.id ??
            studentObj.matricNo ??
            
            Math.random().toString(36).slice(2),
          matNo: studentObj.matricNo ?? studentObj.matNo ?? "",
          name: `${first} ${last}`.trim(),
          department: studentObj.department,
          topic:
            studentObj.projectTopic ??
            latest?.topic ??
            projectObj?.topic ??
            studentObj.topic ??
            "",


          stage: (studentObj.currentStage ?? "").toLowerCase(),
          stageKey: (studentObj.currentStage ?? "").toLowerCase(),
          stageLabel: formatStage(studentObj.currentStage),

          approvalStatus: (studentObj.approvalStatus ?? "").toLowerCase(),
          scores: {
            proposal: typeof proposal === "number" ? proposal : null,
            internal: typeof internal === "number" ? internal : null,
            external: typeof external === "number" ? external : null,
          },
          projectId: projectObj?._id ?? projectObj?.id ?? undefined,
          projectVersions: versions.map((v: any) => ({
            versionNumber: v.versionNumber ?? v.version ?? 0,
            fileUrl: v.fileUrl ?? v.fileUrlPath ?? "",
            topic: v.topic ?? "",
            comments: Array.isArray(v.comments)
              ? v.comments.map((c: any) => ({
                  by: c.by ?? c.author ?? "Unknown",
                  text: c.text ?? c.comment ?? "",
                  uploadedAt: c.date ?? c.uploadedAt ?? c.createdAt,
                }))
              : [],
          })),
          latestVersionIndex: latestIdx,
          supervisorFileUrl: "",
          comments: allComments,
        };
      });

      if (degree === "msc") setStudentsMsc(normalized);
      else setStudentsPhd(normalized);
    } catch (err: any) {
      console.error(`Failed to fetch ${degree} students:`, err);
      if (degree === "msc") {
        setStudentsMsc([]);
        setErrorMsc(err?.message ?? "Failed to load MSc students");
      } else {
        setStudentsPhd([]);
        setErrorPhd(err?.message ?? "Failed to load PhD students");
      }
    } finally {
      if (degree === "msc") setLoadingMsc(false);
      else setLoadingPhd(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setStudentsMsc([]);
      setStudentsPhd([]);
      setLoadingMsc(false);
      setLoadingPhd(false);
      return;
    }

    fetchMyStudentsByDegree("msc");
    fetchMyStudentsByDegree("phd");
  }, [token]);

  // handle comment submission

  const handleComment = async () => {
    if (!selected || !commentText.trim()) return;

    // compute real versionNumber
    const versions = selected.projectVersions ?? [];
    const latestIdx =
      selected.latestVersionIndex ??
      (versions.length > 0 ? versions.length - 1 : -1);
    const latestVersion = versions[latestIdx];
    const versionNumber = latestVersion?.versionNumber ?? latestIdx + 1; // fallback

    if (!versionNumber) {
      console.error("No versionNumber found for selected student");
      return;
    }

    try {
      const postRes = await fetch(
        `${baseUrl}/project/comment/${selected.id}/${versionNumber}`, // plural 'comments'
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ text: commentText.trim(), by: userName }),
        }
      );

      if (!postRes.ok) {
        const txt = await postRes.text().catch(() => "");
        throw new Error(`Failed to post comment: ${postRes.status} ${txt}`);
      }

      setCommentText("");
      if (postRes.ok) {
        toast({
          title: "Comment sent",
          description: "Your comment was sent.",
          variant: "default",
        });
      }

      // refresh the appropriate degree list so selected.comments is refreshed from server
      const degreeToRefresh = selectedDegree.toLowerCase() as "msc" | "phd";
      await fetchMyStudentsByDegree(degreeToRefresh);
    } catch (err) {
      console.error("Error posting comment:", err);
    }
  };

  // handle project file download

  const handleDownload = async (studentId: string, versionNumber: number) => {
    try {
      const res = await fetch(
        `${baseUrl}/project/download/${studentId}/${versionNumber}`,
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
      link.download = `project-${studentId}-v${versionNumber}`; // optional file name
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  // handle student approval
  const handleApproveStudent = async (
    studentId: string,
    degree: "msc" | "phd"
  ) => {
    // normalize degree
    const deg = (degree ?? "msc").toLowerCase() as "msc" | "phd";

    setApprovingIds((prev) => {
      const next = new Set(prev);
      next.add(studentId);
      return next;
    });

    const url = `${baseUrl}/project/approve/${encodeURIComponent(studentId)}`;
    console.log("Approving student:", { studentId, degree: deg, url });

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          // no body required by backend
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(`Approve failed: ${res.status} ${txt}`);
      }

      // On success: prefer to re-fetch the degree list if that function exists
      if (typeof fetchMyStudentsByDegree === "function") {
        await fetchMyStudentsByDegree(deg);
      } else {
        // fallback: optimistic update of the proper list so UI reflects the change
        if (deg === "msc") {
          setStudentsMsc((prev) =>
            prev.map((s) =>
              s.id === studentId
                ? {
                    ...s,
                    approvalStatus: "approved",
                    stage: "proposal defense",
                  }
                : s
            )
          );
        } else {
          setStudentsPhd((prev) =>
            prev.map((s) =>
              s.id === studentId
                ? {
                    ...s,
                    approvalStatus: "approved",
                    stage: "proposal defense",
                  }
                : s
            )
          );
        }
      }
    } catch (err) {
      console.error("Error approving student:", err);
    } finally {
      // clear in-flight flag
      setApprovingIds((prev) => {
        const next = new Set(prev);
        next.delete(studentId);
        return next;
      });
    }
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      <h2 className="text-2xl font-semibold text-gray-800">My Students</h2>

      <div className="flex gap-2">
        {(["MSc", "PhD"] as const).map((d) => (
          <button
            key={d}
            onClick={() => setSelectedDegree(d)}
            className={`px-3 py-1 rounded ${
              selectedDegree === d
                ? "bg-amber-700 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {d} ({d === "MSc" ? studentsMsc.length : studentsPhd.length})
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg shadow bg-white">
        {displayedStudents.length === 0 ? (
          <div className="p-6 bg-white rounded shadow text-gray-600 text-center">
            No students assigned yet.
          </div>
        ) : (
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-sm">
                <th className="p-3 border">Name</th>
                <th className="p-3 border">Matric No</th>
                <th className="p-3 border">Topic</th>
                <th className="p-3 border">Stage</th>
                <th className="p-3 border">Proposal</th>
                <th className="p-3 border">Internal</th>
                <th className="p-3 border">External</th>
                <th className="p-3 border">Depertment</th>
                <th className="p-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedStudents.map((stu, idx) => (
                <tr
                  key={stu.id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}
                >
                  <td className="p-3 border capitalize">{stu.name}</td>
                  <td className="p-3 border text-sm">{stu.matNo}</td>
                  <td
                    className="p-3 border text-sm text-amber-700 hover:underline cursor-pointer capitalize"
                    onClick={() => setSelectedIdx(idx)}
                  >
                    {stu.topic}
                  </td>
                  <td className="p-3 border text-sm">{stu.stageLabel}</td>
                  <td className="p-3 border text-sm">
                    {stu.scores.proposal ?? "—"}
                  </td>
                  <td className="p-3 border text-sm">
                    {stu.scores.internal ?? "—"}
                  </td>
                  <td className="p-3 border text-sm">
                    {stu.scores.external ?? "—"}
                  </td>
                  <td className="p-3 border text-sm">
                    {stu.department ?? "—"}
                  </td>
                  <td className="p-3 border">
                    <Button
                      size="sm"
                      className="bg-amber-700 text-white"
                      onClick={() =>
                        handleApproveStudent(
                          stu.id,
                          selectedDegree.toLowerCase() as "msc" | "phd"
                        )
                      }
                      disabled={
                        approvingIds.has(stu.id) ||
                        // enabled ONLY when stage is exactly "start"
                        String(stu.stage).toLowerCase() !== "start"
                      }
                    >
                      {approvingIds.has(stu.id)
                        ? "Approving..."
                        : String(stu.stage).toLowerCase() === "start"
                        ? "Approve to Proposal"
                        : "Approved"}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Dialog
        open={selected !== null}
        onOpenChange={() => setSelectedIdx(null)}
      >
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selected?.name}'s Submission</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-6">
              {/* Latest project version file link */}
              <div className="p-4 border rounded bg-gray-50">
                <p className="text-sm text-gray-600 mb-2">
                  Latest Project File:
                </p>
                {selected.projectVersions &&
                selected.projectVersions.length > 0 ? (
                  <>
                    {(() => {
                      const latest =
                        selected.projectVersions?.[
                          selected.latestVersionIndex ?? -1
                        ];

                      return (
                        <>
                          <Button
                            className="bg-amber-700 text-white"
                            onClick={() =>
                              handleDownload(
                                selected.id,
                                selected.projectVersions[
                                  selected.latestVersionIndex
                                ].versionNumber
                              )
                            }
                          >
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </Button>

                          <div className="text-xs text-gray-500 mt-1">
                            Version #{latest.versionNumber}
                          </div>
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

              {/* Comments (from latest version) */}

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Comments :</p>

                <div className="h-64 overflow-y-auto border rounded p-3 bg-gray-50 flex flex-col gap-2">
                  {!selected?.comments || selected.comments.length === 0 ? (
                    <p className="text-gray-500 italic text-sm self-center">
                      No comments yet.
                    </p>
                  ) : (
                    selected.comments.map((c, i) => (
                      <div
                        key={i}
                        className={`relative p-2 capitalize rounded-lg max-w-[80%] text-sm ${
                          c.by === userName
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
                          {c.uploadedAt
                            ? `v${c.version ?? "?"} • ${new Date(
                                c.uploadedAt
                              ).toLocaleString([], {
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

              {/* Add new comment textarea */}
              <div className="space-y-2">
                <Textarea
                  placeholder="Write your comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full"
                />
                <div className="flex justify-end">
                  <Button
                    className="bg-amber-700 text-white"
                    onClick={handleComment}
                  >
                    <Send className="mr-1 h-4 w-4" />
                    Send
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
