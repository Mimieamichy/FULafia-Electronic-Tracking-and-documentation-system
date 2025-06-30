import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface PGCoordinator {
  id: string;
  name: string;
  role: string;
}

const PgCoordinatorTab = () => {
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
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          PG Coordinators
        </h2>

        <Button
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-700 text-white hover:bg-amber-800 min-w-[180px]"
        >
          Add PG Coordinator
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="min-w-[480px] w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left text-sm sm:text-base">
              <th className="p-3 whitespace-nowrap border-b border-gray-200">Name</th>
              <th className="p-3 whitespace-nowrap border-b border-gray-200">Role</th>
              <th className="p-3 whitespace-nowrap border-b border-gray-200">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pgCords.map((cord, idx) => (
              <tr
                key={cord.id}
                className={idx % 2 === 0 ? "bg-amber-50" : "bg-white"}
              >
                <td className="p-3 whitespace-nowrap border-b border-gray-200">{cord.name}</td>
                <td className="p-3 whitespace-nowrap border-b border-gray-200">{cord.role}</td>
                <td className="p-3 border-b border-gray-200">
                  <button
                    onClick={() => handleDelete(cord.id)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Delete ${cord.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {pgCords.length === 0 && (
              <tr>
                <td
                  colSpan={3}
                  className="p-4 text-center text-gray-500"
                >
                  No PG Coordinators found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-lg">
            <h2 className="text-lg font-semibold mb-5">Add PG Coordinator</h2>

            <div className="mb-5">
              <label className="block text-sm mb-1 font-medium text-gray-700">
                Full Name
              </label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-600"
                placeholder="e.g. Dr. Musa Ali"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm mb-1 font-medium text-gray-700">
                Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-amber-600"
              >
                <option>PG Coordinator</option>
                <option>Co-Supervisor</option>
                <option>External Examiner</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="w-full sm:w-auto px-4 py-2 bg-amber-700 text-white rounded hover:bg-amber-800 text-sm sm:text-base"
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
