// src/pages/AdminStaffManagement.tsx
import  { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "./AuthProvider";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface LecturerRecord {
  id: string;
  title: string;
  name: string;
  email: string;
  dept?: string; // Optional for HODs
  faculty?: string; // Optional for HODs
}

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function AdminStaffManagement() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"hod" | "provost">("hod");
//  console.log("🔍 token in AdminStaffManagement =", token);

  const [hods, setHods] = useState<LecturerRecord[]>([]);
  const [provosts, setProvosts] = useState<LecturerRecord[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(
    null
  );

  

 useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // load lists
  useEffect(() => {
    if (!token) return; 
    const load = async () => {
      // console.log("About to fetch HODs with token:", token)
      try {
        const [hodRes, provRes] = await Promise.all([
          axios.get<{ data: any[] }>(`${baseUrl}/lecturer/get-hods`, ),
            axios.get<{ data: any[] }>(`${baseUrl}/lecturer/get-hods`,),
          ]);

         console.log("HODs response:", hodRes.data);
        setHods(
          hodRes.data.data.map((raw) => ({
            id: raw._id,
            title: raw.title,
            name: `${raw.user.firstName} ${raw.user.lastName}`,
            email: raw.user.email,
            dept: raw.department,
            faculty: raw.faculty,
          }))
        );

        setProvosts(
          provRes.data.data.map((raw) => ({
            id: raw._id,
            title: raw.title,
            name: `${raw.user.firstName} ${raw.user.lastName}`,
            email: raw.user.email,
            
          }))
        );
      } catch (err) {
        console.error(err);
        toast({
          title: "Error",
          description: "Failed to load lists.",
          variant: "destructive",
        });
      }
    };
    load();
  }, [token, toast]);

  const handleDelete = async (id: string) => {
    if (!token) {
      toast({
        title: "Unauthorized",
        description: "No token provided",
        variant: "destructive",
      });
      return;
    }

    setDeletingId(id);
    try {
      await axios.delete(`${baseUrl}/lecturer/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Remove from both hod and provost
      setHods((h) => h.filter((x) => x.id !== id));
      setProvosts((p) => p.filter((x) => x.id !== id));

      toast({ title: "Deleted", description: "Record removed." });
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast({
        title: "Error",
        description: "Delete failed.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
    }
  };

  const renderTable = (data: LecturerRecord[]) => (
    <div className="overflow-x-auto">
      <table className="min-w-[600px] w-full text-left">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 border-b">Title</th>
            <th className="p-3 border-b">Name</th>
            <th className="p-3 border-b">Email</th>
            <th className="p-3 border-b">Department</th>
            <th className="p-3 border-b">Faculty</th> 
            <th className="p-3 border-b text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={row.id}
              className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}
            >
              <td className="p-3 border-b">{row.title}</td>
              <td className="p-3 border-b capitalize">{row.name}</td>
              <td className="p-3 border-b">{row.email}</td>
              <td className="p-3 border-b">{row.dept}</td>
              <td className="p-3 border-b">{row.faculty}</td>
              <td className="p-3 border-b text-right">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setSelectedIdToDelete(row.id);
                    setShowDeleteModal(true);
                  }}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Staff Management</h1>

      <Tabs
        value={activeTab}
        onValueChange={(val: string) => setActiveTab(val as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="hod">HODs</TabsTrigger>
          <TabsTrigger value="provost">Provost</TabsTrigger>
        </TabsList>

        <TabsContent value="hod" className="pt-4">
          {renderTable(hods)}
        </TabsContent>

        <TabsContent value="provost" className="pt-4">
          {renderTable(provosts)}
        </TabsContent>
      </Tabs>

      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Confirm Delete</DialogTitle>
      </DialogHeader>
      <p className="text-gray-700">
        Are you sure you want to delete this user?
      </p>
      <DialogFooter className="mt-6 flex justify-end gap-2">
        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
          Cancel
        </Button>
        <Button
          className="bg-red-600 text-white"
          onClick={() => {
            if (selectedIdToDelete) handleDelete(selectedIdToDelete);
          }}
          disabled={deletingId !== null}
        >
          {deletingId === selectedIdToDelete ? "Deleting…" : "Delete"}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
    </div>
  );
}
