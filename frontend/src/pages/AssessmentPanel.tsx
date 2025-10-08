// src/defense/AssessmentPanel.tsx
import React from "react";
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
}

type Props = {
  students: Student[];
  criteria: Criterion[]; // kept for compatibility but not used
  onApprove: (studentId: string) => void;
  onReject?: (studentId: string) => void;
  processingIds?: Record<string, boolean>;
  defense: any; // new optional prop: current defense details from parent
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
}: Props) {
  // Simple stage -> score lookup (no weighted computation)
  const getStageScore = (s: Student): { value: number; label: string } => {
    const stage = (s.currentStage ?? "").toLowerCase();

    const mapping: Array<{ re: RegExp; key: string; label: string }> = [
      { re: /proposal/, key: "proposalScore", label: "Proposal" },
      { re: /internal/, key: "internalScore", label: "Internal" },
      { re: /external/, key: "externalScore", label: "External" },
      { re: /defense|defence|final/, key: "internalScore", label: "Defense" },
    ];

    const found = mapping.find((m) => m.re.test(stage));
    let chosenKey = found?.key;
    let chosenLabel = found?.label ?? "Score";

    if (!chosenKey) {
      // prefer common keys if present
      const prefer = ["internalScore", "proposalScore", "externalScore"];
      chosenKey = prefer.find((k) => k in (s.scores || {}));
      if (chosenKey) {
        chosenLabel =
          chosenKey === "proposalScore"
            ? "Proposal"
            : chosenKey === "internalScore"
            ? "Internal"
            : chosenKey === "externalScore"
            ? "External"
            : "Score";
      } else {
        // fallback to first numeric key in s.scores
        const firstNumericKey = Object.entries(s.scores || {}).find(
          ([, v]) => typeof v === "number" && !isNaN(v)
        )?.[0];
        chosenKey = firstNumericKey;
        chosenLabel = firstNumericKey ?? "Score";
      }
    }

    const rawVal = chosenKey ? (s.scores?.[chosenKey] as any) : undefined;
    const numeric =
      typeof rawVal === "number" && !isNaN(rawVal) ? Math.round(rawVal) : 0;

    return { value: numeric, label: chosenLabel };
  };

  // Normalize defenseStage for comparison
  const normalizedDefenseStage = (defenseStage ?? "").toLowerCase().trim();
  console.log("Current defense stage:", normalizedDefenseStage);

  // Filter out students that have been approved for the current defense stage
  const visibleStudents = students.filter((s) => {
    if (
      (s.currentStage ?? "").toLowerCase().trim() !== normalizedDefenseStage
    ) {
      return false; // hide this student
    }
    return true;
  });

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
                      <span className="inline-block">{s.currentStage}</span>
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
