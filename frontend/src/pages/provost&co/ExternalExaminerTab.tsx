// src/provost/ExternalExaminerTab.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Trash2, Edit2 } from "lucide-react";

interface Examiner {
  id: string;
  name: string;
  email: string;
  department: string;
  faculty: string;
}

// Mock departments/faculties
const departments = ["Computer Science", "Electrical Engineering", "Statistics"];
const faculties = ["Faculty of Engineering", "Faculty of Science", "Faculty of Arts"];

export default function ExternalExaminerTab() {
  const [examiners, setExaminers] = useState<Examiner[]>([
    {
      id: "e1",
      name: "Dr. Jane Doe",
      email: "jane.doe@example.com",
      department: "Computer Science",
      faculty: "Faculty of Engineering",
    },
    {
      id: "e2",
      name: "Prof. John Smith",
      email: "john.smith@example.com",
      department: "Statistics",
      faculty: "Faculty of Science",
    },
  ]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Examiner, "id">>({
    name: "",
    email: "",
    department: departments[0],
    faculty: faculties[0],
  });

  const openEdit = (ex: Examiner) => {
    setEditingId(ex.id);
    setForm({
      name: ex.name,
      email: ex.email,
      department: ex.department,
      faculty: ex.faculty,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this external examiner?")) {
      setExaminers((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleSubmit = () => {
    const { name, email, department, faculty } = form;
    if (!name.trim() || !email.trim()) {
      alert("Name and email are required.");
      return;
    }
    if (editingId) {
      setExaminers((prev) =>
        prev.map((e) =>
          e.id === editingId ? { id: editingId, name, email, department, faculty } : e
        )
      );
    } else {
      const newEx: Examiner = {
        id: Date.now().toString(),
        name,
        email,
        department,
        faculty,
      };
      setExaminers((prev) => [...prev, newEx]);
    }
    setModalOpen(false);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
          External Examiners
        </h2>
        
      </div>

      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        <table className="w-full min-w-[600px] text-left">
          <thead>
            <tr className="bg-gray-100 text-sm">
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Department</th>
              <th className="p-3 border-b">Faculty</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {examiners.map((ex, idx) => (
              <tr key={ex.id} className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}>
                <td className="p-3 border-b">{ex.name}</td>
                <td className="p-3 border-b">{ex.email}</td>
                <td className="p-3 border-b">{ex.department}</td>
                <td className="p-3 border-b">{ex.faculty}</td>
                <td className="p-3 border-b flex gap-2">
                  <button
                    onClick={() => openEdit(ex)}
                    className="text-blue-600 hover:text-blue-800"
                    aria-label={`Edit ${ex.name}`}
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(ex.id)}
                    className="text-red-600 hover:text-red-800"
                    aria-label={`Delete ${ex.name}`}
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {examiners.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No external examiners added.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md w-full mx-4 sm:mx-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Examiner" : "Add Examiner"}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-gray-700 mb-1">Name</label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Email address"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Department</label>
              <Select
                value={form.department}
                onValueChange={(val) => setForm((f) => ({ ...f, department: val }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Faculty</label>
              <Select
                value={form.faculty}
                onValueChange={(val) => setForm((f) => ({ ...f, faculty: val }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select faculty" />
                </SelectTrigger>
                <SelectContent>
                  {faculties.map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setModalOpen(false)} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="w-full sm:w-auto bg-amber-700 text-white">
              {editingId ? "Save Changes" : "Add Examiner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
