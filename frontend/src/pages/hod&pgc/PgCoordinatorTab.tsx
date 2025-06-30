import { useState,  } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";


interface PGCoordinator {
  id: string;
  name: string;
  role: string;
}

const PgCoordinatorTab = () => {
   // Access user role
  const [pgCords, setPgCords] = useState<PGCoordinator[]>([
    { id: "1", name: "Dr. Florence Okeke", role: "PG Coordinator" },
    { id: "2", name: "Prof. Musa Ibrahim", role: "PG Coordinator" },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("PG Coordinator");

  const handleAdd = () => {
    if (!newName.trim() || !newRole.trim()) return;
    setPgCords([
      ...pgCords,
      { id: Date.now().toString(), name: newName, role: newRole },
    ]);
    setNewName("");
    setNewRole("PG Coordinator");
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setPgCords(pgCords.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">PG Coordinators</h2>
        
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-amber-700 text-white hover:bg-amber-800"
          >
            Add PG Coordinator
          </Button>
        
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Role</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pgCords.map((cord, idx) => (
              <tr
                key={cord.id}
                className={idx % 2 === 0 ? "bg-amber-50" : "bg-white"}
              >
                <td className="p-3">{cord.name}</td>
                <td className="p-3">{cord.role}</td>
                <td className="p-3">
                  <button
                    onClick={() => handleDelete(cord.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Add PG Coordinator</h2>

            <div className="mb-4">
              <label className="block text-sm mb-1">Full Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
                placeholder="e.g. Dr. Musa Ali"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm mb-1">Role</label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option>PG Coordinator</option>
                <option>Co-Supervisor</option>
                <option>External Examiner</option>
              </select>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PgCoordinatorTab;
