// src/provost/ProvostCollegeRepManager.tsx
import  { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";

// Mock data
const departments = [
  "Computer Science",
  "Electrical Engineering",
  "Statistics",
  "Mathematics",
  "Physics",
];

const lecturers = [
  { id: "l1", name: "Dr. Florence Okeke" },
  { id: "l2", name: "Prof. Musa Ibrahim" },
  { id: "l3", name: "Engr. Christabel Henry" },
  { id: "l4", name: "Dr. Ayo Babalola" },
  { id: "l5", name: "Dr. Ifeoma Nwankwo" },
];

interface CollegeRep {
  id: string;
  lecturerId: string;
  lecturerName: string;
  faculty: string;
}

export default function ProvostCollegeRepManager() {
  const [reps, setReps] = useState<CollegeRep[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [selectedLecturerId, setSelectedLecturerId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Filtered list based on searchTerm
  const filteredReps = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return reps.filter(
      (r) =>
        r.faculty.toLowerCase().includes(term) ||
        r.lecturerName.toLowerCase().includes(term)
    );
  }, [reps, searchTerm]);

  const handleAssign = () => {
    // prevent duplicate per faculty
    if (reps.some((r) => r.faculty === selectedFaculty)) {
      alert("This faculty already has a college rep assigned.");
      return;
    }
    const lecturer = lecturers.find((l) => l.id === selectedLecturerId);
    if (!lecturer || !selectedFaculty) return;

    const newRep: CollegeRep = {
      id: Date.now().toString(),
      lecturerId: lecturer.id,
      lecturerName: lecturer.name,
      faculty: selectedFaculty,
    };

    setReps((prev) => [...prev, newRep]);
    setModalOpen(false);
    setSelectedFaculty("");
    setSelectedLecturerId("");
  };

  const handleRemove = (id: string) => {
    if (confirm("Remove this college rep?")) {
      setReps((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-800">
          Appointed College Representatives
        </h2>
        <Button
          className="bg-amber-700 text-white hover:bg-amber-800"
          onClick={() => setModalOpen(true)}
        >
          Assign New Rep
        </Button>
      </div>

      {/* Search Box */}
      <div className="mb-4">
        <Input
          placeholder="Search by department or lecturer"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 border-b">Department</th>
              <th className="p-3 border-b">Lecturer</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReps.map((rep, idx) => (
              <tr
                key={rep.id}
                className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}
              >
                <td className="p-3 border-b">{rep.faculty}</td>
                <td className="p-3 border-b">{rep.lecturerName}</td>
                <td className="p-3 border-b">
                  <button
                    onClick={() => handleRemove(rep.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {filteredReps.length === 0 && (
              <tr>
                <td colSpan={3} className="text-center p-4 text-gray-500">
                  No college representatives found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Assign College Representative</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Department
              </label>
              <Select
                value={selectedFaculty}
                onValueChange={setSelectedFaculty}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">
                Lecturer
              </label>
              <Select
                value={selectedLecturerId}
                onValueChange={setSelectedLecturerId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Lecturer" />
                </SelectTrigger>
                <SelectContent>
                  {lecturers.map((l) => (
                    <SelectItem key={l.id} value={l.id}>
                      {l.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-700 text-white w-full sm:w-auto"
              onClick={handleAssign}
              disabled={!selectedFaculty || !selectedLecturerId}
            >
              Assign Rep
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
