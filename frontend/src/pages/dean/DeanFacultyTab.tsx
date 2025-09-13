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

export default function DeanFacultyTab() {
  const { token, user } = useAuth();
  const { toast } = useToast();

  // role checks - adjust checks to match your app's role strings

  const isDean = user?.role?.toUpperCase() === "DEAN";

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

      const url = `${baseUrl}/lecturer/faculty`;
      console.log("=== debug: loadFacultyStaff starting ===");
      console.log("Requesting:", url);
      console.log("Token present:", !!token, token?.slice?.(0, 10));

      // 1) decode token payload (if it's a JWT) so we can inspect claims
      try {
        if (token) {
          const parts = token.split(".");
          if (parts.length >= 2) {
            const payload = parts[1];
            const json = JSON.parse(
              atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
            );
            console.log("Decoded token payload:", json);
          } else {
            console.log("Token does not look like JWT:", token);
          }
        }
      } catch (err) {
        console.warn("Failed to decode token:", err);
      }

      // 2) AXIOS request (your usual path) - log config & response
      const axiosConfig = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      };
      console.log("Axios request config:", axiosConfig);

      let axiosRes;
      try {
        axiosRes = await axios.get(url, axiosConfig);
        console.log("AXIOS: status:", axiosRes.status);
        console.log("AXIOS: config.headers sent:", axiosRes.config?.headers);
        console.log("AXIOS: full response.data:", axiosRes.data);
        // If you want to inspect raw XHR:
        // console.log("AXIOS: xhr (response.request):", axiosRes.request);
      } catch (axErr: any) {
        console.error(
          "AXIOS request error:",
          axErr,
          axErr?.response?.status,
          axErr?.response?.data
        );
      }

      // 3) FETCH request (raw) to compare what the server returns without axios
      try {
        const fetchRes = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });
        console.log("FETCH: status:", fetchRes.status);
        // log response headers (some browsers don't allow reading all headers due to CORS — but log what you can)
        try {
          const headersObj: Record<string, string> = {};
          fetchRes.headers.forEach((v, k) => (headersObj[k] = v));
          console.log("FETCH: response.headers:", headersObj);
        } catch (hErr) {
          console.warn("FETCH: could not read response headers:", hErr);
        }

        const txt = await fetchRes.text();
        console.log("FETCH: raw text:", txt);

        // try to parse JSON
        try {
          const json = JSON.parse(txt);
          console.log("FETCH: parsed json:", json);
        } catch (jErr) {
          console.warn("FETCH: could not parse JSON:", jErr);
        }
      } catch (fErr) {
        console.error("FETCH request error:", fErr);
      }

      // 4) For now keep UI stable — if axiosRes exists and has data, set staff
      if (axiosRes && axiosRes.data) {
        const arr = Array.isArray(axiosRes.data)
          ? axiosRes.data
          : Array.isArray(axiosRes.data?.data)
          ? axiosRes.data.data
          : null;

        console.log("AXIOS: resolved array (arr):", arr);
        if (Array.isArray(arr) && arr.length) {
          console.log("AXIOS: setting staff from arr length:", arr.length);
          // If you want to show the real items in the table, uncomment the next line:
          // setStaff(arr);
        } else {
          console.warn("AXIOS: returned array is empty or not present");
        }
      } else {
        console.warn("AXIOS: no response data to map");
      }

      console.log("=== debug: loadFacultyStaff finished ===");
    } catch (err) {
      console.error("Failed to load faculty staff (outer catch)", err);
      toast({
        title: "Error",
        description: "Failed to load faculty staff.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  // Derived filtered list (will be empty while we're debugging)
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

  // Confirmation modal handlers (unchanged)
  function openConfirm(id: string, action: "make" | "unmake") {
    setConfirmId(id);
    setConfirmAction(action);
  }

  async function performMakeUnmake(id: string, action: "make" | "unmake") {
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
    const prev = [...staff];

    setStaff((cur) =>
      cur.map((s) =>
        s.id === id || s._id === id
          ? { ...s, isFacultyRep: action === "make" }
          : s
      )
    );

    try {
      const payload: any = {
        staffId: item.staffId ?? item.id ?? item._id,
        id: item.id ?? item._id,
        make: action === "make",
      };

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

      const returned = res.data?.data ?? res.data ?? null;
      if (returned) {
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
