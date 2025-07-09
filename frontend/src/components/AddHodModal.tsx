// src/components/AddHodModal.tsx
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
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

export interface NewHodData {
  title: string;
  firstName: string;
  lastName: string;
  staffId: string;
  email: string;
  faculty: string;
  department: string;
  role: "hod" | "provost"; // new field
}

interface AddHodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewHodData) => Promise<void>;
}

export default function AddHodModal({
  isOpen,
  onClose,
  onSubmit,
}: AddHodModalProps) {
  const [formData, setFormData] = useState<NewHodData>({
    title: "",
    firstName: "",
    lastName: "",
    staffId: "",
    email: "",
    faculty: "",
    department: "",
    role: "hod", // new field
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof NewHodData, value: string) => {
    setFormData((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await onSubmit(formData);

      // reset
      setFormData({
        title: "",
        firstName: "",
        lastName: "",
        staffId: "",
        email: "",
        faculty: "",
        department: "",
        role: "hod", // reset role
      });
      onClose();
    } catch (err: any) {
      console.error("Add HOD failed", err);
      setError(err.message || "Failed to add HOD");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-white max-h-[90vh] overflow-y-auto p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-gray-800">
            Add New HOD or Provost
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="text-red-500 text-sm px-2" role="alert">
              {error}
            </p>
          )}

          {/* Row 1: Title / First / Last */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Title</label>
              <Select
                value={formData.title}
                onValueChange={(val) => handleChange("title", val)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Title" />
                </SelectTrigger>
                <SelectContent>
                  {["MR.", "MRS.", "MISS.", "DR.", "PROF.", "ENGR."].map(
                    (t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => handleChange("firstName", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => handleChange("lastName", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Row 2: Staff ID / Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Staff ID</label>
              <Input
                value={formData.staffId}
                onChange={(e) => handleChange("staffId", e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Role</label>
            <Select
              value={formData.role}
              onValueChange={(val) =>
                handleChange("role", val as "hod" | "provost")
              }
              required
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hod">HOD</SelectItem>
                <SelectItem value="provost">Provost</SelectItem>
              </SelectContent>
            </Select>
          </div>


          {/* Row 3: Faculty / Department */}
          {formData.role === "hod" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Faculty</label>
                <Select
                  value={formData.faculty}
                  onValueChange={(val) => handleChange("faculty", val)}
                  required={formData.role === "hod"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Engineering",
                      "Science",
                      "Arts",
                      "Business",
                      "Education",
                      "Law",
                      "Computing",
                    ].map((fac) => (
                      <SelectItem key={fac} value={fac}>
                        {fac}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Department</label>
                <Select
                  value={formData.department}
                  onValueChange={(val) => handleChange("department", val)}
                  required={formData.role === "hod"}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "Computer Science",
                      "Electrical",
                      "Mechanical",
                      "Civil",
                      "Statistics",
                    ].map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          
          <DialogFooter className="flex justify-end gap-4 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="min-w-[100px]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-700 text-white min-w-[100px]"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add HOD"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
