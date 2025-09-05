// src/pgc/ScoreSheetGenerator.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export interface Criterion {
  title: string;
  percentage: number;
}

interface ScoreSheetGeneratorProps {
  initialCriteria?: Criterion[];
  onPublish?: (payload: { criteria: Criterion[] }) => void;
}

export default function ScoreSheetGenerator({
  initialCriteria,
  onPublish,
}: ScoreSheetGeneratorProps) {
  const { toast } = useToast();
  const [criteria, setCriteria] = useState<Criterion[]>(
    initialCriteria && initialCriteria.length > 0
      ? initialCriteria
      : [
          { title: "Clarity", percentage: 50 },
          { title: "Originality", percentage: 50 },
        ]
  );

  const [newCriterion, setNewCriterion] = useState("");
  const [newPercentage, setNewPercentage] = useState("");

  const totalPercentage = criteria.reduce((s, c) => s + Number(c.percentage || 0), 0);
  const isTotalValid = totalPercentage === 100;

  function handleAddCriterion() {
    const title = newCriterion.trim();
    const percentage = parseFloat(newPercentage);
    if (!title) {
      toast({ title: "Missing name", description: "Enter a criterion name.", variant: "destructive" });
      return;
    }
    if (isNaN(percentage) || percentage <= 0) {
      toast({ title: "Invalid percentage", description: "Enter a valid percentage (> 0).", variant: "destructive" });
      return;
    }
    if (criteria.some((c) => c.title.toLowerCase() === title.toLowerCase())) {
      toast({ title: "Duplicate", description: "That criterion already exists.", variant: "destructive" });
      return;
    }
    setCriteria((s) => [...s, { title, percentage }]);
    setNewCriterion("");
    setNewPercentage("");
  }

  function handleRemoveCriterion(idx: number) {
    setCriteria((s) => s.filter((_, i) => i !== idx));
  }

  function updateCriterion(idx: number, patch: Partial<Criterion>) {
    setCriteria((s) =>
      s.map((c, i) => (i === idx ? { ...c, ...patch } : c))
    );
  }

  function handlePublish() {
    if (criteria.length === 0) {
      toast({ title: "No criteria", description: "Create at least one criterion before publishing.", variant: "destructive" });
      return;
    }
    if (!isTotalValid) {
      toast({ title: "Invalid total", description: "Criteria percentages must total 100%.", variant: "destructive" });
      return;
    }

    const payload = { criteria };
    onPublish?.(payload);

    toast({
      title: "Rubric published",
      description: "Score sheet published and attached to the schedule.",
      variant: "default",
    });
  }

  return (
    <div className="space-y-6 p-4 border rounded-md bg-white">
      <div>
        <label className="block text-sm font-medium mb-1">Scoring Criteria</label>
        <div className="space-y-2">
          {criteria.map((c, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Input
                value={c.title}
                onChange={(e) => updateCriterion(i, { title: e.target.value })}
                className="flex-1"
                placeholder="Criterion name"
              />
              <Input
                value={String(c.percentage)}
                onChange={(e) => {
                  const v = e.target.value;
                  if (v === "") {
                    // if user clears the input, set to 0
                    updateCriterion(i, { percentage: 0 });
                  } else {
                    const parsed = parseFloat(v);
                    if (!Number.isNaN(parsed)) {
                      updateCriterion(i, { percentage: parsed });
                    }
                  }
                }}
                className="w-24"
                placeholder="%"
                type="number"
                min={0}
                max={100}
              />
              <button
                onClick={() => handleRemoveCriterion(i)}
                className="text-sm text-red-600 px-2 py-1"
                aria-label={`Remove criterion ${c.title}`}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mt-3">
          <Input
            placeholder="New criterion"
            value={newCriterion}
            onChange={(e) => setNewCriterion(e.target.value)}
          />
          <Input
            placeholder="%"
            value={newPercentage}
            onChange={(e) => setNewPercentage(e.target.value)}
            type="number"
            className="w-24"
          />
          <Button onClick={handleAddCriterion}>Add</Button>
        </div>

        <div className={`text-sm mt-2 ${isTotalValid ? "text-green-600" : "text-red-600"}`}>
          Total: {totalPercentage}% {isTotalValid ? "(Valid)" : "(Must equal 100%)"}
        </div>
      </div>

      {/* Preview: shows only the criteria created */}
      <div>
        <label className="block text-sm font-medium mb-1">Preview</label>
        <div className="overflow-x-auto border rounded">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="p-2 border text-left">Criterion</th>
                <th className="p-2 border text-right">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {criteria.map((c, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                  <td className="p-2 border">{c.title}</td>
                  <td className="p-2 border text-right">{c.percentage}%</td>
                </tr>
              ))}
              {criteria.length === 0 && (
                <tr>
                  <td className="p-2 border" colSpan={2}>
                    No criteria yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handlePublish}
          disabled={!isTotalValid || criteria.length === 0}
        >
          Publish & Attach
        </Button>
      </div>
    </div>
  );
}
