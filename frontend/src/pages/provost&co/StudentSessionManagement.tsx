// pgc/StudentSessionManagement.tsx
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Pen } from "lucide-react";
import AssignSupervisorModal from "./AssignSupervisorModal";
import SetDefenseModal from "./SetDefenseModal";
import { mockSaveDefense } from "@/lib/mockDefenseService";
import { useAuth } from "../AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { log } from "console";

interface StudentFromAPI {
  _id: string;
  matricNo: string;
  level: "msc" | "phd";
  currentStage: string;
  department: string;
  faculty: string;
  projectTopic: string;
  stageScores: Record<string, number>;
  majorSupervisor?:  string;
  minorSupervisor?: string;
  internalExaminer?: string;
  user?: { firstName: string; lastName: string };
}

interface Faculty {
  _id: string;
  name: string;
}
interface Department {
  _id: string;
  name: string;
}

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const StudentSessionManagement = () => {
  const { token, user } = useAuth(); // 'HOD' or 'PGC'

  const isHod = user?.role?.toUpperCase() === "HOD";

  const isProvost = user?.role?.toUpperCase() === "PROVOST";

  // Modal & selection state
  const [degreeTab, setDegreeTab] = useState<"MSc" | "PhD">("MSc");

  const defenseOptions = useMemo<string[]>(() => {
    return degreeTab === "MSc"
      ? ["Start", "Proposal Defense", "Internal Defense", "External Defense"]
      : [
          "Start",
          "Proposal Defense / 1st Seminar",
          "2nd Seminar",
          "3rd Seminar / Internal Defense",
          "External Defense",
        ];
  }, [degreeTab]);

  // If you use stageFlow for advancing stages, you can just mirror defenseOptions:
  const stageFlow = defenseOptions;
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string>("");
  const [defenseModalOpen, setDefenseModalOpen] = useState(false);
  const [defenseStage, setDefenseStage] = useState<string>(
    isProvost ? defenseOptions[3] : defenseOptions[0]
  );
  // 👇 new state
  const [selectedDepartmentForDefense, setSelectedDepartmentForDefense] =
    useState<string>("");

  const [sessionNames, setSessionNames] = useState<string[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>("");
  // Degree tab & search

  const [search, setSearch] = useState("");

  // Students state
  const [students, setStudents] = useState<StudentFromAPI[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 7;

  // Selected defense stage
  const [selectedDefense, setSelectedDefense] = useState<string>(
    isProvost ? defenseOptions[3] : defenseOptions[0]
  );
  // track which student we’re acting on
  const [actionModalOpen, setActionModalOpen] = useState(false);
  const [actionStudentId, setActionStudentId] = useState<string | null>(null);

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [facultiesLoading, setFacultiesLoading] = useState(false);
  const [facultiesError, setFacultiesError] = useState<string | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);

  // provost faculty/department fetch
  useEffect(() => {
    if (!isProvost) return;
    let cancelled = false;
    const fetchFaculties = async () => {
      setFacultiesLoading(true);
      setFacultiesError(null);
      try {
        const res = await fetch(`${baseUrl}/faculty/`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        const arr: any[] = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
          ? json.data
          : [];
        if (!cancelled) {
          const mapped = arr.map((f) => ({
            _id: f._id ?? f.id ?? "",
            name: f.name ?? f.facultyName ?? "",
          }));
          setFaculties(mapped);
          // optional: auto-select first faculty:
          // if (mapped[0]) setSelectedFacultyId(mapped[0]._id);
          console.log("Fetched faculties:", json);
        }
      } catch (err: any) {
        if (!cancelled)
          setFacultiesError(err?.message ?? "Failed to load faculties");
        setFaculties([]);
      } finally {
        if (!cancelled) setFacultiesLoading(false);
      }
    };
    fetchFaculties();
    return () => {
      cancelled = true;
    };
  }, [isProvost, token]);

  useEffect(() => {
    if (!isProvost) return;
    if (!selectedFacultyId) {
      setDepartments([]);
      setSelectedDepartmentForDefense("");
      return;
    }
    let cancelled = false;
    const fetchDepartments = async () => {
      setDepartmentsLoading(true);
      setDepartmentsError(null);
      try {
        // If your API expects a query param, change to:
        // const url = `${baseUrl}/department?facultyId=${selectedFacultyId}`;
        const url = `${baseUrl}/department/${selectedFacultyId}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        const arr: any[] = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
          ? json.data
          : [];
        if (!cancelled) {
          const mapped = arr.map((d) => ({
            _id: d._id ?? d.id ?? "",
            name: d.name ?? d.departmentName ?? "",
          }));
          setDepartments(mapped);
          // optionally auto-select first department:
          // setSelectedDepartmentForDefense(mapped[0]?._id ?? "");
          console.log("Fetched departments:", json);
        }
      } catch (err: any) {
        if (!cancelled)
          setDepartmentsError(err?.message ?? "Failed to load departments");
        setDepartments([]);
        setSelectedDepartmentForDefense("");
      } finally {
        if (!cancelled) setDepartmentsLoading(false);
      }
    };
    fetchDepartments();
    return () => {
      cancelled = true;
    };
  }, [isProvost, selectedFacultyId, token]);

  // Fetch sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await fetch(`${baseUrl}/session/department`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const json = await response.json();
        console.log("Raw payload:", json);

        // Grab the array from json.data (or fallback)
        const sessionsArray: any[] = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
          ? json.data
          : [];

        // Extract just the names
        const names = sessionsArray.map((s) => s.sessionName);
        console.log("Extracted session names:", names);

        setSessionNames(names);

        // If none selected yet, pick the first
      } catch (error) {
        console.error("Failed to fetch sessions:", error);
      }
    };

    fetchSessions();
  }, [token, selectedSession]);

  // Fetch students on mount

  useEffect(() => {
    const resolveDepartmentName = () => {
      if (isProvost) {
        if (!selectedDepartmentForDefense) return "";
        const found = departments.find(
          (d) => d._id === selectedDepartmentForDefense
        );
        return found?.name ?? "";
      }
      return user?.department || ""; // HOD/PGC: already a name string
    };

    let cancelled = false;

    const fetchStudents = async () => {
      const departmentName = resolveDepartmentName();

      // Skip fetch until provost picks a department
      if (isProvost && !departmentName) {
        setStudents([]);
        return;
      }

      // Choose the correct API segment based on the active tab
      const levelSeg = degreeTab === "MSc" ? "msc" : "phd";
      const url = `${baseUrl}/student/${levelSeg}/${encodeURIComponent(
        departmentName
      )}`;
      console.log("Fetching students from:", url);

      try {
        const res = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          const txt = await res.text();
          console.error("Failed fetching students:", res.status, txt);
          throw new Error(`Failed to fetch students (${res.status})`);
        }

        const json = await res.json();
        console.log("students payload:", json);

        if (cancelled) return;

        const dataArr = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
          ? json.data
          : [];

        setStudents(dataArr);
        
      } catch (err) {
        console.error("Error loading students:", err);
        if (!cancelled) setStudents([]);
      }
    };

    fetchStudents();

    return () => {
      cancelled = true;
    };
  }, [
    token,
    user?.department, // HOD/PGC name
    selectedDepartmentForDefense, // Provost selection (id)
    departments, // used to look up name
    isProvost,
    degreeTab, // 👈 re-fetch when switching MSc/PhD
  ]);

  // open the modal for a given student
  const openActionModal = (studentId: string) => {
    setActionStudentId(studentId);
    setActionModalOpen(true);
  };

  // close and clear selection
  const closeActionModal = () => {
    setActionModalOpen(false);
    setActionStudentId(null);
  };

  // Panel candidates (stub)
  const panelCandidates = [
    "Dr. Florence Okeke",
    "Prof. Musa Ibrahim",
    "Engr. Christabel Henry",
  ];
  const handleDefenseSubmit = async (data: {
    stage: string;
    date: string;
    time: string;
    panel: string[];
    department?: string; // 👈 department is optional
  }) => {
    console.log("Scheduling for department:", data.department);
    await mockSaveDefense(data);
  };

  // Assign supervisor handler
  const handleAssign = async (
    studentId: string,
    supType: "major" | "minor" | "internal_examiner",
    lecturerId: string,
    lecturerName: string
  ) => {
    // find student to get matricNo (fallback to studentId if needed)
    const student = students.find((s) => s._id === studentId);
    const matricNo = student?.matricNo ?? studentId;

    // optimistic UI update (optional) — update local students immediately
    setStudents((prev) =>
      prev.map((s) =>
        s._id === studentId
          ? {
              ...s,
              // store assignment as object so you have both id+name
              [supType]: { staffId: lecturerId, staffName: lecturerName },
            }
          : s
      )
    );

    try {
      const res = await fetch(
        `${baseUrl}/student/assignSupervisor/${encodeURIComponent(matricNo)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            type: supType,
            staffId: lecturerId,
            staffName: lecturerName,
            matNo: matricNo,
          }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to assign supervisor (${res.status}): ${text}`);
      }

      console.log("Supervisor assigned successfully");
    } catch (err) {
      console.error("Error assigning supervisor:", err);
    }
  };

  // Advance student stage handler
  const advanceStudentStage = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== studentId) return s;
        const currentIndex = stageFlow.findIndex(
          (st) => st === selectedDefense
        );
        const nextIndex = currentIndex + 1;
        if (nextIndex >= stageFlow.length) return s; // already final
        return s;
      })
    );
  };

  // when HOD clicks “Approve”
  const handleApprove = () => {
    if (actionStudentId) {
      advanceStudentStage(actionStudentId);
    }
    closeActionModal();
  };

  // Filter + paginate
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return (
      students
        // only those whose currentStage matches the dropdown
        .filter((s) => s.currentStage === selectedDefense.toLowerCase())
        // then apply the existing search filter
        .filter((s) => {
          const fullName = s.user
            ? `${s.user.firstName} ${s.user.lastName}`.toLowerCase()
            : "";
          return (
            s.matricNo.includes(term) ||
            fullName.includes(term) ||
            s.projectTopic.toLowerCase().includes(term)
          );
        })
    );
  }, [students, search, selectedDefense]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const closeDefenseModal = () => {
    setDefenseModalOpen(false);
    setSelectedDepartmentForDefense("");
  };

  return (
    <div className="space-y-6">
      {/* Degree Tabs */}
      <div className="flex border-b border-gray-200">
        {(["MSc", "PhD"] as const).map((dt) => (
          <button
            key={dt}
            onClick={() => {
              setDegreeTab(dt);
              setPage(1);
            }}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
              degreeTab === dt
                ? "border-amber-700 text-amber-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {dt}
          </button>
        ))}
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-wrap">
        <h2 className="text-lg font-semibold text-gray-800">
          {degreeTab} Ready for {selectedDefense}
        </h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center w-full sm:w-auto">
          {/* Defense Stage */}

          <div className="flex items-center gap-2">
            <span className="text-gray-700 text-sm">Defense:</span>
            <Select
              value={selectedDefense}
              onValueChange={(v) => {
                setSelectedDefense(v);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder={selectedDefense} />
              </SelectTrigger>
              <SelectContent>
                {defenseOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {/* Search */}
          <Input
            placeholder="Search Mat. No, Name or Topic"
            className="w-full sm:w-64"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          {/* Session Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-gray-700 text-sm">Session:</span>
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {sessionNames.length > 0 ? (
                  sessionNames.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled>No sessions available</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Non‑Provost: schedule all stages except External Defense */}
        {!isProvost && selectedDefense !== "External Defense" && (
          <div className="mt-2 sm:mt-0">
            <Button
              className="bg-amber-700 hover:bg-amber-800 text-white w-full sm:w-auto"
              onClick={() => {
                setDefenseStage(selectedDefense);
                setDefenseModalOpen(true);
              }}
            >
              Schedule {selectedDefense}
            </Button>
          </div>
        )}

        {isProvost && selectedDefense === "External Defense" && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
            {/* Faculty Selector */}
            <Select
              value={selectedFacultyId}
              onValueChange={setSelectedFacultyId}
            >
              <SelectTrigger className="w-56">
                <SelectValue
                  placeholder={
                    facultiesLoading ? "Loading..." : "Select Faculty"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {facultiesLoading ? (
                  <SelectItem disabled>Loading faculties...</SelectItem>
                ) : facultiesError ? (
                  <SelectItem disabled>{facultiesError}</SelectItem>
                ) : faculties.length ? (
                  faculties.map((f) => (
                    <SelectItem key={f._id} value={f._id}>
                      {f.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled>No faculties</SelectItem>
                )}
              </SelectContent>
            </Select>

            {/* Department Selector */}
            <Select
              value={selectedDepartmentForDefense}
              onValueChange={setSelectedDepartmentForDefense}
              disabled={
                !selectedFacultyId ||
                departmentsLoading ||
                departments.length === 0
              }
            >
              <SelectTrigger className="w-56">
                <SelectValue
                  placeholder={
                    !selectedFacultyId
                      ? "Choose faculty first"
                      : departmentsLoading
                      ? "Loading departments..."
                      : "Select Department"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {departmentsLoading ? (
                  <SelectItem disabled>Loading departments...</SelectItem>
                ) : departmentsError ? (
                  <SelectItem disabled>{departmentsError}</SelectItem>
                ) : departments.length ? (
                  departments.map((d) => (
                    <SelectItem key={d._id} value={d._id}>
                      {d.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem disabled>
                    {selectedFacultyId
                      ? "No departments"
                      : "Select faculty first"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>

            {/* Now that a department is chosen, enable schedule button */}
            <Button
              className="bg-amber-700 text-white w-full sm:w-auto"
              onClick={() => {
                setDefenseStage(selectedDefense);
                setDefenseModalOpen(true);
              }}
              disabled={!selectedDepartmentForDefense}
            >
              Schedule {selectedDefense}
            </Button>
          </div>
        )}
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto w-full">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 text-sm">
              {isProvost ? (
                <>
                  <th className="p-3 border">Matric No</th>
                  <th className="p-3 border">Full Name</th>
                  <th className="p-3 border">Project Topic</th>
                  <th className="p-3 border">Current Stage</th>
                  <th className="p-3 border">Department</th>
                  <th className="p-3 border">Faculty</th>
                </>
              ) : (
                <>
                  <th className="p-3 border">MAT NO.</th>
                  <th className="p-3 border">Full Name</th>
                  <th className="p-3 border">Topic</th>
                  <th className="p-3 border">Score for {selectedDefense}</th>
                  <th className="p-3 border">1st Supervisor</th>
                  <th className="p-3 border">2nd Supervisor</th>
                  {isHod && <th className="p-3 border">Action</th>}
                  <th className="p-3 border">Assign</th>
                </>
              )}
            </tr>
          </thead>

          <tbody>
            {paginated.map((s, idx) => {
              if (isProvost) {
                // For Provost we show just one row format:
                const currentStage = defenseStage;
                return (
                  <tr
                    key={s._id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}
                  >
                    <td className="p-3 border">{s.matricNo}</td>
                    <td className="p-3 border">
                      {s.user ? `${s.user.firstName} ${s.user.lastName}` : ""}
                    </td>
                    <td className="p-3 border">{s.projectTopic}</td>
                    <td className="p-3 border">{currentStage}</td>
                    <td className="p-3 border">{s.department}</td>
                    <td className="p-3 border">{s.faculty}</td>
                  </tr>
                );
              }

              // HOD/PGC row:
              const done =
                s.stageScores &&
                Object.keys(s.stageScores).length > 0 &&
                s.stageScores[selectedDefense.toLowerCase()] !== undefined;
              const notFinal =
                stageFlow.indexOf(defenseStage as any) < stageFlow.length - 1;

              return (
                <tr
                  key={s._id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}
                >
                  <td className="p-3 border">{s.matricNo}</td>
                  <td className="p-3 border capitalize">
                    {s.user ? `${s.user.firstName} ${s.user.lastName}` : ""}
                  </td>
                  <td className="p-3 border capitalize">{s.projectTopic}</td>
                  <td className="p-3 border">
                    {s.stageScores?.[selectedDefense.toLowerCase()] ?? "—"}
                  </td>
                  <td className="p-3 border capitalize">
                   { s.majorSupervisor || "Not Assigned"}
                  </td>
                  <td className="p-3 border capitalize">
                    {s.minorSupervisor || "Not Assigned"}
                  </td>

                  {isHod && (
                    <td className="p-3 border">
                      {done && notFinal ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openActionModal(s._id)}
                          aria-label="Open action menu"
                        >
                          <Pen className="w-4 h-4" />
                        </Button>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  )}
                  <td className="p-3 border">
                    <Button
                      size="sm"
                      className="bg-amber-700 text-white"
                      onClick={() => {
                        setCurrentStudentId(s._id); // <-- use _id
                        setAssignModalOpen(true);
                      }}
                    >
                      Assign
                    </Button>
                  </td>
                </tr>
              );
            })}

            {paginated.length === 0 && (
              <tr>
                <td
                  colSpan={isProvost ? 6 : isHod ? 11 : 10}
                  className="text-center p-4 text-gray-500"
                >
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center sm:justify-end items-center flex-wrap gap-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="p-2 border rounded hover:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
        >
          <ChevronLeft />
        </button>
        <span className="text-gray-700 text-sm">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="p-2 border rounded hover:bg-gray-100 disabled:text-gray-400 disabled:border-gray-200"
        >
          <ChevronRight />
        </button>
      </div>

      {/* Modals */}
      <AssignSupervisorModal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        studentId={currentStudentId}
        onSubmit={handleAssign}
      />

      <SetDefenseModal
        isOpen={defenseModalOpen}
        onClose={closeDefenseModal}
        defenseStage={defenseStage}
        lecturers={panelCandidates}
        onSubmit={(data) =>
          handleDefenseSubmit({
            ...data,
            department: isProvost ? selectedDepartmentForDefense : undefined,
          })
        }
      />

      <Dialog open={actionModalOpen} onOpenChange={closeActionModal}>
        <DialogContent className="max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle>Approve Next Stage?</DialogTitle>
          </DialogHeader>
          <p className="px-6 text-gray-700">
            Do you want to approve this student for the next stage or decline?
          </p>
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={closeActionModal}>
              Decline
            </Button>
            <Button className="bg-amber-700 text-white" onClick={handleApprove}>
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default StudentSessionManagement;
