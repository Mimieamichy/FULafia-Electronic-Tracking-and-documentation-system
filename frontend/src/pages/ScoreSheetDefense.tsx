// src/defense/ScoreSheetPanel.tsx
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

export default function ScoreSheetPanel({ defense, criteria, canScore, onScoreChange, onSubmit }: Props) {
  // simple same-day check
  const isToday = (() => {
    const d = new Date(defense.date);
    const n = new Date();
    return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
  })();

  if (!isToday) {
    return <div className="p-4 bg-white rounded shadow text-gray-600">Score sheet will be available on the day of the defense.</div>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full min-w-[700px] text-left border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-3 border">Matric No</th>
            <th className="p-3 border">Full Name</th>
            <th className="p-3 border">Topic</th>
            {criteria.map((c) => (
              <th key={c.title} className="p-3 border whitespace-nowrap">
                {c.title}
                <br />
                <span className="text-xs text-gray-500">({c.percentage}%)</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {defense.students.map((s, idx) => (
            <tr key={s.id} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}>
              <td className="p-3 border">{s.matNo}</td>
              <td className="p-3 border">{s.name}</td>
              <td className="p-3 border">{s.topic}</td>
              {criteria.map((c) => (
                <td key={c.title} className="p-2 border">
                  {canScore ? (
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={s.scores[c.title] ?? ""}
                      onChange={(e: any) => onScoreChange(s.id, c.title, parseInt(e.target.value, 10))}
                      className="w-16 text-sm"
                    />
                  ) : (
                    <span className="text-gray-600">{s.scores[c.title] ?? "—"}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="p-4 flex justify-end gap-2">
        <Button onClick={onSubmit} className="bg-amber-700 text-white">
          Submit Scores
        </Button>
      </div>
    </div>
  );
}
