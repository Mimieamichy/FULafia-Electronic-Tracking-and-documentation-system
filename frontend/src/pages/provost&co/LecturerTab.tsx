// src/hod&pgc/LecturerTab.tsx
import  { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "../AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface Lecturer {
  id: string;
  title: string;
  firstName: string;
  lastName: string;
  staffId: string;
  email: string;
  role: string;
}

interface Option {
  label: string;
  value: string;
}

const baseUrl = import.meta.env.VITE_BACKEND_URL;

// Titles for dropdown
const titleOptions = [
  "Mr.",
  "Mrs.",
  "Miss.",
  "Dr.",
  "Engr.",
  "Prof.",
  "Assoc. Prof.",
];

// Roles for dropdown
const baseRoleOptions: Option[] = [{ label: "Lecturer", value: "lecturer" }];

export default function LecturerTab() {
  const { token, user } = useAuth();
  const isHod = user?.role?.toUpperCase() === "HOD";
  const isProvost = user?.role?.toUpperCase() === "PROVOST";
  const { toast } = useToast();

  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Omit<Lecturer, "id">>({
    title: "",
    firstName: "",
    lastName: "",
    staffId: "",
    email: "",
    role: "",
  });
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteModalId, setDeleteModalId] = useState<string | null>(null);

  // Build role options based on HOD/Provost
  const roleOptions: Option[] = [
    ...baseRoleOptions,
    ...(isHod
      ? [
          { label: "PG Coordinator", value: "pgcord" },
          { label: "Dean", value: "dean" },
        ]
      : []),
    ...(isProvost
      ? [{ label: "External Examiner", value: "external_examiner" }]
      : []),
  ];

  // Load lecturers list
  useEffect(() => {
    if (!token) {
      toast({ title: "Not authorized", variant: "destructive" });
      return;
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    loadLecturers();
  }, [token]);

  async function loadLecturers() {
    try {
      const res = await axios.get<{ data: any[] }>(
        `${baseUrl}/lecturer/department`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log("Loaded lecturers:", res.data.data);
      setLecturers(
        res.data.data.map((r) => ({
          id: r._id,
          title: r.title,
          firstName: r.user.firstName,
          lastName: r.user.lastName,
          staffId: r.staffId,
          email: r.user.email,
          role: r.user.roles[0].toUpperCase(),
        }))
      );
    } catch (err) {
      console.error("Load lecturers failed", err);
      toast({
        title: "Error",
        description: "Failed to load lecturers.",
        variant: "destructive",
      });
    }
  }

  function openAdd() {
    setForm({
      title: "",
      firstName: "",
      lastName: "",
      staffId: "",
      email: "",
      role: "",
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    // Validate
    for (const key of [
      "title",
      "firstName",
      "lastName",
      "staffId",
      "email",
      "role",
    ] as const) {
      if (!form[key]) {
        toast({
          title: "Validation Error",
          description: `Please fill in the ${key} field.`,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const res = await axios.post<{ data: any }>(
        `${baseUrl}/lecturer/add-lecturer`,
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const raw = res.data.data;
      setLecturers((prev) => [
        ...prev,
        {
          id: raw._id,
          title: raw.title,
          firstName: raw.user.firstName,
          lastName: raw.user.lastName,
          staffId: raw.staffId,
          email: raw.user.email,
          role: raw.role,
        },
      ]);
      setModalOpen(false);
    } catch (err) {
      console.error("Add lecturer failed", err);
      toast({
        title: "Error",
        description: "Failed to add lecturer.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function confirmDelete(id: string) {
    setDeletingId(id);
    try {
      await axios.delete(`${baseUrl}/lecturer/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLecturers((prev) => prev.filter((l) => l.id !== id));
    } catch (err) {
      console.error("Delete failed", err);
      toast({
        title: "Error",
        description: "Failed to delete lecturer.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setDeleteModalId(null);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Lecturers</h2>
        <Button onClick={openAdd} className="bg-amber-700 text-white">
          Add Lecturer
        </Button>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-[800px] w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Staff ID</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {lecturers.map((l, i) => (
              <tr key={l.id} className={i % 2 ? "bg-white" : "bg-amber-50"}>
                <td className="p-3 capitalize">
                  {l.title} {l.firstName} {l.lastName}
                </td>
                <td className="p-3">{l.staffId}</td>
                <td className="p-3">{l.email}</td>
                <td className="p-3">{l.role}</td>
                <td className="p-3 text-right">
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={() => setDeleteModalId(l.id)}
                    disabled={deletingId === l.id}
                  >
                    <Trash2 size={18} />
                  </Button>
                </td>
              </tr>
            ))}
            {!lecturers.length && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No lecturers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {deleteModalId && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h4 className="text-lg font-medium mb-4">
                Are you sure you want to delete this lecturer?
              </h4>
              <div className="flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setDeleteModalId(null)}
                  disabled={deletingId === deleteModalId}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 text-white"
                  onClick={() => confirmDelete(deleteModalId)}
                  disabled={deletingId === deleteModalId}
                >
                  {deletingId === deleteModalId ? "Deleting…" : "Delete"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Lecturer Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl p-6 overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-medium mb-4">Add Lecturer</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-gray-700 mb-1">Title</label>
                <Select
                  value={form.title}
                  onValueChange={(v) => setForm((f) => ({ ...f, title: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Title" />
                  </SelectTrigger>
                  <SelectContent>
                    {titleOptions.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, firstName: e.target.value }))
                  }
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, lastName: e.target.value }))
                  }
                />
              </div>

              {/* Staff ID */}
              <div>
                <label className="block text-gray-700 mb-1">Staff ID</label>
                <input
                  type="text"
                  className="w-full border rounded px-2 py-1"
                  value={form.staffId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, staffId: e.target.value }))
                  }
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border rounded px-2 py-1"
                  value={form.email}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, email: e.target.value }))
                  }
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-gray-700 mb-1">Role</label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleOptions.map(({ label, value }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setModalOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-amber-700 text-white"
                disabled={loading}
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
