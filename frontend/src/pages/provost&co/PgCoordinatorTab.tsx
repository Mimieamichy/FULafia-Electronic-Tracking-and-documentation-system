// src/pgc/PgCoordinatorTab.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "../AuthProvider";

interface PGCoordinator {
  id: string;
  name: string;
}

// Mock list of all possible coordinators (replacement candidates)
const allLecturers = [
  { id: "1", name: "Dr. Florence Okeke" },
  { id: "2", name: "Prof. Musa Ibrahim" },
  { id: "3", name: "Engr. Christabel Henry" },
];

export default function PgCoordinatorTab() {
  const { role } = useAuth();
  const isHod = role === "HOD";

  // Only HODs can change the PG Coordinator
  const [currentCord, setCurrentCord] = useState<PGCoordinator>(allLecturers[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(currentCord.id);

  const handleChange = () => {
    const newCord = allLecturers.find((lec) => lec.id === selectedId);
    if (newCord) setCurrentCord(newCord);
    setIsModalOpen(false);
  };

  if (!isHod) {
    // Non‑HODs shouldn't see this page
    return null;
  }

  return (
    <div className="p-4 sm:p-6 max-w-md mx-auto space-y-6">
      <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
        PG Coordinator
      </h2>

      <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-4">
        <div>
          <p className="text-sm text-gray-500">Current Coordinator:</p>
          <p className="mt-1 text-lg font-medium text-gray-800">
            {currentCord.name}
          </p>
        </div>

        <Button
          onClick={() => {
            setSelectedId(currentCord.id);
            setIsModalOpen(true);
          }}
          className="bg-amber-700 hover:bg-amber-800 text-white w-full"
        >
          Change PG Coordinator
        </Button>
      </div>

      {/* Change Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-sm w-full mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>Change PG Coordinator</DialogTitle>
          </DialogHeader>

          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Select a new coordinator:</p>
            <Select value={selectedId} onValueChange={setSelectedId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={currentCord.name} />
              </SelectTrigger>
              <SelectContent>
                {allLecturers.map((lec) => (
                  <SelectItem key={lec.id} value={lec.id}>
                    {lec.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleChange}
              className="bg-amber-700 text-white w-full sm:w-auto"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
