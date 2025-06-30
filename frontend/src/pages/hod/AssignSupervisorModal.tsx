// components/AssignSupervisorModal.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";

interface AssignSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (studentId: string, supervisorType: "supervisor1"|"supervisor2", lecturerName: string) => void;
  studentId: string;
}

const AssignSupervisorModal: React.FC<AssignSupervisorModalProps> = ({
  isOpen, onClose, onSubmit, studentId
}) => {
  const [supervisorType, setSupervisorType] = useState<"supervisor1"|"supervisor2">("supervisor1");
  const [lecturerName, setLecturerName] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Assign Supervisor</h2>

        <div className="mb-4">
          <label className="block text-sm mb-1">Supervisor Type</label>
          <Select value={supervisorType} onValueChange={(v) => setSupervisorType(v as any)}>
            <SelectTrigger className="w-full"><SelectValue placeholder={supervisorType} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="supervisor1">1st Supervisor</SelectItem>
              <SelectItem value="supervisor2">2nd Supervisor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Lecturer</label>
          {/* This could be a dynamic list from your LecturerTab state or API */}
          <Select value={lecturerName} onValueChange={(v) => setLecturerName(v)}>
            <SelectTrigger className="w-full"><SelectValue placeholder={lecturerName} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Dr. Florence Okeke">Dr. Florence Okeke</SelectItem>
              <SelectItem value="Prof. Musa Ibrahim">Prof. Musa Ibrahim</SelectItem>
              {/* …other lecturers */}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => {
            onSubmit(studentId, supervisorType, lecturerName);
            onClose();
          }} className="bg-amber-700 text-white hover:bg-amber-800">Assign</Button>
        </div>
      </div>
    </div>
  );
};

export default AssignSupervisorModal;
