// src/hod/CreateSession.tsx
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (session: Session) => void;
}

export interface Session {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

// Simulate session creation
const mockCreateSession = async (
  session: Omit<Session, "id">
): Promise<Session> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve({ id: Date.now().toString(), ...session });
    }, 500)
  );
};

const CreateSession = ({ isOpen, onClose, onCreated }: Props) => {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!name || !startDate || !endDate) return;

    setLoading(true);
    try {
      const newSession = await mockCreateSession({ name, startDate, endDate });
      onCreated(newSession);
      onClose();
    } catch (err) {
      alert("Error creating session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Create New Session</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Session Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2025/2026"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              Start Date
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-600 mb-1">
              End Date
            </label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            className="bg-amber-700 text-white"
            onClick={handleSubmit}
            disabled={loading || !name || !startDate || !endDate}
          >
            {loading ? "Creating..." : "Create Session"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateSession;
