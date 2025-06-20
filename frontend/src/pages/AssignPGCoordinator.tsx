import { useState } from "react";
import { Button } from "@/components/ui/button";

// Data type for PG Coordinator, using same fields as assign supervisor form modal except supervisorType
interface PGCoordinator {
  id: string;
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
}

interface AddPGCoordinatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PGCoordinator) => void;
}

const AddPGCoordinatorModal = ({ isOpen, onClose, onSubmit }: AddPGCoordinatorModalProps) => {
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

  const handleSubmit = () => {
    // Basic validation
    if (!firstName || !lastName || !userId || !email || !password) {
      alert("First Name, Last Name, User ID, Email, and Password are required.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    const newCoord: PGCoordinator = {
      id: Date.now().toString(),
      firstName,
      lastName,
      userId,
      phone,
      email,
      faculty,
      department,
      role,
      type,
      password,
      confirmPassword,
    };
    onSubmit(newCoord);
    // Reset fields
    setFirstName("");
    setLastName("");
    setUserId("");
    setPhone("");
    setEmail("");
    setFaculty("");
    setDepartment("");
    setRole("");
    setType("");
    setPassword("");
    setConfirmPassword("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-semibold mb-4">Add PG Coordinator</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 mb-1">First Name:</label>
            <input
              type="text"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Last Name:</label>
            <input
              type="text"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">User ID:</label>
            <input
              type="text"
              value={userId}
              onChange={e => setUserId(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Phone No:</label>
            <input
              type="text"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Email:</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Faculty:</label>
            <select
              value={faculty}
              onChange={e => setFaculty(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select Faculty</option>
              {/* Add faculty options here */}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Department:</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select Department</option>
              {/* Add department options here */}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Role:</label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select Role</option>
              {/* Add role options here */}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Type:</label>
            <select
              value={type}
              onChange={e => setType(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="">Select Type</option>
              {/* Add type options here */}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Password:</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Confirm Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
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

const AssignPGCoordinator = () => {
  const [pgCoordinators, setPgCoordinators] = useState<PGCoordinator[]>([]);
  const [modalOpen, setModalOpen] = useState(false);

  const handleAdd = (coord: PGCoordinator) => {
    setPgCoordinators(prev => [...prev, coord]);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-800">Assign PG Coordinator</h2>
        <Button onClick={() => setModalOpen(true)} className="bg-amber-700 hover:bg-amber-800 text-white">
          Add Coordinator
        </Button>
      </div>
      {pgCoordinators.length === 0 ? (
        <p className="text-gray-600">No PG Coordinators added yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 border">Name</th>
                <th className="p-3 border">User ID</th>
                <th className="p-3 border">Email</th>
                <th className="p-3 border">Phone</th>
                <th className="p-3 border">Faculty</th>
                <th className="p-3 border">Department</th>
                <th className="p-3 border">Role</th>
                <th className="p-3 border">Type</th>
              </tr>
            </thead>
            <tbody>
              {pgCoordinators.map((coord, idx) => (
                <tr key={coord.id} className={`${idx % 2 === 0 ? 'bg-amber-50' : 'bg-white'}`}>
                  <td className="p-3 border text-gray-800">{coord.firstName} {coord.lastName}</td>
                  <td className="p-3 border text-gray-800">{coord.userId}</td>
                  <td className="p-3 border text-gray-800">{coord.email}</td>
                  <td className="p-3 border text-gray-800">{coord.phone}</td>
                  <td className="p-3 border text-gray-800">{coord.faculty}</td>
                  <td className="p-3 border text-gray-800">{coord.department}</td>
                  <td className="p-3 border text-gray-800">{coord.role}</td>
                  <td className="p-3 border text-gray-800">{coord.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <AddPGCoordinatorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAdd}
      />
    </div>
  );
};

export default AssignPGCoordinator;
