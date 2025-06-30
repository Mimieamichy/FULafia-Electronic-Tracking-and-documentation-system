// components/SetDefenseModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SetDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defenseStage: string;
  students: { id: string; fullName: string }[];        // to scope if needed
  lecturers: string[];                                // panel candidates
  onSubmit: (data: {
    stage: string;
    date: string;
    time: string;
    panel: string[];
  }) => Promise<void>;
}

const SetDefenseModal: React.FC<SetDefenseModalProps> = ({
  isOpen,
  onClose,
  defenseStage,
  lecturers,
  onSubmit,
}) => {
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [panel, setPanel] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">
          Schedule {defenseStage}
        </h2>

        <div className="mb-4">
          <Label htmlFor="date">Date</Label>
          <Input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="mb-4">
          <Label htmlFor="time">Time</Label>
          <Input
            type="time"
            id="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1"
          />
        </div>

        <div className="mb-4">
          <Label>Panel Members</Label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {lecturers.map((lec) => (
              <label key={lec} className="flex items-center gap-2">
                <Checkbox
                  checked={panel.includes(lec)}
                  onCheckedChange={(checked) => {
                    if (checked) setPanel((p) => [...p, lec]);
                    else setPanel((p) => p.filter((x) => x !== lec));
                  }}
                />
                <span>{lec}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={async () => {
              setSaving(true);
              await onSubmit({ stage: defenseStage, date, time, panel });
              setSaving(false);
              onClose();
            }}
            className="bg-amber-700 hover:bg-amber-800 text-white"
            disabled={!date || !time || panel.length === 0 || saving}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetDefenseModal;
