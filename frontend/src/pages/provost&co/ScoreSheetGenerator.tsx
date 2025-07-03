// src/pgc/ScoreSheetGenerator.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "../AuthProvider"; // adjust path as needed

interface Criterion {
  title: string;
  percentage: number;
}

interface Student {
  matNo: string;
  name: string;
  topic: string;
}

// Mock fetch
async function fetchStudentsByStage(stage: string): Promise<Student[]> {
  const dummy: Record<string, Student[]> = {
    "First Seminar": [
      { matNo: "220976780", name: "John Doe", topic: "Quantum Computing" },
      { matNo: "220976781", name: "Jane Smith", topic: "Renewable Energy" },
    ],
    "Second Seminar": [
      { matNo: "220976782", name: "Jim Bean", topic: "Cybersecurity" },
      { matNo: "220976783", name: "Jenny Lane", topic: "Data Mining" },
    ],
    "Third Seminar": [{ matNo: "220976784", name: "Paul Allen", topic: "AI Ethics" }],
    "External Defense": [
      { matNo: "220976785", name: "Lisa Ray", topic: "Blockchain Voting" },
      { matNo: "220976786", name: "Mark Twain", topic: "Nanotechnology" },
    ],
  };
  return dummy[stage] || [];
}

export default function ScoreSheetGenerator() {
  const { role } = useAuth();
  const isProvost = role === "PROVOST";

  const allStages = [
    "First Seminar",
    "Second Seminar",
    "Third Seminar",
    "External Defense",
  ];
  const allowedStages = isProvost
    ? ["External Defense"]
    : allStages.slice(0, 3);

  const [stage, setStage] = useState<string>(
    isProvost ? "External Defense" : "First Seminar"
  );
  const [criteria, setCriteria] = useState<Criterion[]>([
    { title: "Clarity", percentage: 30 },
    { title: "Originality", percentage: 70 },
  ]);
  const [newCriterion, setNewCriterion] = useState("");
  const [newPercentage, setNewPercentage] = useState("");
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    fetchStudentsByStage(stage).then(setStudents);
  }, [stage]);

  const totalPercentage = criteria.reduce((sum, c) => sum + c.percentage, 0);
  const isTotalValid = totalPercentage === 100;

  const handleAddCriterion = () => {
    const title = newCriterion.trim();
    const percentage = parseFloat(newPercentage);
    if (
      !title ||
      isNaN(percentage) ||
      percentage <= 0 ||
      percentage > 100 ||
      criteria.some((c) => c.title.toLowerCase() === title.toLowerCase())
    )
      return;
    setCriteria([...criteria, { title, percentage }]);
    setNewCriterion("");
    setNewPercentage("");
  };

  const handleRemoveCriterion = (idx: number) =>
    setCriteria((c) => c.filter((_, i) => i !== idx));

  const handlePublish = async () => {
    if (!isTotalValid || criteria.length === 0 || students.length === 0) return;
    const payload = { stage, criteria, students };
    console.log("Publishing rubric:", payload);
    await new Promise((res) => setTimeout(res, 500));
    alert(`Rubric for ${stage} published successfully.`);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-2xl font-semibold text-gray-900">Score Sheet Generator</h2>

      {/* Stage Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <label
          htmlFor="stage-select"
          className="block text-sm font-medium text-gray-700 mb-1 sm:mb-0 sm:w-40"
        >
          Defense Stage
        </label>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger id="stage-select" className="w-full sm:w-auto min-w-[180px]">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {allowedStages.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Criteria Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Scoring Criteria
        </label>
        <ul className="mb-4 space-y-2 max-h-60 overflow-y-auto">
          {criteria.map((c, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded text-sm sm:text-base"
            >
              <span>
                {c.title} ({c.percentage}%)
              </span>
              <button
                onClick={() => handleRemoveCriterion(idx)}
                className="text-red-600 hover:text-red-800"
              >
                Remove
              </button>
            </li>
          ))}
          {criteria.length === 0 && (
            <li className="text-gray-500 italic">No criteria added yet.</li>
          )}
        </ul>

        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
          <Input
            placeholder="Criterion name"
            value={newCriterion}
            onChange={(e) => setNewCriterion(e.target.value)}
            className="flex-1 min-w-0"
          />
          <Input
            placeholder="%"
            type="number"
            value={newPercentage}
            onChange={(e) => setNewPercentage(e.target.value)}
            className="w-full sm:w-24 min-w-0"
            min={1}
            max={100}
          />
          <Button onClick={handleAddCriterion} className="bg-amber-700 text-white">
            Add
          </Button>
        </div>

        <div className={`text-sm mt-2 ${isTotalValid ? "text-green-600" : "text-red-600"}`}>
          Total: {totalPercentage}% {isTotalValid ? "(Valid)" : "(Must equal 100%)"}
        </div>
      </div>

      {/* Preview Table */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Preview Score Sheet for <strong>{stage}</strong>
        </label>
        <div className="overflow-x-auto border rounded">
          <h3 className="text-lg font-semibold text-center my-2">{stage} Score Sheet</h3>
          <table className="min-w-full border-collapse border text-center text-sm sm:text-base">
            <thead>
              <tr>
                <th className="border px-2 py-1">Matric No</th>
                <th className="border px-2 py-1">Student Name</th>
                <th className="border px-2 py-1">Project Topic</th>
                {criteria.map((c) => (
                  <th key={c.title} className="border px-2 py-1 whitespace-nowrap">
                    {c.title} ({c.percentage}%)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((stud, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                    <td className="border px-2 py-1">{stud.matNo}</td>
                    <td className="border px-2 py-1 text-left">{stud.name}</td>
                    <td className="border px-2 py-1 text-left">{stud.topic}</td>
                    {criteria.map((_, j) => (
                      <td key={j} className="border px-2 py-1">
                        {/* Empty score cell */}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={criteria.length + 3} className="border px-2 py-2 text-gray-500">
                    No students ready for this stage.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Publish Button */}
      <div className="flex justify-end">
        <Button
          onClick={handlePublish}
          className="bg-amber-700 hover:bg-amber-800 text-white whitespace-nowrap"
          disabled={!isTotalValid || criteria.length === 0 || students.length === 0}
        >
          Publish Rubric
        </Button>
      </div>
    </div>
  );
}
