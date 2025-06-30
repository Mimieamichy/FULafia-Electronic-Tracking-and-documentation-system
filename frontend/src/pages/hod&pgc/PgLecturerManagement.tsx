import { useState } from "react";
import PgCoordinatorTab from "./PgCoordinatorTab";
import LecturerTab from "./LecturerTab";
import AddStudentForm from "./AddStudentForm";
import ScoreSheetGenerator from "./ScoreSheetGenerator";
import { useAuth } from "../AuthProvider";

const PgLecturerManagement = () => {
  const { role } = useAuth(); // 'HOD' or 'PGC'
  const isHod = role === "HOD";

  // Default tab: "pg" for HOD, "students" for PGC
  const [activeTab, setActiveTab] = useState(isHod ? "pg" : "students");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">
          {isHod
            ? "PG Coordinator & Lecturer Management"
            : "Student, Lecturer & Score Sheet Management"}
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 space-x-2">
          {isHod ? (
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
          ) : (
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
              {/* New Score Sheet Generator tab */}
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
        </div>
      </div>

      {/* Render tabs */}
      <div>
        {isHod && activeTab === "pg" && <PgCoordinatorTab />}
        {activeTab === "lecturers" && <LecturerTab />}
        {!isHod && activeTab === "students" && <AddStudentForm />}
        {!isHod && activeTab === "scoreSheet" && <ScoreSheetGenerator />}
      </div>
    </div>
  );
};

export default PgLecturerManagement;
