// src/hod&pgc/PgLecturerManagement.tsx
import { useState } from "react";
import PgCoordinatorTab from "./PgCoordinatorTab";
import LecturerTab from "./LecturerTab";
import AddStudentForm from "./AddStudentForm";
import ScoreSheetGenerator from "./ScoreSheetGenerator";
import ExternalExaminerTab from "./ExternalExaminerTab";
import ProvostCollegeRepManager from "./ProvostCollegeRepManager";
import { useAuth } from "../AuthProvider";

const PgLecturerManagement = () => {
  const { role } = useAuth(); // 'HOD', 'PGC', or 'PROVOST'
  const isHod = role === "HOD";
  const isProvost = role === "PROVOST";

  // Default tab choice
  const defaultTab = isHod ? "pg" : isProvost ? "external" : "students";
  const [activeTab, setActiveTab] = useState(defaultTab);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          {isHod
            ? "PG Coordinator & Lecturer Management"
            : isProvost
            ? "External Examiners, Lecturers, College Reps & Score Sheets"
            : "Student, Lecturer & Score Sheet Management"}
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 space-x-2">
          {isHod && (
            <>
              <button
                onClick={() => setActiveTab("pg")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "pg"
                    ? "border-amber-700 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                PG Coordinators
              </button>
              <button
                onClick={() => setActiveTab("lecturers")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "lecturers"
                    ? "border-amber-700 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Lecturers
              </button>
            </>
          )}

          {!isHod && !isProvost && (
            <>
              <button
                onClick={() => setActiveTab("students")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "students"
                    ? "border-amber-700 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab("lecturers")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "lecturers"
                    ? "border-amber-700 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Lecturers
              </button>
              <button
                onClick={() => setActiveTab("scoreSheet")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "scoreSheet"
                    ? "border-amber-700 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Score Sheet
              </button>
            </>
          )}

          {isProvost && (
            <>
              <button
                onClick={() => setActiveTab("external")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "external"
                    ? "border-amber-700 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                External Examiners
              </button>

              <button
                onClick={() => setActiveTab("lecturers")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "lecturers"
                    ? "border-amber-700 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Lecturers
              </button>

              <button
                onClick={() => setActiveTab("scoreSheet")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "scoreSheet"
                    ? "border-amber-700 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Score Sheet
              </button>

              {/* 🔽 Add this new tab button */}
              <button
                onClick={() => setActiveTab("collegeReps")}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "collegeReps"
                    ? "border-amber-700 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                College Reps
              </button>
            </>
          )}
        </div>
      </div>

      {/* Render tabs */}
      <div>
        {isHod && activeTab === "pg" && <PgCoordinatorTab />}
        {activeTab === "lecturers" && <LecturerTab />}
        {!isHod && !isProvost && activeTab === "students" && <AddStudentForm />}
        {(!isHod || isProvost) && activeTab === "scoreSheet" && (
          <ScoreSheetGenerator />
        )}
        {isProvost && activeTab === "external" && <ExternalExaminerTab />}
        {isProvost && activeTab === "collegeReps" && (
          <ProvostCollegeRepManager />
        )}
      </div>
    </div>
  );
};

export default PgLecturerManagement;
