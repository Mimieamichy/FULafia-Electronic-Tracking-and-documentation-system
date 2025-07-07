// src/pages/Admin.tsx
import React, { useState, useEffect } from "react";
import { Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import AddHodModal from "@/components/AddHodModal";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "./AuthProvider";   // adjust path as needed

export interface HOD {
  id: string;
  name: string;
  title: string;
}

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const Admin = () => {
  const { user, token } = useAuth();
  const [hods, setHods] = useState<HOD[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // 1️⃣ Set axios default header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // 2️⃣ Fetch existing HODs on mount
  useEffect(() => {
    async function loadHods() {
      try {
        const res = await axios.get<{ data: HOD[] }>(
          `${baseUrl}/admin/lecturers/get-hods`
        );
        setHods(res.data.data);
      } catch (err) {
        console.error("Failed to load HODs", err);
      }
    }
    loadHods();
  }, []);

  const handleAddHod = (newHod: HOD) => {
    setHods((prev) => [...prev, newHod]);
  };

  return (
    <div className="min-h-screen bg-gray-100">
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
          <Link to="/" title="Sign out">
            <Power className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* List of HODs */}
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
                  <Button
                    variant="outline"
                    className="border-amber-700 text-amber-700 hover:bg-amber-100"
                    onClick={() => {
                      /* implement edit if you want */
                    }}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              No HODs found.
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-amber-700 hover:bg-amber-800 text-white"
          >
            Add HOD
          </Button>
        </div>
      </main>

      <AddHodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={async (hodData) => {
          // POST to your backend
          try {
            const res = await axios.post<{ data: HOD }>(
              `${baseUrl}/admin/lecturers/add-hod`,
              hodData
            );
            handleAddHod(res.data.data);
            setIsAddModalOpen(false);
          } catch (err) {
            console.error("Add HOD failed", err);
            alert("Failed to add HOD. Check console for details.");
          }
        }}
      />
    </div>
  );
};

export default Admin;
