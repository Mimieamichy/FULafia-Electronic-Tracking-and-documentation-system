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

export interface HOD {
  id: string;
  name: string;
  title: string;
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
  useEffect(() => {
    const loadHods = async () => {
      if (!token) return;
      try {
        console.log("🔧 [Admin] fetching HODs with token:", token);
        const res = await axios.get<{ data: HOD[] }>(
          `${baseUrl}/admin/lecturers/get-hods`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setHods(res.data.data);
        console.log("📋 HODs loaded:", res.data.data);
      } catch (err) {
        console.error("Failed to load HODs", err);
        toast({
          title: "Error",
          description: "Could not load HOD list.",
          variant: "destructive",
        });
      }
    };
    loadHods();
  }, [token, toast]);

  const handleAddHod = (newHod: HOD) => {
    setHods((prev) => [...prev, newHod]);
  };

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
          <button
            onClick={() => setShowLogoutModal(true)}
            title="Sign out"
            className="cursor-pointer"
          >
            <Power className="w-6 h-6 text-red-500 hover:text-red-600" />
          </button>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="grid grid-cols-2 bg-gray-50 p-4 font-medium text-gray-700">
            <div>HODs</div>
            <div className="text-right">Action</div>
          </div>

          {hods.length > 0 ? (
            hods.map((hod, idx) => (
              <div
                key={hod.id}
                className={`grid grid-cols-2 p-4 items-center border-b ${
                  idx % 2 === 0 ? "bg-amber-50" : "bg-white"
                }`}
              >
                <div className="text-gray-800">
                  {hod.title} {hod.name}
                </div>
                <div className="text-right">
                  <Button variant="outline" className="border-amber-700 text-amber-700">
                    Edit
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No HODs found.</div>
          )}
        </div>

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
        onSubmit={async (hodData) => {
          if (!token) {
            toast({ title: "Not authorized", variant: "destructive" });
            return;
          }
          try {
            console.log("Sending HOD Data:", hodData, "token:", token);
            const res = await axios.post<{ data: HOD }>(
              `${baseUrl}/admin/lecturers/add-hod`,
              hodData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            console.log("Add HOD response:", res.data);
            handleAddHod(res.data.data);
            setIsAddModalOpen(false);
          } catch (err) {
            console.error("Add HOD failed", err);
            toast({
              title: "Error",
              description: "Failed to add HOD. Check console for details.",
              variant: "destructive",
            });
          }
        }}
      />

      {/* Logout Confirmation Modal */}
      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent className="max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-800">
              Confirm Logout
            </DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mt-2">
            Are you sure you want to log out?
          </p>
          <DialogFooter className="mt-6 flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white"
              onClick={handleLogout}
            >
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Admin;
