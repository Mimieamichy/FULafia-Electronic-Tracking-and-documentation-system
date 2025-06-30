import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface AddStudentFormProps {
  onClose?: () => void;
}

const degreeOptions = ["MSc", "PhD"];
const stageOptions = [
  "First Seminar",
  "Second Seminar",
  "Third Seminar",
  "External Defense",
];

const facultyOptions = ["Engineering", "Science", "Social Sciences"];
const departmentOptions = ["Computer Science", "Electrical Eng.", "Statistics"];

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onClose }) => {
  const [degree, setDegree] = useState<"MSc" | "PhD">("MSc");
  const [matNo, setMatNo] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [stage, setStage] = useState(stageOptions[0]);

  const handleSubmit = () => {
    console.log({
      degree,
      matNo,
      name: `${firstName} ${lastName}`,
      email,
      faculty,
      department,
      stage,
    });

    setMatNo("");
    setFirstName("");
    setLastName("");
    setEmail("");
    setFaculty("");
    setDepartment("");
    setStage(stageOptions[0]);

    if (onClose) onClose();
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 sm:p-8">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Add {degree} Student
      </h2>

      {/* Degree */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-1">Degree</label>
        <Select
          value={degree}
          onValueChange={(val) => setDegree(val as "MSc" | "PhD")}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={degree} />
          </SelectTrigger>
          <SelectContent>
            {degreeOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Matric No */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-1">Matriculation No.</label>
        <Input
          value={matNo}
          onChange={(e) => setMatNo(e.target.value)}
          placeholder="e.g. 220976762"
        />
      </div>

      {/* First and Last Name */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
        </div>
      </div>

      {/* Email */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      {/* Faculty & Department */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium mb-1">Faculty</label>
          <Select value={faculty} onValueChange={setFaculty}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select faculty" />
            </SelectTrigger>
            <SelectContent>
              {facultyOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <Select value={department} onValueChange={setDepartment}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              {departmentOptions.map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stage */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-1">Starting Stage</label>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {stageOptions.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row justify-end gap-3">
        {onClose && (
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={onClose}
          >
            Cancel
          </Button>
        )}
        <Button
          className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800 text-white"
          onClick={handleSubmit}
        >
          Add Student
        </Button>
      </div>
    </div>
  );
};

export default AddStudentForm;
