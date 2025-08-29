import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "../AuthProvider";

type Student = {
  id: string; // derived from student._id
  matNo: string;
  name: string;
  topic: string; // project topic (fallback to project.latest.topic)
  stage: string;
  scores: {
    proposal: number | null;
    internal: number | null;
    external: number | null;
  };
  // project-specific:
  projectId?: string;
  projectVersions?: Array<{
    versionNumber: number;
    fileUrl?: string;
    topic?: string;
    comments?: { by?: string; text: string }[];
    uploadedAt?: string;
  }>;
  latestVersionIndex?: number; // index into projectVersions (latest)
  // UI-only:
  supervisorFileUrl?: string;
  comments: { by: string; text: string }[]; // comments from latest version
};

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function MyStudentsPage() {
  const { user, token } = useAuth();
  const userName = user?.userName || "Supervisor";
  // students + loading / error
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // modal / comment UI state
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [commentText, setCommentText] = useState("");

  const selected = selectedIdx !== null ? students[selectedIdx] : null;

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchMyStudents = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`${baseUrl}/student/getMyStudents`, {
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
        console.log("getMyStudents response:", raw);

        // normalize potential shapes: raw array, raw.data, raw.students
        // ... inside your fetch handler where `raw` is the response
        const arr: any[] = Array.isArray(raw)
          ? raw
          : Array.isArray(raw.data)
          ? raw.data
          : Array.isArray(raw.students)
          ? raw.students
          : [];

        const normalized: Student[] = arr.map((item: any) => {
          // handle both shapes:
          // - item may be the student directly
          // - or item may be { student: {...}, project: {...} }
          const studentObj = item.student ?? item;
          const projectObj = item.project ?? item.project ?? item.project; // may be undefined

          const stageScores = studentObj.stageScores ?? studentObj.scores ?? {};
          const proposal =
            stageScores.proposal ?? stageScores.proposalDefense ?? null;
          const internal =
            stageScores.internal ?? stageScores.internalDefense ?? null;
          const external =
            stageScores.external ?? stageScores.externalDefense ?? null;

          const first =
            studentObj.user?.firstName ?? studentObj.firstName ?? "";
          const last = studentObj.user?.lastName ?? studentObj.lastName ?? "";

          // project versions normalization
          const versions: any[] =
            Array.isArray(projectObj?.versions) &&
            projectObj.versions.length > 0
              ? projectObj.versions.slice()
              : [];

          // latest version is last in the versions array (based on your sample)
          const latestIdx = versions.length > 0 ? versions.length - 1 : -1;
          const latest = latestIdx >= 0 ? versions[latestIdx] : null;

          // derive comments from latest
          const latestComments: { by: string; text: string }[] = Array.isArray(
            latest?.comments
          )
            ? latest.comments.map((c: any) => ({
                by: c.by ?? c.uploadedBy ?? "Unknown", // ensure always a string
                text: c.text ?? c.comment ?? c.body ?? "",
              }))
            : [];

          return {
            id:
              studentObj._id ??
              studentObj.id ??
              studentObj.matricNo ??
              Math.random().toString(36).slice(2),
            matNo: studentObj.matricNo ?? studentObj.matNo ?? "",
            name: `${first} ${last}`.trim(),
            topic:
              studentObj.projectTopic ??
              latest?.topic ??
              projectObj?.topic ??
              studentObj.topic ??
              "",
            stage: studentObj.currentStage ?? "",

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
                    by: c.by ?? "Unknown",
                    text: c.text ?? "",
                  }))
                : [],
              uploadedAt: v.uploadedAt ?? v.createdAt,
            })),
            latestVersionIndex: latestIdx,

            supervisorFileUrl: "", // preserved for upload UI, if any
            comments: latestComments,
          };
        });

        if (!cancelled) setStudents(normalized);
      } catch (err: any) {
        if (!cancelled) {
          console.error("Failed to fetch my students:", err);
          setError(err?.message ?? "Failed to load students");
          setStudents([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMyStudents();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [token]);

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
    <div className="space-y-6 px-4 sm:px-6">
      <h2 className="text-2xl font-semibold text-gray-800">My Students</h2>

      <div className="overflow-x-auto rounded-lg shadow bg-white">
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
                <td className="p-3 border text-sm">{stu.matNo}</td>
                <td className="p-3 border text-sm">{stu.topic}</td>
                <td className="p-3 border text-sm">{stu.stage}</td>
                <td className="p-3 border text-sm">
                  {stu.scores.proposal ?? "—"}
                </td>
                <td className="p-3 border text-sm">
                  {stu.scores.internal ?? "—"}
                </td>
                <td className="p-3 border text-sm">
                  {stu.scores.external ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
                selected.latestVersionIndex !== undefined &&
                selected.latestVersionIndex >= 0 ? (
                  <>
                    <a
                      href={
                        selected.projectVersions[selected.latestVersionIndex]
                          .fileUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-700 underline break-all text-sm"
                    >
                      {selected.topic ||
                        `version-${
                          selected.projectVersions[selected.latestVersionIndex]
                            .versionNumber
                        }`}
                    </a>
                    <div className="text-xs text-gray-500 mt-1">
                      Version #
                      {
                        selected.projectVersions[selected.latestVersionIndex]
                          .versionNumber
                      }
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-gray-500">
                    No project file uploaded yet.
                  </div>
                )}
              </div>

              {/* Comments (from latest version) */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Comments (latest version):
                </p>
                {!selected.comments || selected.comments.length === 0 ? (
                  <p className="text-gray-500 italic text-sm">
                    No comments yet.
                  </p>
                ) : (
                  <ul className="list-disc pl-5 space-y-1 text-sm text-gray-800">
                    {selected.comments.map((c, i) => (
                      <li
                        key={i}
                        className="flex items-start justify-between gap-2"
                      >
                        <div>
                          <span className="font-medium">by {c.by}:</span>{" "}
                          {c.text}
                        </div>
                        <button
                          className="text-sm text-red-600 hover:underline ml-4"
                          // onClick={() => handleRemoveComment(i)}
                        >
                          Delete
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
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
