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
  criteria: Criterion[];
  onApprove: (studentId: string) => void;
};

export default function AssessmentPanel({ students, criteria, onApprove }: Props) {
  const computeScore = (s: Student) => {
    let total = 0;
    criteria.forEach((c) => {
      const sc = s.scores[c.title];
      if (typeof sc === "number" && !isNaN(sc)) {
        total += (sc * c.percentage) / 100;
      }
    });
    // round to nearest integer like screenshot
    return Math.round(total);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Assessment</h1>
        <p className="mt-1 text-sm text-amber-700/80">
          Approve student assessments for the current defense stage.
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
              {students.map((s, idx) => {
                const score = computeScore(s);
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
                      {score}
                    </td>

                    <td className="px-6 py-6 align-middle border-b border-amber-50 text-right">
                      <div className="flex justify-end">
                        <Button
                          onClick={() => onApprove(s.id)}
                          disabled={!!s.approved}
                          className={`px-4 py-2 rounded-xl font-medium shadow-sm ${
                            s.approved
                              ? "bg-gray-100 text-gray-500 cursor-default"
                              : "bg-amber-700 hover:bg-amber-900 text-white"
                          }`}
                        >
                          {s.approved ? "Approved" : "Approve"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            {/* bottom rounded corner spacer */}
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
