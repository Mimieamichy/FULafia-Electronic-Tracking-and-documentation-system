// src/pages/Admin.tsx
import { useState, useEffect } from "react";
import { Power, Lock, EyeOff, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddHodModal, { NewHodData } from "@/components/AddHodModal";
import AdminStaffManagement from "./AdminStaffManagement";
import axios from "axios";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const { user, token, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [showOld, setShowOld] = useState(false);
const [showNew, setShowNew] = useState(false);


  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  // 1️⃣ Inject / remove axios Authorization header when token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <span className="text-gray-600">
          {new Date().toLocaleDateString(undefined, {
            weekday: "short",
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <div className="flex items-center gap-4">
          <span className="text-gray-600 uppercase">{user?.role}</span>
          <Lock
            className="w-6 h-6 text-gray-600 cursor-pointer"
            onClick={() => setResetModalOpen(true)}
          />
          <button onClick={() => setShowLogoutModal(true)}>
            <Power className="w-6 h-6 text-red-500 hover:text-red-600" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <AdminStaffManagement />

        <div className="flex justify-end">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-700 text-white"
          >
            Add HOD / Provost
          </Button>
        </div>
      </main>

      {/* Add HOD/Provost Modal */}
      <AddHodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (payload: NewHodData) => {
          if (!token) {
            toast({ title: "Not authorized", variant: "destructive" });
            return;
          }

          // Build payload: drop faculty/department if adding a provost
          const body: Partial<NewHodData> = {
            title: payload.title,
            firstName: payload.firstName,
            lastName: payload.lastName,
            staffId: payload.staffId,
            email: payload.email,
            role: payload.role,
            ...(payload.role === "hod" && {
              faculty: payload.faculty,
              department: payload.department,
            }),
          };

          // Choose endpoint based on role
          const endpoint =
            payload.role === "provost"
              ? "/lecturer/add-provost"
              : "/lecturer/add-hod";
          try {
            const res = await axios.post<{ data: any }>(
              `${baseUrl}${endpoint}`,
              body
            );
            toast({ title: "Success", description: "Staff added." });
            setIsAddModalOpen(false);
            // Ideally trigger a reload in AdminStaffManagement via context or a callback
          } catch (err) {
            console.error("Add staff failed", err);
            toast({
              title: "Error",
              description: "Failed to add staff. See console for details.",
              variant: "destructive",
            });
          }
        }}
      />

      {/* Update Password Modal */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent className="max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Update Password</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const oldPassword = (
                form.elements.namedItem("oldPassword") as HTMLInputElement
              ).value;
              const newPassword = (
                form.elements.namedItem("newPassword") as HTMLInputElement
              ).value;

              if (!oldPassword || !newPassword) {
                toast({
                  title: "Missing Fields",
                  description: "Please fill in both fields.",
                  variant: "destructive",
                });
                return;
              }

              try {
                await axios.post(
                  `${baseUrl}/user/update-password`,
                  { oldPassword, newPassword },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                toast({ title: "Success", description: "Password updated." });
                setResetModalOpen(false);
              } catch (err) {
                console.error("Password update failed", err);
                toast({
                  title: "Error",
                  description: "Failed to update password. Check credentials.",
                  variant: "destructive",
                });
              }
            }}
            className="space-y-4 p-2"
          >
            {/* Password visibility states */}
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm text-gray-700 mb-1">
                  Old Password
                </label>
                <input
                  name="oldPassword"
                  type={showOld ? "text" : "password"}
                  required
                  className="w-full border rounded px-3 py-2 pr-10"
                  placeholder="Enter old password"
                />
                <button
                  type="button"
                  onClick={() => setShowOld((prev) => !prev)}
                  className="absolute top-9 right-3 text-gray-500"
                  tabIndex={-1}
                >
                  {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <label className="block text-sm text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  name="newPassword"
                  type={showNew ? "text" : "password"}
                  required
                  className="w-full border rounded px-3 py-2 pr-10"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNew((prev) => !prev)}
                  className="absolute top-9 right-3 text-gray-500"
                  tabIndex={-1}
                >
                  {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <DialogFooter className="mt-4 flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setResetModalOpen(false)}
              >
                Cancel
              </Button>
              <Button className="bg-amber-700 text-white" type="submit">
                Update Password
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Modal */}
      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent className="max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mt-2">
            Are you sure you want to log out?
          </p>
          <DialogFooter className="mt-6 flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 text-white" onClick={handleLogout}>
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
