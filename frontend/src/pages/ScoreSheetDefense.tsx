import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Criterion {
  title: string;
  percentage: number;
}

interface Student {
  id: string;
  name: string;
  matNo: string;
  topic: string;
  scores: Record<string, number | null>;
}

interface DefenseDay {
  id: string;
  title: string;
  date: string;
  durationMinutes: number;
  level: "MSC" | "PHD";
  sessionActive?: boolean;
  students: Student[];
}

type Props = {
  defense: DefenseDay;
  criteria: Criterion[];
  canScore: boolean;
  onScoreChange: (studentId: string, crit: string, value: number) => void;
  onSubmit: () => void;
};

export default function ScoreSheetPanel({
  defense,
  criteria,
  canScore,
  onScoreChange,
  onSubmit,
}: Props) {
  // same-day check
  const isToday = (() => {
    const d = new Date(defense.date);
    const n = new Date();
    return (
      d.getFullYear() === n.getFullYear() &&
      d.getMonth() === n.getMonth() &&
      d.getDate() === n.getDate()
    );
  })();

  if (!isToday) {
    return (
      <div className="p-6 bg-white rounded shadow text-gray-600">
        Score sheet will be available on the day of the defense.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header (left big title + subtitle) */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Score Sheet</h1>
          <p className="text-sm text-gray-500 mt-1">Active Defense Day</p>
        </div>
        {/* keep reserved space on the right so layout matches screenshot — actual submit button is below */}
        <div aria-hidden className="w-40" />
      </div>

      {/* Card container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[780px] table-fixed text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-4 border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-600 text-left rounded-tl-lg">
                    Student Name
                  </th>
                  <th className="px-6 py-4 border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-600 text-left">
                    Matric No
                  </th>
                  <th className="px-6 py-4 border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-600 text-left">
                    Topic
                  </th>

                  {criteria.map((c) => (
                    <th
                      key={c.title}
                      className="px-6 py-4 border-b border-gray-200 text-xs font-semibold uppercase tracking-wide text-gray-600 text-center whitespace-nowrap"
                    >
                      <div>{c.title}</div>
                      <div className="text-[11px] text-gray-400 mt-1">
                        ({c.percentage}%)
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {defense.students.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}
                  >
                    <td className="px-6 py-6 align-middle border-b border-gray-100">
                      <div className="text-sm font-medium text-gray-900">
                        {s.name}
                      </div>
                    </td>

                    <td className="px-6 py-6 align-middle border-b border-gray-100">
                      <div className="text-sm text-gray-700">{s.matNo}</div>
                    </td>

                    <td className="px-6 py-6 align-middle border-b border-gray-100 max-w-xs truncate">
                      <div className="text-sm text-gray-700">{s.topic}</div>
                    </td>

                    {criteria.map((c) => (
                      <td
                        key={c.title}
                        className="px-6 py-6 align-middle border-b border-gray-100 text-center"
                      >
                        {canScore ? (
                          <div className="flex justify-center">
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={
                                s.scores[c.title] === null ||
                                s.scores[c.title] === undefined
                                  ? ""
                                  : String(s.scores[c.title])
                              }
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const raw = e.target.value;
                                const parsed = raw === "" ? NaN : parseInt(raw, 10);
                                // clamp and fall back to 0 when invalid (match original prop type expecting number)
                                const safe =
                                  Number.isNaN(parsed) === true
                                    ? 0
                                    : Math.max(0, Math.min(100, parsed));
                                onScoreChange(s.id, c.title, safe);
                              }}
                              className="w-20 h-12 text-sm rounded-md border border-gray-200 bg-gray-50 shadow-sm text-center"
                            />
                          </div>
                        ) : (
                          <span className="text-gray-600">
                            {s.scores[c.title] ?? "—"}
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Submit row — right aligned and visually outside the card (like screenshot) */}
      <div className="flex justify-end">
        <Button
          onClick={onSubmit}
          className="px-6 py-3 rounded-full bg-amber-700 hover:bg-amber-900 text-white"
          disabled={!canScore}
        >
          Submit Scores
        </Button>
      </div>
    </div>
  );
}
