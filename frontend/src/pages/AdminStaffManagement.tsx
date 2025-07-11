// src/pages/AdminStaffManagement.tsx
import { useState, useEffect } from "react";
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
  
  const [hods, setHods] = useState<LecturerRecord[]>([]);
  const [provosts, setProvosts] = useState<LecturerRecord[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedIdToDelete, setSelectedIdToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Create axios instance with interceptor - SINGLE SOURCE OF TRUTH
  const apiClient = axios.create({
    baseURL: baseUrl,
  });

  // Set up interceptor to handle token automatically
  useEffect(() => {
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        // Only add token if it exists and is not 'null' string
        if (token && token !== 'null' && token !== 'undefined') {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('🔑 Adding token to request:', token.substring(0, 20) + '...');
        } else {
          console.log('❌ No valid token available');
          delete config.headers.Authorization;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Cleanup interceptor on unmount
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor);
    };
  }, [token]);

  // Load data when token is available
  useEffect(() => {
    if (!token || token === 'null' || token === 'undefined') {
      console.log('❌ No valid token, skipping data load');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      try {
        console.log('🔄 Loading HODs and Provosts...');
        
        const [hodRes, provRes] = await Promise.all([
          apiClient.get<{ data: any[] }>('/lecturer/get-hods'),
          apiClient.get<{ data: any[] }>('/lecturer/get-provost'), // Fixed: different endpoint
        ]);

        console.log('✅ HODs loaded:', hodRes.data.data.length);
        console.log('✅ Provosts loaded:', provRes.data.data.length);

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
        console.error('❌ Error loading data:', err);
        toast({
          title: "Error",
          description: "Failed to load staff lists.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [token, toast]);

  const handleDelete = async (id: string) => {
    if (!token || token === 'null' || token === 'undefined') {
      toast({
        title: "Unauthorized",
        description: "No valid authentication token",
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

      // Remove from both lists
      setHods((prev) => prev.filter((x) => x.id !== id));
      setProvosts((prev) => prev.filter((x) => x.id !== id));

      toast({ 
        title: "Success", 
        description: "Staff member deleted successfully." 
      });
      
      console.log('✅ Lecturer deleted successfully');
    } catch (err) {
      console.error("❌ Delete error:", err);
      toast({
        title: "Error",
        description: "Failed to delete staff member.",
        variant: "destructive",
      });
    } finally {
      setDeletingId(null);
      setShowDeleteModal(false);
      setSelectedIdToDelete(null);
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
                  disabled={deletingId !== null}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                {isLoading ? 'Loading...' : 'No records found.'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Don't render if no token
  if (!token || token === 'null' || token === 'undefined') {
    return (
      <div className="p-6">
        <div className="text-center text-gray-500">
          Please log in to access staff management.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Staff Management</h1>

      <Tabs
        value={activeTab}
        onValueChange={(val: string) => setActiveTab(val as typeof activeTab)}
      >
        <TabsList>
          <TabsTrigger value="hod">HODs ({hods.length})</TabsTrigger>
          <TabsTrigger value="provost">Provost ({provosts.length})</TabsTrigger>
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
            Are you sure you want to delete this staff member? This action cannot be undone.
          </p>
          <DialogFooter className="mt-6 flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedIdToDelete(null);
              }}
              disabled={deletingId !== null}
            >
              Cancel
            </Button>
            <Button
              className="bg-red-600 text-white hover:bg-red-700"
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