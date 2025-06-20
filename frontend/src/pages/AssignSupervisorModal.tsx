import { useState } from "react";

interface AssignSupervisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    topicId: string;
    firstName: string;
    lastName: string;
    userId: string;
    phone: string;
    email: string;
    faculty: string;
    department: string;
    role: string;
    type: string;
    password: string;
    confirmPassword: string;
    supervisorType: 'supervisor1' | 'supervisor2';
  }) => void;
  topicId: string | null;
}

const AssignSupervisorModal = ({ isOpen, onClose, onSubmit, topicId }: AssignSupervisorModalProps) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userId, setUserId] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [faculty, setFaculty] = useState("");
  const [department, setDepartment] = useState("");
  const [role, setRole] = useState("");
  const [type, setType] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [supervisorType, setSupervisorType] = useState<'supervisor1' | 'supervisor2'>('supervisor1');

  const handleSubmit = () => {
    if (!topicId) return;
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    onSubmit({ topicId, firstName, lastName, userId, phone, email, faculty, department, role, type, password, confirmPassword, supervisorType });
    // reset fields...
    setFirstName(""); setLastName(""); setUserId(""); setPhone(""); setEmail("");
    setFaculty(""); setDepartment(""); setRole(""); setType(""); setPassword(""); setConfirmPassword(""); setSupervisorType('supervisor1');
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Assign Supervisor</h2>
        <p className="text-gray-600 mb-4">Fill in supervisor details and select 1st or 2nd supervisor</p>
        <div className="grid grid-cols-2 gap-4">
          {/* First Name */}
          <div>
            <label className="block text-gray-700 mb-1">First Name:</label>
            <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          {/* Last Name */}
          <div>
            <label className="block text-gray-700 mb-1">Last Name:</label>
            <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          {/* User ID */}
          <div>
            <label className="block text-gray-700 mb-1">User ID:</label>
            <input type="text" value={userId} onChange={e => setUserId(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          {/* Phone No */}
          <div>
            <label className="block text-gray-700 mb-1">Phone No:</label>
            <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          {/* Email */}
          <div>
            <label className="block text-gray-700 mb-1">Email:</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          {/* Faculty */}
          <div>
            <label className="block text-gray-700 mb-1">Faculty:</label>
            <select value={faculty} onChange={e => setFaculty(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">Select Faculty</option>
              {/* options */}
            </select>
          </div>
          {/* Department */}
          <div>
            <label className="block text-gray-700 mb-1">Department:</label>
            <select value={department} onChange={e => setDepartment(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">Select Department</option>
              {/* options */}
            </select>
          </div>
          {/* Role */}
          <div>
            <label className="block text-gray-700 mb-1">Role:</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">Select Role</option>
              {/* options */}
            </select>
          </div>
          {/* Type */}
          <div>
            <label className="block text-gray-700 mb-1">Type:</label>
            <select value={type} onChange={e => setType(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
              <option value="">Select Type</option>
              {/* options */}
            </select>
          </div>
          {/* Password */}
          <div>
            <label className="block text-gray-700 mb-1">Password:</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          {/* Confirm Password */}
          <div>
            <label className="block text-gray-700 mb-1">Confirm Password:</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2" />
          </div>
          {/* Supervisor Type full width */}
          <div className="col-span-2">
            <label className="block text-gray-700 mb-1">Supervisor Type:</label>
            <select
              value={supervisorType}
              onChange={e => setSupervisorType(e.target.value as 'supervisor1' | 'supervisor2')}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="supervisor1">1st Supervisor</option>
              <option value="supervisor2">2nd Supervisor</option>
            </select>
          </div>
        </div>
        <div className="mt-6 text-sm text-gray-600">
          By submitting, you agree to Terms of Use and acknowledge the Privacy Policy.
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
          <button onClick={handleSubmit} className="px-6 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 flex items-center">
            Submit <span className="ml-2">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignSupervisorModal;
