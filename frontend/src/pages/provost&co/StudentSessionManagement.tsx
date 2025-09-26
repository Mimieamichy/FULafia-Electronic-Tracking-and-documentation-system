// pgc/StudentSessionManagement.tsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Pen, X } from "lucide-react";
import AssignSupervisorModal from "./AssignSupervisorModal";
import ProvostViewStudentModal from "./ProvostViewStudentModal";
import SetDefenseModal from "./SetDefenseModal";
import EditStudentModal from "./EditStudentModal";
import { useAuth } from "../AuthProvider";
import AssignCollegeRepModal from "./AssignCollegeRepModal";
import waterMark from "../fulafia logo.png";
import ScoreSheetGenerator, { Criterion } from "./ScoreSheetGenerator";

interface StudentFromAPI {
  _id: string;
  matricNo: string;
  level: "msc" | "phd";
  currentStage: string;
  department: string;
  faculty: string;
  projectTopic: string;
  stageScores: Record<string, number>;
  majorSupervisor?: string;
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

// add a local Lecturer type (adjust fields if your API returns others)

const baseUrl = import.meta.env.VITE_BACKEND_URL;

// normalize and map helpers (paste near top)
const normalizeStage = (s?: string) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .replace(/[_\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

// map human label -> backend key (adjust RHS if your backend uses different strings)
const stageLabelToApiKeyMap: Record<string, string> = {
  start: "start",
  proposal: "proposal",
  "internal defense": "internal_defense",
  "external defense": "external_defense",
  "proposal defense": "proposal_defense",
  "2nd seminar": "second_seminar",
  "3rd seminar": "third_seminar",
};

const getStageKey = (label: string) => {
  const norm = normalizeStage(label);
  if (!norm) return "";
  if (stageLabelToApiKeyMap[norm]) return stageLabelToApiKeyMap[norm];
  return norm.replace(/\s+/g, "_"); // fallback
};

const START_KEY = getStageKey("Start");

// after getStageKey(...) helper
const EXTERNAL_DEFENSE_KEY = getStageKey("External Defense");

const getLabelFromKey = (key: string, labels: string[]) => {
  const found = labels.find((l) => getStageKey(l) === key);
  return found ?? key;
};

const StudentSessionManagement = () => {
  const { token, user } = useAuth(); // 'HOD' or 'PGC'

  const isHod = user?.role?.toUpperCase() === "HOD";

  const isProvost = user?.role?.toUpperCase() === "PROVOST";
  const isDean = user?.role?.toUpperCase() === "DEAN";
  const isPgc = user?.role?.toUpperCase() === "PGCORD";

  const { toast } = useToast();
  const noSessionWarnedRef = useRef(false);

  const [scoreSheetSaving, setScoreSheetSaving] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewStudentId, setViewStudentId] = useState<string | null>(null);
  const [scoreSheetOpen, setScoreSheetOpen] = useState(false); // you already had this
  const [initialRubricCriteria, setInitialRubricCriteria] = useState<
    any | null
  >(null); // holds the object you posted
  const [currentRubricDoc, setCurrentRubricDoc] = useState<any | null>(null); // holds the fetched rubric document

  // Modal & selection state
  const [degreeTab, setDegreeTab] = useState<"MSc" | "PhD">("MSc");

  const defenseOptions = useMemo<string[]>(() => {
    return degreeTab === "MSc"
      ? ["Start", "Proposal", "Internal Defense", "External Defense"]
      : [
          "Start",
          "Proposal Defense",
          "2nd Seminar",
          "3rd Seminar",
          "External Defense",
        ];
  }, [degreeTab]);

  const [assignModalOpen, setAssignModalOpen] = useState(false); // for HOD / PGC assign supervisor
  const [assignCollegeRepOpen, setAssignCollegeRepOpen] = useState(false); // for Provost
  const [currentStudentId, setCurrentStudentId] = useState<string>("");
  const [departmentName, setDepartmentName] = useState<string>("");

  const [defenseModalOpen, setDefenseModalOpen] = useState(false);
  const [defenseStage, setDefenseStage] = useState<string>(
    isProvost ? defenseOptions[3] : defenseOptions[0]
  );
  // 👇 new state
  const [selectedDepartmentForDefense, setSelectedDepartmentForDefense] =
    useState<string>("");

  const [selectedSession, setSelectedSession] = useState<string>("");
  // replace/alongside sessionNames state
  const [sessionsList, setSessionsList] = useState<
    { _id: string; sessionName: string }[]
  >([]);

  // Degree tab & search

  const [search, setSearch] = useState("");

  // Students state
  const [students, setStudents] = useState<StudentFromAPI[]>([]);

  // Pagination
  const [page, setPage] = useState(1);
  // pagination controlled by server
  const [itemsPerPage, setItemsPerPage] = useState<number>(10); // default, will be overwritten by API.limit
  const [totalStudents, setTotalStudents] = useState<number>(0);

  // Selected defense stage

  const [selectedDefense, setSelectedDefense] = useState<string>(
    isProvost
      ? getStageKey(defenseOptions[Math.min(3, defenseOptions.length - 1)])
      : getStageKey(defenseOptions[0])
  );

  const selectedDefenseLabel = getLabelFromKey(selectedDefense, defenseOptions);

  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [facultiesLoading, setFacultiesLoading] = useState(false);
  const [facultiesError, setFacultiesError] = useState<string | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>("");

  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [departmentsError, setDepartmentsError] = useState<string | null>(null);

  // keep selectedDefense valid when defenseOptions (degreeTab) changes
  useEffect(() => {
    const apiOptions = defenseOptions.map((d) => getStageKey(d));
    if (!apiOptions.includes(selectedDefense)) {
      setSelectedDefense(
        isProvost
          ? getStageKey(defenseOptions[Math.min(3, defenseOptions.length - 1)])
          : getStageKey(defenseOptions[0])
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defenseOptions, isProvost]);

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
        const url = `${baseUrl}/department/${selectedFacultyId}`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!res.ok) throw new Error(`Status ${res.status}`);
        const json = await res.json();
        console.log("Fetched departments:", json);
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
        const response = await fetch(`${baseUrl}/session/sessions`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const json = await response.json();

        const arr: any[] = Array.isArray(json)
          ? json
          : Array.isArray(json.data)
          ? json.data
          : [];
        console.log("first sessions", arr);

        const mapped = arr.map((s) => ({
          _id: s._id ?? s.id ?? s.sessionId ?? "",
          sessionName: s.sessionName ?? s.name ?? s.title ?? String(s),
        }));

        setSessionsList(mapped);

        // auto-select first session if none selected yet (optional)
        if (!selectedSession && mapped.length) {
          setSelectedSession(mapped[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      }
    };

    fetchSessions();
  }, [token, selectedSession]);

  // Fetch departments for Dean
  useEffect(() => {
    if (!isDean) return;
    let cancelled = false;

    const fetchDepartmentsForDean = async () => {
      setDepartmentsLoading(true);
      setDepartmentsError(null);
      try {
        const url = `${baseUrl}/department/`;
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
          // optional: auto-select the first department so Dean sees students immediately
          if (mapped.length) setSelectedDepartmentForDefense(mapped[0]._id);
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

    fetchDepartmentsForDean();

    return () => {
      cancelled = true;
    };
  }, [isDean, token, user]);

  // Fetch students on mount
  useEffect(() => {
    const resolveDepartmentName = () => {
      if (isProvost || isDean) {
        if (!selectedDepartmentForDefense) return "";
        const found = departments.find(
          (d) => d._id === selectedDepartmentForDefense
        );
        return found?.name ?? "";
      }

      return user?.department || ""; // HOD/PGC: already a name string
    };

    setDepartmentName(resolveDepartmentName());
    let cancelled = false;

    const fetchStudents = async () => {
      // require a session selection (you already handle this elsewhere)
      if (!selectedSession) {
        // show toast once (prevent repeated toasts on re-renders)
        if (!noSessionWarnedRef.current) {
          toast({
            title: "No session selected",
            description: "Please select a session to view students.",
            variant: "warning",
          });
          noSessionWarnedRef.current = true;
        }
        setStudents([]);
        setTotalStudents(0);
        return;
      }

      // reset the warned flag when a session is present so toast can show again later if needed
      noSessionWarnedRef.current = false;

      const departmentName = resolveDepartmentName();

      // Skip fetch until provost picks a department
      if ((isProvost || isDean) && !departmentName) {
        setStudents([]);
        setTotalStudents(0);
        return;
      }

      const stageSeg = getStageKey(selectedDefense);

      // level segment (msc | phd)
      const levelSeg = degreeTab === "MSc" ? "msc" : "phd";

      const url = `${baseUrl}/student/${levelSeg}/${encodeURIComponent(
        departmentName
      )}/${encodeURIComponent(
        selectedSession
      )}?page=${page}&limit=${itemsPerPage}${
        stageSeg ? `&stage=${encodeURIComponent(stageSeg)}` : ""
      }`;

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

        // adapt to your API envelope (example shows success/data/total/page/limit)
        const dataArr = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];
        setStudents(dataArr);

        // set server pagination values (guard with fallback)
        setTotalStudents(
          typeof json.total === "number" ? json.total : dataArr.length
        );
        // update page to server-reported page if present (keeps UI in sync)
        if (typeof json.page === "number") setPage(json.page);
        // update itemsPerPage from server limit if provided
        if (typeof json.limit === "number") setItemsPerPage(json.limit);
      } catch (err) {
        console.error("Error loading students:", err);
        if (!cancelled) {
          setStudents([]);
          setTotalStudents(0);
        }
      }
    };

    fetchStudents();

    return () => {
      cancelled = true;
    };
  }, [
    token,
    user?.department, // HOD/PGC name
    selectedDepartmentForDefense, // provost selection (id)
    departments, // used to look up name
    isProvost,
    degreeTab, // re-fetch when switching MSc/PhD
    selectedSession, // only fetch when a session is selected
    page, // <-- re-run when page changes
    itemsPerPage,
    selectedDefense, // re-run when defense stage changes
    toast, // re-run when limit changes (or when user changes page size)
    isDean,
  ]);

  const departmentNameToPass = (() => {
    // helper to resolve id -> name if needed
    const resolveIdToName = (candidate: string | undefined) => {
      if (!candidate) return "";
      // if candidate matches a dept id, return its name
      const foundById = departments.find((d) => d._id === candidate);
      if (foundById?.name) return foundById.name;
      // if candidate matches a dept name already (case-insensitive), return normalized name
      const foundByName = departments.find(
        (d) =>
          String(d.name ?? "").toLowerCase() === String(candidate).toLowerCase()
      );
      if (foundByName?.name) return foundByName.name;
      // otherwise candidate might already be a free-form name — return trimmed
      if (typeof candidate === "string" && candidate.trim() !== "")
        return candidate.trim();
      return "";
    };

    // treat explicit placeholder 'none' as empty
    const rawSel = selectedDepartmentForDefense;
    if (rawSel && rawSel !== "none") {
      // Provost/Dean: they set selectedDepartmentForDefense — try resolve
      const provostResolved = resolveIdToName(rawSel);
      if (provostResolved) return provostResolved;
    }

    // HOD / PGCord (or normal user): try user.department
    if (user?.department) {
      const hodResolved = resolveIdToName(user.department);
      if (hodResolved) return hodResolved;
    }

    // fallback: try from students list (first student)
    if (Array.isArray(students) && students.length > 0) {
      const sDept = students[0].department;
      if (sDept) {
        const studentResolved = resolveIdToName(sDept);
        if (studentResolved) return studentResolved;
        // if dept from student is plain string, use that
        if (typeof sDept === "string" && sDept.trim() !== "")
          return sDept.trim();
      }
    }

    // nothing found
    return "";
  })();

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

  // Assign college rep handler (for Provost)
  const handleAssignCollegeRep = async (lecturerId: string) => {
    if (!lecturerId) return;
    if (!currentStudentId) {
      toast({
        title: "No student selected",
        description: "Please select a student before assigning.",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = `${baseUrl}/student/assign-college-rep/${encodeURIComponent(
        lecturerId
      )}/${encodeURIComponent(currentStudentId)}`;

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        // body: JSON.stringify({}) // add if backend expects a body
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Assign failed (${res.status})`);
      }

      // success: update local student list UI if needed (optimistic update)
      setStudents((prev) =>
        prev.map((s) =>
          s._id === currentStudentId
            ? {
                ...s,
                collegeRep: {
                  staffId: lecturerId,
                  // you may also store staffName if you have it; here we keep id only
                },
              }
            : s
        )
      );

      toast({
        title: "Assigned",
        description: "College representative assigned successfully.",
        variant: "default",
      });
    } catch (err: any) {
      console.error("handleAssignCollegeRep error:", err);
      toast({
        title: "Assign failed",
        description: err?.message ?? "Could not assign college representative.",
        variant: "destructive",
      });
    } finally {
      setAssignCollegeRepOpen(false); // close modal
    }
  };

  // Score sheet publish handler
  const handleScoreSheetPublish = async (payload: {
    criteria: Criterion[];
  }) => {
    if (
      !payload?.criteria ||
      !Array.isArray(payload.criteria) ||
      payload.criteria.length === 0
    ) {
      toast({
        title: "No criteria",
        description: "Create at least one criterion before publishing.",
        variant: "destructive",
      });
      return;
    }

    const body = {
      criteria: payload.criteria.map((c) => ({
        name: c.title ?? String(c.title || ""),
        weight: Number(c.percentage || 0),
      })),
      departmentId: selectedDepartmentForDefense || undefined,
      stage: selectedDefense || undefined,
    };

    setScoreSheetSaving(true);
    try {
      const res = await fetch(`${baseUrl}/defence/dept-score-sheet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      // read text then try to parse to tolerate non-json responses
      const text = await res.text();
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }

      // Find created id from common places (body or Location header)
      const createdId =
        parsed?._id ??
        parsed?.id ??
        parsed?.data?._id ??
        parsed?.data?.id ??
        (res.headers.get("location")
          ? String(res.headers.get("location")).split("/").pop()
          : undefined);

      let finalDoc: any = null;
      if (createdId) {
        try {
          // prefer GETting the authoritative doc from the server
        } catch (getErr) {
          console.warn(
            "[publish] failed fetching rubric by id, falling back to POST body:",
            getErr
          );
          // fallback: use parsed body if GET fails
          finalDoc = parsed;
        }
      } else {
        // No id discovered — fallback to parsed POST body
        finalDoc = parsed;
      }

      // Normalize criteria from finalDoc (common shapes: finalDoc.criteria || finalDoc.data.criteria)
      const apiCriteria = Array.isArray(finalDoc?.criteria)
        ? finalDoc.criteria
        : Array.isArray(finalDoc?.data?.criteria)
        ? finalDoc.data.criteria
        : Array.isArray(parsed?.criteria)
        ? parsed.criteria
        : [];

      const mappedCriteria: Criterion[] = apiCriteria.map((c: any) => ({
        title: String(c.name ?? c.title ?? ""),
        percentage: Number(c.weight ?? c.percentage ?? 0),
        id: c._id ?? c.id ?? undefined,
      }));

      // set both the UI seed list and the full doc (for rubricId)
      setInitialRubricCriteria(mappedCriteria);
      setCurrentRubricDoc(finalDoc ?? null);

      if (!res.ok) {
        // Attempt to extract and present server error message
        let errText = `Server responded ${res.status}`;
        try {
          const j = typeof parsed === "object" ? parsed : null;
          if (j) errText = j?.message || j?.error || JSON.stringify(j);
          else errText = String(parsed ?? errText);
        } catch {}
        throw new Error(errText);
      }

      toast({
        title: "Rubric published",
        description: "Score sheet published and attached to the schedule.",
        variant: "default",
      });

      setScoreSheetOpen(false);
    } catch (err: any) {
      console.error("Failed publishing score sheet:", err);
      toast({
        title: "Publish failed",
        description: err?.message ?? String(err),
        variant: "destructive",
      });
    } finally {
      setScoreSheetSaving(false);
    }
  };

  // Delete criterion handler
  const handleDeleteCriterion = async (criterionId: string) => {
    if (!criterionId) return;

    try {
      // optional: optimistic UI remove
      setInitialRubricCriteria((prev) =>
        prev?.filter((c) => c.id !== criterionId)
      );

      const url = `${baseUrl}/defence/dept-score-sheet/delete/${encodeURIComponent(
        criterionId
      )}`;
      const res = await fetch(url, {
        method: "DELETE", // if your backend expects POST change to 'POST'
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const text = await res.text();
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }
      console.log("[deleteCriterion] status:", res.status, parsed);

      if (!res.ok) {
        // rollback optimistic removal on error
        // refetch or re-seed as fallback — simple rollback:

        throw new Error(parsed?.message ?? `HTTP ${res.status}`);
      }

      toast({
        title: "Deleted",
        description: "Criterion removed.",
        variant: "default",
      });

      // also update currentRubricDoc.criteria locally if you keep that doc
      setCurrentRubricDoc((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          criteria: (prev.criteria ?? []).filter(
            (c: any) => String(c._id ?? c.id) !== String(criterionId)
          ),
        };
      });
    } catch (err: any) {
      console.error("[deleteCriterion] failed:", err);
      toast({
        title: "Delete failed",
        description: err?.message ?? String(err),
        variant: "destructive",
      });
    }
  };

  // Filter + paginate
  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return (
      students
        .filter((s) => (s.currentStage ?? "").toString() === selectedDefense)

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

  // server-side pagination: compute pages from total + limit
  const totalPages = Math.max(1, Math.ceil(totalStudents / itemsPerPage));

  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const closeDefenseModal = () => {
    setDefenseModalOpen(false);
    setSelectedDepartmentForDefense("");
  };

  // near other hooks, add:
  const defenseStudentIds = useMemo(() => {
    // include all students whose currentStage matches the selected defense key
    if (!Array.isArray(students) || !selectedDefense) return [];
    return students
      .filter((s) => String(s.currentStage) === String(selectedDefense))
      .map((s) => s._id ?? s.id)
      .filter(Boolean) as string[];
  }, [students, selectedDefense]);

  console.log("Rendering ", defenseStudentIds.length, "students for", {
    selectedDefense,
    selectedDefenseLabel,
  });

  return (
    <div className="space-y-6">
      {isPgc && (
        <div className="mt-2 sm:mt-0">
          <Button
            className="border border-amber-700 text-amber-700 bg-amber-100 hover:bg-amber-50 w-full sm:w-auto"
            onClick={() => setScoreSheetOpen(true)}
          >
            Create ScoreSheet
          </Button>
        </div>
      )}
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
          {degreeTab} Ready for {selectedDefenseLabel}
        </h2>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-start sm:items-center w-full sm:w-auto">
          {/* Defense Stage */}

          <Select
            value={selectedDefense}
            onValueChange={(v) => {
              setSelectedDefense(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-48">
              {/* show the human label */}
              <SelectValue placeholder={selectedDefenseLabel} />
            </SelectTrigger>
            <SelectContent>
              {defenseOptions.map((opt) => (
                // value is the API key, label is the readable text
                <SelectItem key={opt} value={getStageKey(opt)}>
                  {opt}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                {sessionsList.length > 0 ? (
                  sessionsList.map((s) => (
                    // value is the session _id, label shows sessionName
                    <SelectItem key={s._id} value={s._id}>
                      {s.sessionName}
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
        {!isProvost &&
          selectedDefense !== EXTERNAL_DEFENSE_KEY &&
          selectedDefense !== START_KEY &&
          !isDean && (
            <div className="mt-2 sm:mt-0">
              <Button
                className="bg-amber-700 hover:bg-amber-800 text-white w-full sm:w-auto"
                onClick={() => {
                  setDefenseStage(selectedDefense);
                  setDefenseModalOpen(true);
                }}
              >
                Schedule {selectedDefenseLabel}
              </Button>
            </div>
          )}

        {isProvost && (
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
          </div>
        )}
        {isProvost && selectedDefense === EXTERNAL_DEFENSE_KEY && (
          <Button
            className="bg-amber-700 text-white w-full sm:w-auto"
            onClick={() => {
              setDefenseStage(selectedDefense);
              setDefenseModalOpen(true);
            }}
            disabled={!selectedDepartmentForDefense}
          >
            Schedule {selectedDefenseLabel}
          </Button>
        )}
        {isDean && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-4">
            {/* Department Selector (Dean) */}
            <Select
              value={selectedDepartmentForDefense}
              onValueChange={setSelectedDepartmentForDefense}
              disabled={departmentsLoading || departments.length === 0}
            >
              <SelectTrigger className="w-56">
                <SelectValue
                  placeholder={
                    departmentsLoading
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
                  <SelectItem disabled>No departments</SelectItem>
                )}
              </SelectContent>
            </Select>

            {/* NOTE: No schedule/assign buttons for Dean — they can only view */}
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
                  <th className="p-3 border">Assign</th>
                </>
              ) : isDean ? (
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
                  <th className="p-3 border">
                    Score for {selectedDefenseLabel}
                  </th>
                  <th className="p-3 border">1st Supervisor</th>
                  <th className="p-3 border">2nd Supervisor</th>
                  <th className="p-3 border">Assign</th>
                </>
              )}
            </tr>
          </thead>

          <tbody className="capitalize">
            {paginated.map((s, idx) => {
              if (isProvost || isDean) {
                return (
                  <tr
                    key={s._id}
                    className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}
                  >
                    <td className="p-3 border">{s.matricNo}</td>
                    <td className="p-3 border">
                      <button
                        title="View student"
                        className="text-amber-700 underline capitalize"
                        onClick={() => {
                          setViewStudentId(s._id);
                          setViewModalOpen(true);
                        }}
                      >
                        {s.user ? `${s.user.firstName} ${s.user.lastName}` : ""}
                      </button>
                    </td>
                    <td className="p-3 border">{s.projectTopic}</td>
                    <td className="p-3 border">{s.currentStage}</td>
                    <td className="p-3 border">{s.department}</td>
                    <td className="p-3 border">{s.faculty}</td>
                    {isProvost && (
                      <td className="p-3 border">
                        <Button
                          size="sm"
                          className="bg-amber-700 text-white"
                          onClick={() => {
                            setCurrentStudentId(s._id);
                            setAssignCollegeRepOpen(true);
                          }}
                        >
                          Assign
                        </Button>
                      </td>
                    )}
                  </tr>
                );
              }

              return (
                <tr
                  key={s._id}
                  className={idx % 2 === 0 ? "bg-white" : "bg-amber-50"}
                >
                  <td className="p-3 border">{s.matricNo}</td>
                  <td className="p-3 border">
                    {isPgc ? (
                      <button
                        title="Edit student"
                        className="text-amber-700 underline capitalize"
                        onClick={() => {
                          setCurrentStudentId(s._id);
                          setEditModalOpen(true);
                        }}
                      >
                        {s.user ? `${s.user.firstName} ${s.user.lastName}` : ""}
                      </button>
                    ) : s.user ? (
                      <button
                        title="View student"
                        className="text-amber-700 underline capitalize"
                        onClick={() => {
                          setViewStudentId(s._id);
                          setViewModalOpen(true);
                        }}
                      >
                        {s.user ? `${s.user.firstName} ${s.user.lastName}` : ""}
                      </button>
                    ) : (
                      ""
                    )}
                  </td>

                  <td className="p-3 border capitalize">{s.projectTopic}</td>
                  <td className="p-3 border">
                    {s.stageScores?.[selectedDefense.toLowerCase()] ?? "—"}
                  </td>
                  <td className="p-3 border capitalize">
                    {s.majorSupervisor || "Not Assigned"}
                  </td>
                  <td className="p-3 border capitalize">
                    {s.minorSupervisor || "Not Assigned"}
                  </td>

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
        <span className="text-sm text-gray-600">
          Showing page {page} of {totalPages}
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

      <AssignCollegeRepModal
        isOpen={assignCollegeRepOpen}
        onClose={() => setAssignCollegeRepOpen(false)}
        studentId={currentStudentId} // optional: modal may use it or ignore
        onAssigned={handleAssignCollegeRep} // <<< parent will do the POST
      />

      <SetDefenseModal
        isOpen={defenseModalOpen}
        onClose={closeDefenseModal}
        defenseStage={defenseStage}
        schedulerRole={isProvost ? "provost" : isHod ? "hod" : "pgcord"}
        studentIds={defenseStudentIds}
        program={degreeTab} // string
        session={selectedSession} // string / academic session
        baseUrl={baseUrl}
        token={token}
        department={departmentNameToPass}
        onScheduled={(resp) => {
          console.log("schedule created:", resp);
        }}
      />

      {/* student edit modal */}
      <EditStudentModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        studentId={currentStudentId}
        baseUrl={baseUrl}
        token={token}
        onUpdated={(updated) =>
          setStudents((prev) =>
            prev.map((p) =>
              p._id === (updated._id ?? currentStudentId)
                ? { ...p, ...updated }
                : p
            )
          )
        }
      />

      {/* student view modal */}
      <ProvostViewStudentModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        studentId={viewStudentId ?? ""}
        baseUrl={import.meta.env.VITE_BACKEND_URL}
        token={token}
        watermarkUrl={waterMark}
      />

      {/* PGC ScoreSheet generator modal */}
      {isPgc && scoreSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setScoreSheetOpen(false)}
          />
          {/* Modal panel */}
          <div
            className="relative z-10 max-w-3xl w-full mx-4 md:mx-0 bg-white rounded-lg shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h3 className="text-lg font-medium">Score Sheet Generator</h3>
              <button
                onClick={() => setScoreSheetOpen(false)}
                aria-label="Close score sheet modal"
                className="p-1 rounded hover:bg-gray-100"
              >
                <X />
              </button>
            </div>

            <div className="p-4">
              <ScoreSheetGenerator
                onPublish={handleScoreSheetPublish}
                saving={scoreSheetSaving}
                initialCriteria={initialRubricCriteria}
                onDeleteCriterion={handleDeleteCriterion}
                rubricId={currentRubricDoc?._id ?? null}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentSessionManagement;
