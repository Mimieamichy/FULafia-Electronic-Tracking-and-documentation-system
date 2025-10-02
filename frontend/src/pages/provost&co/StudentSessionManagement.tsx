// src/pgc/StudentSessionManagement.tsx
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
import { Label } from "@/components/ui/label";
import { ChevronLeft, ChevronRight, X, Plus } from "lucide-react";
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

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const normalizeStage = (s?: string) =>
  (s ?? "")
    .toString()
    .toLowerCase()
    .replace(/[_\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const stageLabelToApiKeyMap: Record<string, string> = {
  start: "start",
  proposal: "proposal",
  "internal defense": "internal",
  "external defense": "external_defense",
  "proposal defense": "proposal_defense",
  "2nd seminar": "second_seminar",
  "3rd seminar": "third_seminar",
};

const getStageKey = (label: string) => {
  const norm = normalizeStage(label);
  if (!norm) return "";
  if (stageLabelToApiKeyMap[norm]) return stageLabelToApiKeyMap[norm];
  return norm.replace(/\s+/g, "_");
};

const START_KEY = getStageKey("Start");
const EXTERNAL_DEFENSE_KEY = getStageKey("External Defense");

const getLabelFromKey = (key: string, labels: string[]) => {
  const found = labels.find((l) => getStageKey(l) === key);
  return found ?? key;
};

const StudentSessionManagement = () => {
  const { token, user } = useAuth();

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
  const [scoreSheetOpen, setScoreSheetOpen] = useState(false);
  const [initialRubricCriteria, setInitialRubricCriteria] = useState<
    any | null
  >(null);
  const [currentRubricDoc, setCurrentRubricDoc] = useState<any | null>(null);

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

  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [assignCollegeRepOpen, setAssignCollegeRepOpen] = useState(false);
  const [currentStudentId, setCurrentStudentId] = useState<string>("");
  const [departmentName, setDepartmentName] = useState<string>("");

  const [defenseModalOpen, setDefenseModalOpen] = useState(false);
  const [defenseStage, setDefenseStage] = useState<string>(
    isProvost ? defenseOptions[3] : defenseOptions[0]
  );

  const [selectedDepartmentForDefense, setSelectedDepartmentForDefense] =
    useState<string>("");
  const [selectedSession, setSelectedSession] = useState<string>("");
  const [sessionsList, setSessionsList] = useState<
    { _id: string; sessionName: string }[]
  >([]);
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState<StudentFromAPI[]>([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [totalStudents, setTotalStudents] = useState<number>(0);

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

  // fetch faculties if provost
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

  // fetch departments if provost and faculty selected
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

  // fetch sessions
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
        const mapped = arr.map((s) => ({
          _id: s._id ?? s.id ?? s.sessionId ?? "",
          sessionName: s.sessionName ?? s.name ?? s.title ?? String(s),
        }));
        setSessionsList(mapped);
        if (!selectedSession && mapped.length)
          setSelectedSession(mapped[0]._id);
      } catch (err) {
        console.error("Failed to fetch sessions:", err);
      }
    };
    fetchSessions();
  }, [token, selectedSession]);

  // fetch departments if dean
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

  // fetch students when filters change
  useEffect(() => {
    const resolveDepartmentName = () => {
      if (isProvost || isDean) {
        if (!selectedDepartmentForDefense) return "";
        const found = departments.find(
          (d) => d._id === selectedDepartmentForDefense
        );
        return found?.name ?? "";
      }
      return user?.department || "";
    };

    setDepartmentName(resolveDepartmentName());
    let cancelled = false;

    const fetchStudents = async () => {
      if (!selectedSession) {
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
      noSessionWarnedRef.current = false;

      const departmentNameLocal = resolveDepartmentName();
      if ((isProvost || isDean) && !departmentNameLocal) {
        setStudents([]);
        setTotalStudents(0);
        return;
      }

      const stageSeg = getStageKey(selectedDefense);
      const levelSeg = degreeTab === "MSc" ? "msc" : "phd";

      const url = `${baseUrl}/student/${levelSeg}/${encodeURIComponent(
        departmentNameLocal
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
        if (cancelled) return;
        console.log("Fetched students:", json);

        const dataArr = Array.isArray(json.data)
          ? json.data
          : Array.isArray(json)
          ? json
          : [];
        setStudents(dataArr);

        setTotalStudents(
          typeof json.total === "number" ? json.total : dataArr.length
        );
        if (typeof json.page === "number") setPage(json.page);
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
    user?.department,
    selectedDepartmentForDefense,
    departments,
    isProvost,
    degreeTab,
    selectedSession,
    page,
    itemsPerPage,
    selectedDefense,
    toast,
    isDean,
  ]);

  const departmentNameToPass = (() => {
    const resolveIdToName = (candidate: string | undefined) => {
      if (!candidate) return "";
      const foundById = departments.find((d) => d._id === candidate);
      if (foundById?.name) return foundById.name;
      const foundByName = departments.find(
        (d) =>
          String(d.name ?? "").toLowerCase() === String(candidate).toLowerCase()
      );
      if (foundByName?.name) return foundByName.name;
      if (typeof candidate === "string" && candidate.trim() !== "")
        return candidate.trim();
      return "";
    };

    const rawSel = selectedDepartmentForDefense;
    if (rawSel && rawSel !== "none") {
      const provostResolved = resolveIdToName(rawSel);
      if (provostResolved) return provostResolved;
    }

    if (user?.department) {
      const hodResolved = resolveIdToName(user.department);
      if (hodResolved) return hodResolved;
    }

    if (Array.isArray(students) && students.length > 0) {
      const sDept = students[0].department;
      if (sDept) {
        const studentResolved = resolveIdToName(sDept);
        if (studentResolved) return studentResolved;
        if (typeof sDept === "string" && sDept.trim() !== "")
          return sDept.trim();
      }
    }

    return "";
  })();

  const handleAssign = async (
    studentId: string,
    supType: "major" | "minor" | "internal_examiner",
    lecturerId: string,
    lecturerName: string
  ) => {
    const student = students.find((s) => s._id === studentId);
    const matricNo = student?.matricNo ?? studentId;

    setStudents((prev) =>
      prev.map((s) =>
        s._id === studentId
          ? {
              ...s,
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
    } catch (err) {
      console.error("Error assigning supervisor:", err);
    }
  };

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
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Assign failed (${res.status})`);
      }

      setStudents((prev) =>
        prev.map((s) =>
          s._id === currentStudentId
            ? { ...s, collegeRep: { staffId: lecturerId } }
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
      setAssignCollegeRepOpen(false);
    }
  };

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

    const url = isProvost
      ? `${baseUrl}/defence/score-sheet`
      : `${baseUrl}/defence/dept-score-sheet`;

    setScoreSheetSaving(true);
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(body),
      });

      const text = await res.text();
      console.log("Score sheet publish response:", text);
      let parsed: any = null;
      try {
        parsed = text ? JSON.parse(text) : null;
      } catch {
        parsed = text;
      }

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
          // optional GET : omitted to keep simple; fallback to parsed
        } catch (getErr) {
          console.warn(
            "[publish] failed fetching rubric by id, falling back to POST body:",
            getErr
          );
          finalDoc = parsed;
        }
      } else {
        finalDoc = parsed;
      }

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

      setInitialRubricCriteria(mappedCriteria);
      setCurrentRubricDoc(finalDoc ?? null);

      if (!res.ok) {
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

  const handleDeleteCriterion = async (criterionId: string) => {
    if (!criterionId) return;

    try {
      setInitialRubricCriteria((prev) =>
        prev?.filter((c) => c.id !== criterionId)
      );

      const url = `${baseUrl}/defence/dept-score-sheet/delete/${encodeURIComponent(
        criterionId
      )}`;
      const res = await fetch(url, {
        method: "DELETE",
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

      if (!res.ok) throw new Error(parsed?.message ?? `HTTP ${res.status}`);

      toast({
        title: "Deleted",
        description: "Criterion removed.",
        variant: "default",
      });

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

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return students
      .filter((s) => (s.currentStage ?? "").toString() === selectedDefense)
      .filter((s) => {
        const fullName = s.user
          ? `${s.user.firstName} ${s.user.lastName}`.toLowerCase()
          : "";
        return (
          s.matricNo.toLowerCase().includes(term) ||
          fullName.includes(term) ||
          s.projectTopic.toLowerCase().includes(term)
        );
      });
  }, [students, search, selectedDefense]);

  const totalPages = Math.max(1, Math.ceil(totalStudents / itemsPerPage));
  const paginated = filtered.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const closeDefenseModal = () => {
    setDefenseModalOpen(false);
    setSelectedDepartmentForDefense("");
  };

  const getStageScore = (
    s: StudentFromAPI
  ): { value: number; label: string } => {
    const stage = (s.currentStage ?? "").toLowerCase();

    const mapping: Array<{ re: RegExp; key: string; label: string }> = [
      { re: /proposal/, key: "proposalScore", label: "Proposal" },
      { re: /internal/, key: "internalScore", label: "Internal" },
      { re: /external/, key: "externalScore", label: "External" },
      {
        re: /second seminar|2nd seminar/,
        key: "secondSeminarScore",
        label: "2nd Seminar",
      },
      {
        re: /third seminar|3rd seminar/,
        key: "thirdSeminarScore",
        label: "3rd Seminar",
      },
      {
        re: /first seminar|1st seminar/,
        key: "firstSeminarScore",
        label: "1st Seminar",
      },
      { re: /defense|defence|final/, key: "internalScore", label: "Defense" },
    ];

    const found = mapping.find((m) => m.re.test(stage));
    let chosenKey = found?.key;
    let chosenLabel = found?.label ?? "Score";

    if (!chosenKey) {
      // prefer common keys if present
      const prefer = [
        "internalScore",
        "externalScore",
        "proposalScore",
        "externalDefenseScore",
        "secondSeminarScore",
        "thirdSeminarScore",
        "firstSeminarScore",
      ];
      chosenKey = prefer.find((k) => k in (s.stageScores || {}));
      if (chosenKey) {
        chosenLabel =
          chosenKey === "proposalScore"
            ? "Proposal"
            : chosenKey === "internalScore"
            ? "Internal"
            : chosenKey === "externalScore"
            ? "External"
            : chosenKey === "externalDefenseScore"
            ? "External Defense"
            : chosenKey === "secondSeminarScore"
            ? "2nd Seminar"
            : chosenKey === "thirdSeminarScore"
            ? "3rd Seminar"
            : chosenKey === "firstSeminarScore"
            ? "1st Seminar"
            : chosenKey === "proposalScore"
            ? "Proposal Defense"
            : "Score";
      } else {
        // fallback to first numeric key in s.scores
        const firstNumericKey = Object.entries(s.stageScores || {}).find(
          ([, v]) => typeof v === "number" && !isNaN(v)
        )?.[0];
        chosenKey = firstNumericKey;
        chosenLabel = firstNumericKey ?? "Score";
      }
    }

    const rawVal = chosenKey ? (s.stageScores?.[chosenKey] as any) : undefined;
    const numeric =
      typeof rawVal === "number" && !isNaN(rawVal) ? Math.round(rawVal) : 0;

    return { value: numeric, label: chosenLabel };
  };

  const defenseStudentIds = useMemo(() => {
    if (!Array.isArray(students) || !selectedDefense) return [];
    return students
      .filter((s) => String(s.currentStage) === String(selectedDefense))
      .map((s) => s._id ?? (s as any).id)
      .filter(Boolean) as string[];
  }, [students, selectedDefense]);

  console.log("Rendering ", defenseStudentIds.length, "students for", {
    selectedDefense,
    selectedDefenseLabel,
  });

  return (
    <div className="space-y-6">
      {/* Top header: degree tabs + title + Create button */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-4">
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
          </div>

          <h2 className="mt-4 text-2xl font-bold text-gray-900">
            {degreeTab} Ready for {selectedDefenseLabel}
          </h2>
        </div>

        <div className="flex items-start gap-3">
          {(isPgc || isProvost) && (
            <Button
              onClick={() => setScoreSheetOpen(true)}
              className="bg-amber-700 hover:bg-amber-800 text-white px-4 py-2 rounded-md flex items-center gap-2"
            >
              <Plus size={16} />
              <span>Create ScoreSheet</span>
            </Button>
          )}
        </div>
      </div>

      {/* Card containing filters + table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
        {/* Filters grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {/* Stage select */}
          <div>
            <Label htmlFor="defense-select" className="text-sm text-gray-600">
              Stage
            </Label>
            <Select
              value={selectedDefense}
              onValueChange={(v) => {
                setSelectedDefense(v);
                setPage(1);
              }}
            >
              <SelectTrigger id="defense-select" className="w-full">
                <SelectValue placeholder={selectedDefenseLabel} />
              </SelectTrigger>
              <SelectContent>
                {defenseOptions.map((opt) => (
                  <SelectItem key={opt} value={getStageKey(opt)}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search */}
          <div className="md:col-span-1">
            <Label className="text-sm text-gray-600">Search</Label>
            <Input
              placeholder="Search Mat. No, Name or Topic"
              className="w-full"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          {/* Session */}
          <div>
            <Label className="text-sm text-gray-600">Session</Label>
            <Select value={selectedSession} onValueChange={setSelectedSession}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select session" />
              </SelectTrigger>
              <SelectContent>
                {sessionsList.length > 0 ? (
                  sessionsList.map((s) => (
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

        {/* Provost-only second row filters (faculty & department) */}
        {isProvost && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm text-gray-600">Faculty</Label>
              <Select
                value={selectedFacultyId}
                onValueChange={setSelectedFacultyId}
              >
                <SelectTrigger className="w-full">
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
            </div>

            <div>
              <Label className="text-sm text-gray-600">Department</Label>
              <Select
                value={selectedDepartmentForDefense}
                onValueChange={setSelectedDepartmentForDefense}
                disabled={
                  !selectedFacultyId ||
                  departmentsLoading ||
                  departments.length === 0
                }
              >
                <SelectTrigger className="w-full">
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
          </div>
        )}

        {isDean && (
          <div className="mt-4">
            <Label className="text-sm text-gray-600">Department</Label>
            <Select
              value={selectedDepartmentForDefense}
              onValueChange={setSelectedDepartmentForDefense}
              disabled={
                departmentsLoading ||
                departments.length === 0 ||
                Boolean(user?.department && departments.length === 1)
              } // optional: disable if single assigned dept
            >
              <SelectTrigger className="w-48">
                <SelectValue
                  placeholder={
                    departmentsLoading
                      ? "Loading departments..."
                      : departments.length
                      ? "Select Department"
                      : "No departments"
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
          </div>
        )}

        {/* Schedule buttons row */}
        <div className="mt-4 flex items-center justify-between">
          <div />
          <div className="flex items-center gap-3">
            {!isProvost &&
              selectedDefense !== EXTERNAL_DEFENSE_KEY &&
              selectedDefense !== START_KEY &&
              !isDean && (
                <Button
                  className="bg-amber-700 hover:bg-amber-800 text-white"
                  onClick={() => {
                    setDefenseStage(selectedDefense);
                    setDefenseModalOpen(true);
                  }}
                >
                  Schedule {selectedDefenseLabel}
                </Button>
              )}

            {isProvost && selectedDefense === EXTERNAL_DEFENSE_KEY && (
              <Button
                className="bg-amber-700 text-white"
                onClick={() => {
                  setDefenseStage(selectedDefense);
                  setDefenseModalOpen(true);
                }}
                disabled={!selectedDepartmentForDefense}
              >
                Schedule {selectedDefenseLabel}
              </Button>
            )}
          </div>
        </div>

        {/* Students Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="bg-gray-50">
                {isProvost ? (
                  <>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Matric No
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Full Name
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Project Topic
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Current Stage
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Department
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Faculty
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Assign
                    </th>
                  </>
                ) : isDean ? (
                  <>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Matric No
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Full Name
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Project Topic
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Current Stage
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Department
                    </th>
                  </>
                ) : (
                  <>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      MAT NO.
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Full Name
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Topic
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Score for {selectedDefenseLabel}
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      1st Supervisor
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      2nd Supervisor
                    </th>
                    <th className="p-4 text-sm text-gray-600 font-medium">
                      Assign
                    </th>
                  </>
                )}
              </tr>
            </thead>

            <tbody>
              {paginated.map((s, idx) => {
                const rowBg = idx % 2 === 0 ? "bg-white" : "bg-amber-50";
                const { value: score } = getStageScore(s);
                if (isProvost || isDean) {
                  return (
                    <tr key={s._id} className={rowBg}>
                      <td className="p-4 border-t text-sm">{s.matricNo}</td>
                      <td className="p-4 border-t">
                        <button
                          title="View student"
                          className="text-amber-700 underline capitalize"
                          onClick={() => {
                            setViewStudentId(s._id);
                            setViewModalOpen(true);
                          }}
                        >
                          {s.user
                            ? `${s.user.firstName} ${s.user.lastName}`
                            : ""}
                        </button>
                      </td>
                      <td className="p-4 border-t text-sm">{s.projectTopic}</td>
                      <td className="p-4 border-t text-sm">{s.currentStage}</td>
                      <td className="p-4 border-t text-sm">{s.department}</td>
                      <td className="p-4 border-t text-sm">{s.faculty}</td>
                      {isProvost && (
                        <td className="p-4 border-t">
                          <Button
                            size="sm"
                            className="bg-amber-700 text-white rounded-md px-4 py-1"
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
                  <tr key={s._id} className={rowBg}>
                    <td className="p-4 border-t text-sm">{s.matricNo}</td>
                    <td className="p-4 border-t">
                      {isPgc ? (
                        <button
                          title="Edit student"
                          className="text-amber-700 underline capitalize"
                          onClick={() => {
                            setCurrentStudentId(s._id);
                            setEditModalOpen(true);
                          }}
                        >
                          {s.user
                            ? `${s.user.firstName} ${s.user.lastName}`
                            : ""}
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
                          {s.user
                            ? `${s.user.firstName} ${s.user.lastName}`
                            : ""}
                        </button>
                      ) : (
                        ""
                      )}
                    </td>

                    <td className="p-4 border-t capitalize">
                      {s.projectTopic}
                    </td>
                    <td className="p-4 border-t">{score ?? "—"}</td>
                    <td className="p-4 border-t">
                      {s.majorSupervisor || "Not Assigned"}
                    </td>
                    <td className="p-4 border-t">
                      {s.minorSupervisor || "Not Assigned"}
                    </td>

                    <td className="p-4 border-t">
                      <Button
                        size="sm"
                        className="bg-amber-700 text-white rounded-md px-4 py-1"
                        onClick={() => {
                          setCurrentStudentId(s._id);
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
                    colSpan={isProvost ? 7 : isHod ? 11 : 10}
                    className="text-center p-8 text-gray-500"
                  >
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4 flex items-center justify-end gap-3">
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
        studentId={currentStudentId}
        onAssigned={handleAssignCollegeRep}
      />

      <SetDefenseModal
        isOpen={defenseModalOpen}
        onClose={closeDefenseModal}
        defenseStage={defenseStage}
        schedulerRole={isProvost ? "provost" : isHod ? "hod" : "pgcord"}
        studentIds={defenseStudentIds}
        program={degreeTab}
        session={selectedSession}
        baseUrl={baseUrl}
        token={token}
        department={departmentNameToPass}
        onScheduled={(resp) => {
          console.log("schedule created:", resp);
        }}
      />

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

      <ProvostViewStudentModal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        studentId={viewStudentId ?? ""}
        baseUrl={import.meta.env.VITE_BACKEND_URL}
        token={token}
        watermarkUrl={waterMark}
      />

      {(isPgc || isProvost) && scoreSheetOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setScoreSheetOpen(false)}
          />
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
