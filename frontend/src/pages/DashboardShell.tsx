import { useEffect, useRef, useState } from "react";
import { Menu, Power, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";

import HodDashboardOverview from "./hod/HodDashboardOverview";
import PgLecturerManagement from "./hod/PgLecturerManagement";
import StudentSessionManagement from "./hod/StudentSessionManagement";
import NotificationsTab from "./hod/NotificationsTab";


// Define view names
export type DashboardView =
  | "overview"
  | "pgLecturer"
  | "studentSession"
  | "notifications";
  

const DashboardShell = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<DashboardView>("overview");
  const menuRef = useRef<HTMLDivElement>(null);

    const { role } = useAuth();
  const isHod = role === "HOD";
  

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const renderView = () => {
    switch (currentView) {
      case "overview":
        return <HodDashboardOverview />;
      case "pgLecturer":
        return <PgLecturerManagement />;
      case "studentSession":
        return <StudentSessionManagement />;
      case "notifications":
        return <NotificationsTab />;
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center relative">
        <Menu
          className="w-6 h-6 text-gray-600 cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute top-16 left-4 bg-white shadow-lg rounded-lg p-4 w-64 z-10"
          >
            <ul className="space-y-3 text-gray-700">
              <li
                className="hover:text-amber-700 cursor-pointer"
                onClick={() => {
                  setCurrentView("overview");
                  setIsMenuOpen(false);
                }}
              >
                Dashboard
              </li>
              <li
                className="hover:text-amber-700 cursor-pointer"
                onClick={() => {
                  setCurrentView("pgLecturer");
                  setIsMenuOpen(false);
                }}
              >
               {isHod ? "PG Coordinator & Lecturers" : "Student & Lecturer Management"}
              </li>
              <li
                className="hover:text-amber-700 cursor-pointer"
                onClick={() => {
                  setCurrentView("studentSession");
                  setIsMenuOpen(false);
                }}
              >
                Students & Sessions
              </li>
              <li
                className="hover:text-amber-700 cursor-pointer"
                onClick={() => {
                  setCurrentView("notifications");
                  setIsMenuOpen(false);
                }}
              >
                Notifications
              </li>
              
            </ul>
          </div>
        )}
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome {role}</span>
          <Link to="/notifications" title="Notifications">
            <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" />
          </Link>
          <Link to="/" title="Sign out">
            <Power className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">{renderView()}</main>
    </div>
  );
};

export default DashboardShell;
