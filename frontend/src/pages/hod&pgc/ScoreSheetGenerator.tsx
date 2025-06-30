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

async function fetchPanelMembers(): Promise<PanelMember[]> {
  return [
    { id: "p1", name: "Dr. Alice" },
    { id: "p2", name: "Prof. Bob" },
    { id: "p3", name: "Dr. Carol" },
  ];
}

async function fetchStudentsByStage(stage: string): Promise<string[]> {
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

  useEffect(() => {
    fetchPanelMembers().then(setPanelMembers);
  }, []);

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
    await new Promise((res) => setTimeout(res, 500));
    alert(
      `Rubric for ${stage} sent to ${selectedMembers.length} panel member(s).`
    );
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
        <Select value={stage} onValueChange={(v) => setStage(v)}>
          <SelectTrigger id="stage-select" className="w-full sm:w-auto min-w-[180px]">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-0 sm:w-40">
          Select Panel Members
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto text-left min-w-[180px]">
              {selectedMembers.length > 0
                ? `${selectedMembers.length} selected`
                : "Choose panel members"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64 max-w-full">
            <div className="flex flex-col space-y-2 max-h-60 overflow-y-auto">
              {panelMembers.map((p) => (
                <label key={p.id} className="flex items-center cursor-pointer select-none">
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
                aria-label={`Remove criterion ${c.title}`}
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
          <Button
            onClick={handleAddCriterion}
            className="bg-amber-700 text-white whitespace-nowrap"
          >
            Add
          </Button>
        </div>

        <div
          className={`text-sm mt-2 ${
            isTotalValid ? "text-green-600" : "text-red-600"
          }`}
        >
          Total: {totalPercentage}% {isTotalValid ? "(Valid)" : "(Must equal 100%)"}
        </div>
      </div>

      {/* Generated Score‑Sheet Table */}
      <div>
        <label className="block text-sm font-medium mb-1">Preview Score Sheet</label>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full border-collapse border text-center text-sm sm:text-base">
            <thead>
              <tr>
                <th className="border px-2 py-1 whitespace-nowrap">Student Name</th>
                {criteria.map((c) => (
                  <th
                    key={c.title}
                    className="border px-2 py-1 whitespace-nowrap"
                  >
                    {c.title} ({c.percentage}%)
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((stud, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                    <td className="border px-2 py-1 text-left">{stud}</td>
                    {criteria.map((_, j) => (
                      <td key={j} className="border px-2 py-1">
                        {/* Score entry cells */}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={criteria.length + 1}
                    className="border px-2 py-2 text-gray-500"
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
          className="bg-amber-700 hover:bg-amber-800 text-white whitespace-nowrap"
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
