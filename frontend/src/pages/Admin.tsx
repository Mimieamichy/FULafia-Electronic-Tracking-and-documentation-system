// src/pages/Admin.tsx
import React, { useState, useEffect } from "react";
import { Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddHodModal from "@/components/AddHodModal";
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
import AdminStaffManagement from "./AdminStaffManagement";

export interface HOD {
  id: string;
  title: string;
  name: string;
}

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const Admin = () => {
  const { toast } = useToast();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [hods, setHods] = useState<HOD[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch HODs

  const handleAddHod = (newHod: HOD) => setHods((prev) => [...prev, newHod]);

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
          <button onClick={() => setShowLogoutModal(true)}>
            <Power className="w-6 h-6 text-red-500 hover:text-red-600" />
          </button>
        </div>
      </header>

      {/* Main */}

      <main className="container mx-auto px-4 py-8">
        <AdminStaffManagement />

        <div className="flex justify-end">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-700 text-white"
          >
            Add HOD
          </Button>
        </div>
      </main>

      {/* Add HOD Modal */}
      <AddHodModal
  isOpen={isAddModalOpen}
  onClose={() => setIsAddModalOpen(false)}
  onSubmit={async (payload) => {
    if (!token) {
      toast({ title: "Not authorized", variant: "destructive" });
      return;
    }

    // 1️⃣ Prepare the body: drop faculty/department for provost
    const body: Partial<typeof payload> = { 
      title:        payload.title,
      firstName:    payload.firstName,
      lastName:     payload.lastName,
      staffId:      payload.staffId,
      email:        payload.email,
      role:         payload.role,
      // only include these when role==='hod'
      ...(payload.role === "hod" && {
        faculty: payload.faculty,
        department: payload.department,
      }),
    };

    // 2️⃣ Pick the correct endpoint
    const endpoint =
      payload.role === "provost"
        ? "/lecturer/add-lecturer"
        : "/lecturer/add-hod";

    try {
      const res = await axios.post<{ data: any }>(
        `${baseUrl}${endpoint}`,
        body,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const raw = res.data.data;
      // 3️⃣ Map the returned object into your UI model
      const newRecord = {
        id: raw._id,
        title: raw.title,
        name: `${raw.user.firstName} ${raw.user.lastName}`,
        // email is already on raw.user.email
        email: raw.user.email,
        // if it's a HOD you might want to show faculty/department as well
        ...(payload.role === "hod" && {
          faculty: raw.faculty,
          department: raw.department,
        }),
      };

      handleAddHod(newRecord);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Add user failed", err);
      toast({
        title: "Error",
        description: "Failed to add user. Check console for details.",
        variant: "destructive",
      });
    }
  }}
/>

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
};

export default Admin;
