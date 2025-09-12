// src/dean/DeanFacultyTab.tsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useAuth } from "../AuthProvider";
import { useToast } from "@/hooks/use-toast";

interface FacultyStaff {
  id: string;
  _id?: string;
  title?: string;
  firstName?: string;
  lastName?: string;
  staffId?: string;
  email?: string;
  role?: string;
  faculty?: string;
  department?: string;
  // possible flags the API may return
  isFacultyRep?: boolean;
  facultyRep?: any;
  raw?: any;
}

const baseUrl = import.meta.env.VITE_BACKEND_URL;

/**
 * DeanFacultyTab
 *
 * - Loads data from GET `${baseUrl}/lecturer/faculty`
 * - Allows a Dean to make/unmake a faculty PG rep via POST `${baseUrl}/lecturer/faculty_pg_rep`
 *
 * Notes:
 * - This component is defensive about API shapes (maps many possible fields).
 * - If your assign endpoint expects a different payload (eg. facultyId), edit make/unmake payload accordingly.
 */
export default function DeanFacultyTab() {
  const { token, user } = useAuth();
  const { toast } = useToast();

  // role checks - adjust checks to match your app's role strings
  const roleStr = (user?.role ?? "").toString().toLowerCase();
  const isDean = roleStr === "dean" || roleStr.includes("dean");

  const [staff, setStaff] = useState<FacultyStaff[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"make" | "unmake" | null>(
    null
  );

  // filters
  const [filterName, setFilterName] = useState("");
  const [filterFaculty, setFilterFaculty] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterStaffId, setFilterStaffId] = useState("");

  useEffect(() => {
    if (!token) {
      toast({
        title: "Not authorized",
        description: "Missing token",
        variant: "destructive",
      });
      return;
    }
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    loadFacultyStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function loadFacultyStaff() {
    try {
      setLoading(true);
      const res = await axios.get(`${baseUrl}/lecturer/faculty`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // try to find array in common places
      const arr: any[] = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
console.log("Raw faculty staff data", res.data);

      const mapped: FacultyStaff[] = (arr || []).map((r: any) => {
        // try many shapes
        const id = r._id ?? r.id ?? r.staffId ?? r.user?.id ?? "";
        const staffId =
          r.staffId ??
          r.staffID ??
          r.staff_id ??
          r.user?.staffId ??
          r.user?.staffID ??
          r.user?.staff_id ??
          "";
        const firstName =
          r.user?.firstName ?? r.firstName ?? r.fname ?? r.first_name ?? "";
        const lastName =
          r.user?.lastName ?? r.lastName ?? r.lname ?? r.last_name ?? "";
        const email = r.user?.email ?? r.email ?? "";
        const faculty = r.faculty ?? r.facultyName ?? r.faculty?.name ?? "";
        const department =
          r.department ??
          r.departmentName ??
          r.department?.name ??
          r.dept ??
          r.user?.department ??
          "";

        const isFacultyRep =
          !!r.isFacultyRep ||
          !!r.facultyRep ||
          !!r.is_faculty_rep ||
          !!r.is_fac_rep ||
          false;

        return {
          id,
          _id: r._id,
          title: r.title ?? r.user?.title ?? "",
          firstName,
          lastName,
          staffId,
          email,
          role: r.role ?? r.user?.role ?? "lecturer",
          faculty,
          department,
          isFacultyRep,
          facultyRep: r.facultyRep ?? r.faculty_rep ?? null,
          raw: r,
        };
      });
      console.log("Loaded faculty staff", mapped);
      setStaff(mapped);
    } catch (err) {
      console.error("Failed to load faculty staff", err);
      toast({
        title: "Error",
        description: "Failed to load faculty staff.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Derived filtered list
  const filtered = useMemo(() => {
    const nameTerm = filterName.trim().toLowerCase();
    const facultyTerm = filterFaculty.trim().toLowerCase();
    const deptTerm = filterDept.trim().toLowerCase();
    const staffTerm = filterStaffId.trim().toLowerCase();

    return staff.filter((s) => {
      if (nameTerm) {
        const full = `${s.firstName ?? ""} ${s.lastName ?? ""}`.toLowerCase();
        if (!full.includes(nameTerm)) return false;
      }
      if (facultyTerm && !(s.faculty ?? "").toLowerCase().includes(facultyTerm))
        return false;
      if (deptTerm && !(s.department ?? "").toLowerCase().includes(deptTerm))
        return false;
      if (staffTerm && !(s.staffId ?? "").toLowerCase().includes(staffTerm))
        return false;
      return true;
    });
  }, [staff, filterName, filterFaculty, filterDept, filterStaffId]);

  // Confirmation modal handlers
  function openConfirm(id: string, action: "make" | "unmake") {
    setConfirmId(id);
    setConfirmAction(action);
  }

  async function performMakeUnmake(id: string, action: "make" | "unmake") {
    // only Dean may perform this
    if (!isDean) {
      toast({
        title: "Not allowed",
        description: "Only a Dean can perform this action.",
        variant: "destructive",
      });
      return;
    }

    const item = staff.find((s) => s.id === id || s._id === id);
    if (!item) {
      toast({ title: "Not found", variant: "destructive" });
      setConfirmId(null);
      setConfirmAction(null);
      return;
    }

    setActionLoadingId(id);

    // Snapshot to rollback on error
    const prev = [...staff];

    // Optimistic update
    setStaff((cur) =>
      cur.map((s) =>
        s.id === id || s._id === id
          ? { ...s, isFacultyRep: action === "make" }
          : s
      )
    );

    try {
      // payload: be defensive. include staffId and id, and explicit action flag `make`
      const payload: any = {
        staffId: item.staffId ?? item.id ?? item._id,
        id: item.id ?? item._id,
        make: action === "make",
      };

      // call the assign/remove endpoint
      const res = await axios.post(
        `${baseUrl}/lecturer/faculty_pg_rep`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // if API returns updated object, patch into list
      const returned = res.data?.data ?? res.data ?? null;
      if (returned) {
        // try to map updated row
        setStaff((cur) =>
          cur.map((s) =>
            s.id === id || s._id === id
              ? {
                  ...s,
                  isFacultyRep:
                    returned.isFacultyRep ??
                    returned.facultyRep ??
                    returned.is_faculty_rep ??
                    action === "make",
                  facultyRep: returned.facultyRep ?? s.facultyRep ?? null,
                }
              : s
          )
        );
      }

      toast({
        title: action === "make" ? "Made Faculty Rep" : "Removed Faculty Rep",
      });
    } catch (err: any) {
      console.error("Make/unmake faculty rep failed", err);
      // rollback
      setStaff(prev);
      toast({
        title: "Error",
        description:
          err?.response?.data?.message ?? err?.message ?? "Action failed",
        variant: "destructive",
      });
    } finally {
      setActionLoadingId(null);
      setConfirmId(null);
      setConfirmAction(null);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Faculty Staff</h2>
        <div className="flex gap-3">
          <Input
            placeholder="Filter by name"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="w-60"
          />

          <Input
            placeholder="Filter by department"
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="w-48"
          />
          <Input
            placeholder="Filter by staff id"
            value={filterStaffId}
            onChange={(e) => setFilterStaffId(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-[900px] w-full text-left">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Staff ID</th>
              <th className="p-3">Email</th>
              <th className="p-3">Faculty</th>
              <th className="p-3">Department</th>
              <th className="p-3">Role</th>
              <th className="p-3">Faculty Rep</th>
              {isDean && <th className="p-3 text-right">Actions</th>}
            </tr>
          </thead>

          <tbody>
            {filtered.map((p, i) => (
              <tr
                key={p.id ?? p._id ?? i}
                className={i % 2 ? "bg-white" : "bg-amber-50"}
              >
                <td className="p-3 capitalize">{`${p.title ?? ""} ${
                  p.firstName ?? ""
                } ${p.lastName ?? ""}`}</td>
                <td className="p-3">{p.staffId ?? "-"}</td>
                <td className="p-3">{p.email ?? "-"}</td>
                <td className="p-3">{p.faculty ?? "-"}</td>
                <td className="p-3">{p.department ?? "-"}</td>
                <td className="p-3">
                  {(p.role ?? "Lecturer").replace(/_/g, " ")}
                </td>
                <td className="p-3">{p.isFacultyRep ? "Yes" : "No"}</td>

                {isDean && (
                  <td className="p-3 text-right">
                    {p.isFacultyRep ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          openConfirm(p.id ?? p._id ?? "", "unmake")
                        }
                        disabled={actionLoadingId === (p.id ?? p._id)}
                        title="Remove Faculty Rep"
                      >
                        <X size={14} /> Remove
                      </Button>
                    ) : (
                      <Button
                        className="bg-amber-700 text-white"
                        size="sm"
                        onClick={() => openConfirm(p.id ?? p._id ?? "", "make")}
                        disabled={actionLoadingId === (p.id ?? p._id)}
                        title="Make Faculty Rep"
                      >
                        <Check size={14} /> Make Rep
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))}

            {!filtered.length && (
              <tr>
                <td
                  colSpan={isDean ? 8 : 7}
                  className="p-4 text-center text-gray-500"
                >
                  {loading ? "Loading..." : "No staff found."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Confirmation modal */}
      {confirmId && confirmAction && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h4 className="text-lg font-medium mb-3">
              {confirmAction === "make"
                ? "Make Faculty Rep"
                : "Remove Faculty Rep"}
            </h4>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to{" "}
              {confirmAction === "make" ? "make" : "remove"} this staff member
              as a faculty rep?
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmId(null);
                  setConfirmAction(null);
                }}
                disabled={actionLoadingId === confirmId}
              >
                Cancel
              </Button>
              <Button
                className="bg-amber-700 text-white"
                onClick={() => performMakeUnmake(confirmId!, confirmAction!)}
                disabled={actionLoadingId === confirmId}
              >
                {actionLoadingId === confirmId
                  ? "Processing…"
                  : confirmAction === "make"
                  ? "Make Rep"
                  : "Remove"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
