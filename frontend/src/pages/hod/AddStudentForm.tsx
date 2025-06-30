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

    // Reset form
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
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-semibold mb-4">Add {degree} Student</h2>

      {/* Degree selector */}
      <div className="mb-4">
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

      {/* Matriculation Number */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Matriculation No.</label>
        <Input
          value={matNo}
          onChange={(e) => setMatNo(e.target.value)}
          placeholder="e.g. 220976762"
        />
      </div>

      {/* First & Last Name */}
      <div className="grid grid-cols-2 gap-4 mb-4">
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
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Email</label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      {/* Faculty Dropdown */}
      <div className="mb-4">
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

      {/* Department Dropdown */}
      <div className="mb-4">
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

      {/* Password */}
      

      
      {/* Starting Stage */}
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
      <div className="flex justify-end gap-3">
        {onClose && (
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          className="bg-amber-700 hover:bg-amber-800 text-white"
        >
          Add Student
        </Button>
      </div>
    </div>
  );
};

export default AddStudentForm;
