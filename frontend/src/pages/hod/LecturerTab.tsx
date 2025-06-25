import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";

interface Lecturer {
  id: string;
  firstName: string;
  lastName: string;
  userId: string;
  email: string;
  phone: string;
  department: string;
  role: string;
  type: string;
  password: string;
  confirmPassword: string;
}

const LecturerTab = () => {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Lecturer, 'id'>>({
    firstName: '', lastName: '', userId: '', email: '', phone: '', department: '', role: '', type: '', password: '', confirmPassword: ''
  });

  const openAdd = () => {
    setEditingId(null);
    setForm({ firstName: '', lastName: '', userId: '', email: '', phone: '', department: '', role: '', type: '', password: '', confirmPassword: '' });
    setModalOpen(true);
  };

  const openEdit = (lec: Lecturer) => {
    setEditingId(lec.id);
    setForm({
      firstName: lec.firstName,
      lastName: lec.lastName,
      userId: lec.userId,
      email: lec.email,
      phone: lec.phone,
      department: lec.department,
      role: lec.role,
      type: lec.type,
      password: lec.password,
      confirmPassword: lec.confirmPassword
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setLecturers(prev => prev.filter(l => l.id !== id));
  };

  const handleSubmit = () => {
    const { firstName, lastName, userId, email, password, confirmPassword } = form;
    if (!firstName || !lastName || !userId || !email || !password) {
      alert('First Name, Last Name, User ID, Email, and Password required');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    if (editingId) {
      // update
      setLecturers(prev => prev.map(l => l.id === editingId ? { id: editingId, ...form } : l));
    } else {
      // add
      setLecturers(prev => [...prev, { id: Date.now().toString(), ...form }]);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Lecturers</h2>
        <Button onClick={openAdd} className="bg-amber-700 text-white hover:bg-amber-800">
          Add Lecturer
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">User ID</th>
              <th className="p-3">Email</th>
              <th className="p-3">Department</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((lec, idx) => (
              <tr key={lec.id} className={idx % 2 === 0 ? 'bg-amber-50' : 'bg-white'}>
                <td className="p-3">{lec.firstName} {lec.lastName}</td>
                <td className="p-3">{lec.userId}</td>
                <td className="p-3">{lec.email}</td>
                <td className="p-3">{lec.department}</td>
                <td className="p-3 flex gap-2">
                  <button onClick={() => openEdit(lec)} className="text-blue-600 hover:text-blue-800">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(lec.id)} className="text-red-600 hover:text-red-800">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Lecturer' : 'Add Lecturer'}</h2>
            <div className="grid grid-cols-2 gap-4">
              {['First Name','Last Name','User ID','Email','Phone','Department','Role','Type','Password','Confirm Password'].map((label, i) => {
                const key = label.replace(/ /g,'').charAt(0).toLowerCase() + label.replace(/ /g,'').slice(1);
                return (
                  <div key={i}>
                    <label className="block text-gray-700 mb-1">{label}:</label>
                    <input
                      type={/(password)/i.test(label) ? 'password' : label==='Email' ? 'email' : 'text'}
                      value={form[key as keyof typeof form] as string}
                      onChange={e => setForm(prev => ({ ...prev, [key]: e.target.value }))}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                );
              })}
            </div>
            <div className="mt-6 text-sm text-gray-600">
              By submitting, you agree to Terms of Use and acknowledge the Privacy Policy.
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100">Cancel</button>
              <button onClick={handleSubmit} className="px-6 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 flex items-center">
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
