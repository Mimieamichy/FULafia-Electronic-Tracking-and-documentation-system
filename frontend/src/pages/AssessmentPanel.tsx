// src/defense/AssessmentPanel.tsx
import { Button } from "@/components/ui/button";

interface Criterion {
  title: string;
  percentage: number;
}

interface Student {
  id: string;
  name: string;
  matNo: string;
  topic?: string;
  fileUrl?: string;
  currentStage: string;
  comments?: { by: string; text: string }[];
  scores: Record<string, number | null>;
  approved?: boolean;
  defenceMarked?: boolean;
}

type Props = {
  students: Student[];
  criteria: Criterion[]; // kept for compatibility but not used
  onApprove: (studentId: string) => void;
  onReject?: (studentId: string) => void;
  processingIds?: Record<string, boolean>;
  defense: any; // new optional prop: current defense details from parent
  defenseStageLabel: string; // new optional prop: formatted defense stage label from parent
  defenseStage: string; // new optional prop: current defense stage from parent
};

export default function AssessmentPanel({
  students,
  criteria,
  onApprove,
  onReject,
  processingIds = {},
  defenseStage,
  defense,
  defenseStageLabel
  
}: Props) {
  // Simple stage -> score lookup (no weighted computation)
  const getStageScore = (s: Student): { value: number; label: string } => {
    // normalize stage: "proposal_defense" -> "proposal defense"
    const rawStage = String(s.currentStage ?? "")
      .toLowerCase()
      .replace(/[_-]+/g, " ")
      .trim();

    // safe reader for numeric keys
    const read = (k?: string) => {
      if (!k) return 0;
      const v = (s.scores ?? {})[k];
      return typeof v === "number" && !isNaN(v) ? Math.round(v) : 0;
    };

    // ordered, specific mappings (most specific first)
    if (
      /\bproposal defense\b/.test(rawStage) ||
      /\bproposal defense\b/.test(rawStage)
    ) {
      if ("firstSeminarScore" in (s.scores ?? {})) {
        return { value: read("firstSeminarScore"), label: "Proposal Defense" };
      }
      if ("proposalScore" in (s.scores ?? {})) {
        return { value: read("proposalScore"), label: "Proposal" };
      }
    }

    if (/\bproposal\b/.test(rawStage)) {
      if ("proposalScore" in (s.scores ?? {})) {
        return { value: read("proposalScore"), label: "Proposal" };
      }
      if ("firstSeminarScore" in (s.scores ?? {})) {
        // fallback if backend uses firstSeminarScore for proposal
        return { value: read("firstSeminarScore"), label: "Proposal Defense" };
      }
    }

    if (
      /\b2nd seminar\b|\bsecond seminar\b|\b2nd\b|\bsecond\b/.test(rawStage)
    ) {
      if ("secondSeminarScore" in (s.scores ?? {})) {
        return { value: read("secondSeminarScore"), label: "2nd Seminar" };
      }
    }

    if (/\b3rd seminar\b|\bthird seminar\b|\b3rd\b|\bthird\b/.test(rawStage)) {
      if ("thirdSeminarScore" in (s.scores ?? {})) {
        return { value: read("thirdSeminarScore"), label: "3rd Seminar" };
      }
    }

    if (/\binternal\b/.test(rawStage)) {
      if ("internalScore" in (s.scores ?? {})) {
        return { value: read("internalScore"), label: "Internal" };
      }
    }

    if (/\bexternal\b/.test(rawStage)) {
      if ("externalDefenseScore" in (s.scores ?? {})) {
        return {
          value: read("externalDefenseScore"),
          label: "External Defense",
        };
      }
      if ("externalScore" in (s.scores ?? {})) {
        return { value: read("externalScore"), label: "External" };
      }
    }

    // prefer common keys if stage text didn't match
    const prefer = [
      "firstSeminarScore",
      "proposalScore",
      "internalScore",
      "externalScore",
      "externalDefenseScore",
      "secondSeminarScore",
      "thirdSeminarScore",
    ];
    for (const k of prefer) {
      if (k in (s.scores ?? {})) {
        const label =
          k === "firstSeminarScore"
            ? "Proposal Defense"
            : k === "proposalScore"
            ? "Proposal"
            : k === "internalScore"
            ? "Internal"
            : k === "externalScore"
            ? "External"
            : k === "externalDefenseScore"
            ? "External Defense"
            : k === "secondSeminarScore"
            ? "2nd Seminar"
            : k === "thirdSeminarScore"
            ? "3rd Seminar"
            : "Score";
        return { value: read(k), label };
      }
    }

    // final fallback: first numeric key found
    const firstNumericKey = Object.entries(s.scores ?? {}).find(
      ([, v]) => typeof v === "number" && !isNaN(v)
    )?.[0];
    if (firstNumericKey) {
      const prettyLabel = firstNumericKey
        .replace(/([A-Z])/g, " $1")
        .replace(/_/g, " ")
        .trim();
      return { value: read(firstNumericKey), label: prettyLabel || "Score" };
    }

    // nothing available
    return { value: 0, label: "Score" };
  };

 
  

  // Filter out students that have been approved for the current defense stage
  const visibleStudents = students.filter((s) => s.defenceMarked !== true);

  const canShow = (() => {
    const defenseDate = new Date(defense.date);
    const now = new Date();
    return now >= defenseDate;
  })();

  if (!canShow) {
    return (
      <div className="p-6 bg-white rounded shadow text-gray-600">
        Assessment Table will be available on the day of the defense.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Assessment</h1>
        <p className="mt-1 text-sm text-amber-700/80">
          Approve or reject student assessments for the current defense stage.
        </p>
      </div>

      {/* Card */}
      <div className="bg-white border border-blue-50 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] table-fixed text-left border-collapse">
            <thead>
              <tr className="bg-amber-50">
                <th className="px-6 py-4 align-middle border-b border-amber-100 text-xs font-semibold uppercase tracking-wider text-amber-800 rounded-tl-lg">
                  Matric No
                </th>
                <th className="px-6 py-4 align-middle border-b border-amber-100 text-xs font-semibold uppercase tracking-wider text-amber-800">
                  Full Name
                </th>
                <th className="px-6 py-4 align-middle border-b border-amber-100 text-xs font-semibold uppercase tracking-wider text-amber-800 text-center">
                  Current Stage
                </th>
                <th className="px-6 py-4 align-middle border-b border-amber-100 text-xs font-semibold uppercase tracking-wider text-amber-800 text-center">
                  Score
                </th>
                <th className="px-6 py-4 align-middle border-b border-amber-100 text-xs font-semibold uppercase tracking-wider text-amber-800 rounded-tr-lg text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {visibleStudents.map((s, idx) => {
                const { value: score } = getStageScore(s);
                const processing = !!processingIds[s.id];
                return (
                  <tr
                    key={s.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}
                  >
                    <td className="px-6 py-6 align-middle border-b border-amber-50 text-sm text-gray-800">
                      {s.matNo}
                    </td>

                    <td className="px-6 py-6 align-middle border-b border-amber-50 text-sm text-gray-800 capitalize">
                      {s.name}
                    </td>

                    <td className="px-6 py-6 align-middle border-b border-amber-50 text-sm text-gray-800 text-center">
                      <span className="inline-block">{defenseStageLabel}</span>
                    </td>

                    <td className="px-6 py-6 align-middle border-b border-amber-50 text-sm font-medium text-gray-900 text-center">
                      <div>{score}</div>
                    </td>

                    <td className="px-6 py-6 align-middle border-b border-amber-50 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          onClick={() => onApprove(s.id)}
                          disabled={!!s.approved || processing}
                          className={`px-4 py-2 rounded-xl font-medium shadow-sm ${
                            s.approved
                              ? "bg-gray-100 text-gray-500 cursor-default"
                              : "bg-amber-700 hover:bg-amber-900 text-white"
                          }`}
                        >
                          {processing
                            ? "Working..."
                            : s.approved
                            ? "Approved"
                            : "Approve"}
                        </Button>

                        <Button
                          onClick={() => {
                            if (!onReject) return;
                            const ok = confirm(
                              `Are you sure you want to reject ${s.name}'s assessment?`
                            );
                            if (!ok) return;
                            onReject(s.id);
                          }}
                          disabled={processing}
                          className={`px-4 py-2 rounded-xl font-medium shadow-sm border ${
                            processing
                              ? "bg-gray-50 text-gray-400"
                              : "bg-white text-amber-700 hover:bg-red-50"
                          }`}
                        >
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr>
                <td colSpan={5} className="h-2 bg-transparent" />
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
