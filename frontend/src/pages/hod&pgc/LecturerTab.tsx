import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface Lecturer {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  staffId: string;
  email: string;
  role: string; // Optional role field
  department: string;
  faculty: string;
}

// Options for dropdowns
const titleOptions = ["Mr.", "Mrs.", "Miss.", "Dr.", "Engr."];
const facultyOptions = [
  "Faculty of Engineering",
  "Faculty of Science",
  "Faculty of Arts",
];
const departmentOptions = [
  "Computer Science",
  "Electrical Engineering",
  "Statistics",
];

const roleOptions = [
  "Lecturer I",
  "Lecturer II",
  "Assistant Lecturer",
  "Senior Lecturer",
  "Visiting Lecturer",
  "Adjunct Lecturer",
  "Research Fellow",
  "Provost",
  "Dean",
  "Director",
];

const LecturerTab = () => {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<Lecturer, "id">>({
    title: "",
    firstName: "",
    lastName: "",
    staffId: "",
    email: "",
    role: "",
    department: "",
    faculty: "",
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({
      title: "",
      firstName: "",
      lastName: "",
      staffId: "",
      email: "",
      role: "",
      department: "",
      faculty: "",
    });
    setModalOpen(true);
  };

  const openEdit = (lec: Lecturer) => {
    setEditingId(lec.id);
    setForm({ ...lec });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setLecturers((prev) => prev.filter((l) => l.id !== id));
  };

  const handleSubmit = () => {
    const {
      title,
      firstName,
      lastName,
      staffId,
      email,
      role,
      department,
      faculty,
    } = form;
    if (
      !title ||
      !firstName ||
      !lastName ||
      !staffId ||
      !email ||
      !role ||
      !department ||
      !faculty
    ) {
      alert(
        "Title, First Name, Last Name, Staff ID, Email, Role, Department, and Faculty are required"
      );
      return;
    }
    if (editingId) {
      setLecturers((prev) =>
        prev.map((l) => (l.id === editingId ? { id: editingId, ...form } : l))
      );
    } else {
      setLecturers((prev) => [...prev, { id: Date.now().toString(), ...form }]);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Lecturers</h2>
        <Button
          onClick={openAdd}
          className="bg-amber-700 text-white hover:bg-amber-800 min-w-[140px]"
        >
          Add Lecturer
        </Button>
      </div>

      {/* Responsive horizontal scroll wrapper for table */}
      <div className="bg-white rounded-lg shadow-sm overflow-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3 whitespace-nowrap">Name</th>
              <th className="p-3 whitespace-nowrap">Lecturer ID</th>
              <th className="p-3 whitespace-nowrap">Email</th>
              <th className="p-3 whitespace-nowrap">Department</th>
              <th className="p-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((lec, idx) => (
              <tr
                key={lec.id}
                className={idx % 2 === 0 ? "bg-amber-50" : "bg-white"}
              >
                <td className="p-3 whitespace-nowrap">
                  {lec.title} {lec.firstName} {lec.lastName}
                </td>
                <td className="p-3 whitespace-nowrap">{lec.staffId}</td>
                <td className="p-3 whitespace-nowrap">{lec.email}</td>
                <td className="p-3 whitespace-nowrap">{lec.department}</td>
                <td className="p-3 flex gap-2">
                  <button
                    onClick={() => openEdit(lec)}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label={`Edit ${lec.firstName} ${lec.lastName}`}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(lec.id)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Delete ${lec.firstName} ${lec.lastName}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {lecturers.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No lecturers added yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-6">
              {editingId ? "Edit Lecturer" : "Add Lecturer"}
            </h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
              noValidate
            >
              {/* Title Dropdown */}
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="title">
                  Title:
                </label>
                <Select
                  value={form.title}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, title: val }))
                  }
                >
                  <SelectTrigger id="title" className="w-full" aria-label="Select title">
                    <SelectValue placeholder="Select title" />
                  </SelectTrigger>
                  <SelectContent>
                    {titleOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="firstName">
                  First Name:
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, firstName: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="lastName">
                  Last Name:
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, lastName: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              {/* Staff ID */}
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="staffId">
                  Staff ID:
                </label>
                <input
                  id="staffId"
                  type="text"
                  value={form.staffId}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, staffId: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="email">
                  Email:
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded px-3 py-2"
                  required
                />
              </div>

              {/* Role Dropdown */}
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="role">
                  Role:
                </label>
                <Select
                  value={form.role}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, role: val }))
                  }
                >
                  <SelectTrigger id="role" className="w-full" aria-label="Select role">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="max-h-40 overflow-y-auto">
                    {roleOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>
                        {opt}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Faculty Dropdown */}
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="faculty">
                  Faculty:
                </label>
                <Select
                  value={form.faculty}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, faculty: val }))
                  }
                >
                  <SelectTrigger id="faculty" className="w-full" aria-label="Select faculty">
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
              <div>
                <label className="block text-gray-700 mb-1" htmlFor="department">
                  Department:
                </label>
                <Select
                  value={form.department}
                  onValueChange={(val) =>
                    setForm((prev) => ({ ...prev, department: val }))
                  }
                >
                  <SelectTrigger
                    id="department"
                    className="w-full"
                    aria-label="Select department"
                  >
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
            </form>

            <div className="mt-6 text-sm text-gray-600">
              By submitting, you agree to Terms of Use and acknowledge the Privacy
              Policy.
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="w-full sm:w-auto px-6 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 flex items-center justify-center transition"
              >
                Submit <span className="ml-2">→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturerTab;
