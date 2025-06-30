import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface SetDefenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  defenseStage: string;
  students: { id: string; fullName: string }[];
  lecturers: string[];
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 p-4">
      <div className="w-full max-w-lg bg-white rounded-xl p-6 shadow-lg max-h-[90vh] overflow-y-auto">
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
              setSaving(true);
              await onSubmit({ stage: defenseStage, date, time, panel });
              setSaving(false);
              onClose();
            }}
            disabled={!date || !time || panel.length === 0 || saving}
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
