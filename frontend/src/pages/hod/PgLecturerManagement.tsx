import { useState } from "react";
import PgCoordinatorTab from "./PgCoordinatorTab";
import LecturerTab from "./LecturerTab";
import AddStudentForm from "./AddStudentForm";
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
          {isHod ? "PG Coordinator & Lecturer Management" : "Student & Lecturer Management"}
        </h1>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          {isHod ? (
            <>
              <button
                onClick={() => setActiveTab("pg")}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  activeTab === "pg"
                    ? "border-amber-700 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                PG Coordinators
              </button>
              <button
                onClick={() => setActiveTab("lecturers")}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
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
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  activeTab === "students"
                    ? "border-amber-700 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setActiveTab("lecturers")}
                className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  activeTab === "lecturers"
                    ? "border-amber-700 text-amber-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                Lecturers
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
      </div>
    </div>
  );
};

export default PgLecturerManagement;
