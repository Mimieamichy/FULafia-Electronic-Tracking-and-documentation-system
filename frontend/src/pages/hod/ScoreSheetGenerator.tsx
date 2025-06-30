// pgc/ScoreSheetGenerator.tsx
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
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

interface Criterion {
  title: string;
  percentage: number;
}

interface PanelMember {
  id: string;
  name: string;
}

// --- MOCK DATA / API STUBS ---
// Replace these with real endpoints
async function fetchPanelMembers(): Promise<PanelMember[]> {
  // e.g. return fetch("/api/panels").then(r => r.json());
  return [
    { id: "p1", name: "Dr. Alice" },
    { id: "p2", name: "Prof. Bob" },
    { id: "p3", name: "Dr. Carol" },
  ];
}

async function fetchStudentsByStage(stage: string): Promise<string[]> {
  // e.g. return fetch(`/api/students?stage=${stage}`).then(r => r.json());
  const dummy = {
    "First Seminar": ["John Doe", "Jane Smith"],
    "Second Seminar": ["Jim Bean", "Jenny Lane"],
    "Third Seminar": ["Paul Allen"],
    "External Defense": ["Lisa Ray", "Mark Twain"],
  };
  return dummy[stage] || [];
}

export default function ScoreSheetGenerator() {
  const stages = [
    "First Seminar",
    "Second Seminar",
    "Third Seminar",
    "External Defense",
  ];

  // --- STATE ---
  const [stage, setStage] = useState(stages[0]);
  const [criteria, setCriteria] = useState<Criterion[]>([
    { title: "Clarity", percentage: 30 },
    { title: "Originality", percentage: 70 },
  ]);
  const [newCriterion, setNewCriterion] = useState("");
  const [newPercentage, setNewPercentage] = useState("");

  const [panelMembers, setPanelMembers] = useState<PanelMember[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const [students, setStudents] = useState<string[]>([]);

  // --- EFFECTS ---
  // Load panel members on mount
  useEffect(() => {
    fetchPanelMembers().then(setPanelMembers);
  }, []);

  // Reload students whenever the stage changes
  useEffect(() => {
    fetchStudentsByStage(stage).then(setStudents);
  }, [stage]);

  // --- HELPERS ---
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
    if (
      !isTotalValid ||
      criteria.length === 0 ||
      students.length === 0 ||
      selectedMembers.length === 0
    )
      return;

    const payload = {
      stage,
      criteria,
      panelMemberIds: selectedMembers,
      students,
    };

    console.log("Publishing rubric:", payload);
    // e.g. await fetch("/api/publishRubric", { method: "POST", body: JSON.stringify(payload) });

    await new Promise((res) => setTimeout(res, 500));
    alert(
      `Rubric for ${stage} sent to ${selectedMembers.length} panel member(s).`
    );
  };

  // --- RENDER ---
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold">Score Sheet Generator</h2>

      {/* Stage Selector */}
      <div>
        <label className="block text-sm font-medium mb-1">Defense Stage</label>
        <Select value={stage} onValueChange={(v) => setStage(v)}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {stages.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Panel Member Multi‑Select */}
      {/* Panel Member Multi‑Select (Popover + Checkboxes) */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Select Panel Members
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full text-left">
              {selectedMembers.length > 0
                ? `${selectedMembers.length} selected`
                : "Choose panel members"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="flex flex-col space-y-2">
              {panelMembers.map((p) => (
                <label key={p.id} className="flex items-center">
                  <Checkbox
                    checked={selectedMembers.includes(p.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMembers([...selectedMembers, p.id]);
                      } else {
                        setSelectedMembers(
                          selectedMembers.filter((id) => id !== p.id)
                        );
                      }
                    }}
                  />
                  <span className="ml-2">{p.name}</span>
                </label>
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Criteria Editor */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Scoring Criteria
        </label>
        <ul className="mb-4 space-y-2">
          {criteria.map((c, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded"
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
            <li className="text-gray-500">No criteria added yet.</li>
          )}
        </ul>

        <div className="flex gap-2">
          <Input
            placeholder="Criterion name"
            value={newCriterion}
            onChange={(e) => setNewCriterion(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="%"
            type="number"
            value={newPercentage}
            onChange={(e) => setNewPercentage(e.target.value)}
            className="w-24"
          />
          <Button
            onClick={handleAddCriterion}
            className="bg-amber-700 text-white"
          >
            Add
          </Button>
        </div>

        <div
          className={`text-sm mt-2 ${
            isTotalValid ? "text-green-600" : "text-red-600"
          }`}
        >
          Total: {totalPercentage}%{" "}
          {isTotalValid ? "(Valid)" : "(Must equal 100%)"}
        </div>
      </div>

      {/* Generated Score‑Sheet Table */}
      <div>
        <label className="block text-sm font-medium mb-1">
          Preview Score Sheet
        </label>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-center text-sm">
            <thead>
              <tr>
                <th className="border px-2 py-1">Student Name</th>
                {criteria.map((c) => (
                  <th key={c.title} className="border px-2 py-1">
                    {c.title} ({c.percentage}%)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((stud, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1 text-left">{stud}</td>
                  {criteria.map((_, j) => (
                    <td key={j} className="border px-2 py-1">
                      {/* cell for score entry */}
                    </td>
                  ))}
                </tr>
              ))}
              {students.length === 0 && (
                <tr>
                  <td
                    colSpan={criteria.length + 1}
                    className="border px-2 py-1 text-gray-500"
                  >
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
          className="bg-amber-700 hover:bg-amber-800 text-white"
          disabled={
            !isTotalValid ||
            criteria.length === 0 ||
            students.length === 0 ||
            selectedMembers.length === 0
          }
        >
          Publish Rubric
        </Button>
      </div>
    </div>
  );
}
