// src/pgc/SetDefenseModal.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import ScoreSheetGenerator, { Criterion } from "./ScoreSheetGenerator";
import { useToast } from "@/hooks/use-toast";

interface SetDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defenseStage: string;
  lecturers: string[];
  /**
   * onSubmit receives the schedule data including the rubric:
   * { stage, date, time, panel, rubric: { criteria: Criterion[] } }
   */
  onSubmit: (data: {
    stage: string;
    date: string;
    time: string;
    panel: string[];
    rubric: { criteria: Criterion[] };
  }) => Promise<void>;
}

const SetDefenseModal: React.FC<SetDefenseModalProps> = ({
  isOpen,
  onClose,
  defenseStage,
  lecturers,
  onSubmit,
}) => {
  const { toast } = useToast();
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [panel, setPanel] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  // Rubric state (must be set by ScoreSheetGenerator publish)
  const [rubric, setRubric] = useState<{ criteria: Criterion[] } | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    // If rubric is not attached, show destructive toast and throw an Error
    if (!rubric) {
      toast({
        title: "Score sheet missing",
        description: "You must publish and attach a score sheet before saving the defense.",
        variant: "destructive",
      });
      // throw an error so upstream handlers / error boundaries can react
      throw new Error("Score sheet is required for scheduling a defense.");
    }

    if (!date || !time || panel.length === 0) {
      toast({
        title: "Missing fields",
        description: "Please provide date, time and select at least one panel member.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        stage: defenseStage,
        date,
        time,
        panel,
        rubric,
      });
      toast({
        title: "Defense scheduled",
        description: "Defense saved with attached score sheet.",
        variant: "default",
      });
      onClose();
    } catch (err: any) {
      // surface backend or other errors to the user
      toast({
        title: "Save failed",
        description: err?.message ?? "An error occurred while saving.",
        variant: "destructive",
      });
      // rethrow so a parent can also catch if necessary
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="w-full max-w-3xl bg-white rounded-xl p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-gray-800">
          Schedule {defenseStage}
        </h2>

        <div className="mb-4">
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 w-full"
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="time">Time</Label>
          <Input
            id="time"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 w-full"
          />
        </div>

        <div className="mb-4">
          <Label>Panel Members</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
            {lecturers.map((lec) => (
              <label
                key={lec}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <Checkbox
                  checked={panel.includes(lec)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setPanel((p) => [...p, lec]);
                    } else {
                      setPanel((p) => p.filter((x) => x !== lec));
                    }
                  }}
                />
                <span>{lec}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Always show the score sheet builder (score sheet is required) */}
        <div className="mb-4 border rounded-md p-3 bg-gray-50">
          <p className="text-sm mb-2">Create and publish the score sheet below. Publishing will attach it to this schedule (required).</p>

          <ScoreSheetGenerator
            initialCriteria={undefined}
            onPublish={(payload) => {
              setRubric(payload); // payload = { criteria: Criterion[] }
            }}
          />

          {rubric && (
            <div className="mt-3 text-sm">
              <strong>Attached score sheet:</strong> {rubric.criteria.length} criteria • Total: {rubric.criteria.reduce((s, c) => s + c.percentage, 0)}%
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={saving}
            className="min-w-[90px]"
          >
            Cancel
          </Button>
          <Button
            onClick={async () => {
              try {
                await handleSave();
              } catch (err) {
                // swallow here — error already shown via toast and rethrown by handleSave
                // If you want to let it propagate, remove this catch.
                console.error("Save aborted:", err);
              }
            }}
            disabled={saving}
            className="bg-amber-700 hover:bg-amber-800 text-white min-w-[90px]"
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetDefenseModal;
