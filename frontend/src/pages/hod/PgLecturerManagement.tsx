import { useState } from "react";
import PgCoordinatorTab from "./PgCoordinatorTab";
import LecturerTab from "./LecturerTab";

const PgLecturerManagement = () => {
  const [activeTab, setActiveTab] = useState("pg");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-4">PG Coordinator & Lecturer Management</h1>
        <div className="flex border-b border-gray-200">
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
        </div>
      </div>

      <div>
        {activeTab === "pg" ? <PgCoordinatorTab /> : <LecturerTab />}
      </div>
    </div>
  );
};

export default PgLecturerManagement;
