import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface AssignSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    studentId: string,
    supervisorType: "supervisor1" | "supervisor2",
    lecturerName: string
  ) => void;
  studentId: string;
}

const AssignSupervisorModal: React.FC<AssignSupervisorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  studentId,
}) => {
  const [supervisorType, setSupervisorType] = useState<"supervisor1" | "supervisor2">("supervisor1");
  const [lecturerName, setLecturerName] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-6 sm:p-8 w-full max-w-md sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl sm:text-2xl font-semibold mb-6 text-gray-800">
          Assign Supervisor
        </h2>

        {/* Supervisor Type */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1">Supervisor Type</label>
          <Select value={supervisorType} onValueChange={(v) => setSupervisorType(v as any)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="supervisor1">1st Supervisor</SelectItem>
              <SelectItem value="supervisor2">2nd Supervisor</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lecturer Name */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Lecturer</label>
          <Select value={lecturerName} onValueChange={(v) => setLecturerName(v)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Lecturer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Dr. Florence Okeke">Dr. Florence Okeke</SelectItem>
              <SelectItem value="Prof. Musa Ibrahim">Prof. Musa Ibrahim</SelectItem>
              {/* You can map lecturer list dynamically here */}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            className="w-full sm:w-auto bg-amber-700 text-white hover:bg-amber-800"
            onClick={() => {
              onSubmit(studentId, supervisorType, lecturerName);
              onClose();
            }}
          >
            Assign
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AssignSupervisorModal;
