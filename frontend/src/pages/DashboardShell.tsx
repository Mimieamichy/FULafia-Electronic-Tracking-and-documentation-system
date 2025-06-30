// src/DashboardShell.tsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { Menu, Power, Bell, Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import HodDashboardOverview from "./hod&pgc/HodDashboardOverview";
import PgLecturerManagement from "./hod&pgc/PgLecturerManagement";
import StudentSessionManagement from "./hod&pgc/StudentSessionManagement";
import NotificationsTab from "./hod&pgc/NotificationsTab";
import MyStudentListPage from "./hod&pgc/MyStudentListPage";
import CreateSession from "./hod&pgc/CreateSession";

export type DashboardView =
  | "overview"
  | "pgLecturer"
  | "studentSession"
  | "notifications"
  | "myStudents";

const DashboardShell = () => {
  const { role } = useAuth();
  const isHod = role === "HOD";

  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = useState(false);

  // side‑menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // which tab/view are we on?
  const [currentView, setCurrentView] = useState<DashboardView>("overview");

  // Create Session modal state
  const [sessionModalOpen, setSessionModalOpen] = useState(false);

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

  // Called when a new session is successfully created
  const handleSessionCreated = (newSession: any) => {
    console.log("New session created:", newSession);
    // TODO: hook into your session context or refresh list
  };

  // Render the correct view, injecting the session‑button callback into the overview
  const renderView = () => {
    switch (currentView) {
      case "overview":
        return (
          <HodDashboardOverview
            onCreateSessionClick={() => setSessionModalOpen(true)}
          />
        );
      case "pgLecturer":
        return <PgLecturerManagement />;
      case "studentSession":
        return <StudentSessionManagement />;
      case "myStudents":
        return <MyStudentListPage />;
      case "notifications":
        return <NotificationsTab />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center relative">
        <div className="flex items-center gap-4">
          {/* Hamburger */}
          <Menu
            className="w-6 h-6 text-gray-600 cursor-pointer"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          />
        </div>

        {/* Side‑menu */}
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
                {isHod
                  ? "PG Coordinator & Lecturers"
                  : "Student & Lecturer Management"}
              </li>
              <li
                className="hover:text-amber-700 cursor-pointer"
                onClick={() => {
                  setCurrentView("studentSession");
                  setIsMenuOpen(false);
                }}
              >
                Seminar & Sessions
              </li>
              <li
                className="hover:text-amber-700 cursor-pointer"
                onClick={() => {
                  setCurrentView("myStudents");
                  setIsMenuOpen(false);
                }}
              >
                My Students
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

        {/* Right‑side icons */}
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Welcome, {role}</span>
          <Bell
            onClick={() => setCurrentView("notifications")}
            className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
          />

          {/* Reset Password Icon */}
          <Lock
            onClick={() => setResetPasswordModalOpen(true)}
            className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors"
          />

          {/* Logout Icon */}
          <Power
            onClick={() => setLogoutModalOpen(true)}
            className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-600 transition-colors"
          />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">{renderView()}</main>

      {/* Create Session Modal */}
      {isHod && (
        <CreateSession
          isOpen={sessionModalOpen}
          onClose={() => setSessionModalOpen(false)}
          onCreated={handleSessionCreated}
        />
      )}
      {/* Reset Password Modal */}
      <Dialog
        open={resetPasswordModalOpen}
        onOpenChange={setResetPasswordModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            This feature is currently mocked. You will receive an email with
            reset instructions.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setResetPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-amber-700 text-white"
              onClick={() => setResetPasswordModalOpen(false)}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
        <DialogContent className="max-w-md w-full mx-0 sm:mx-auto  sm:rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Confirm Logout
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600 mt-2">
            Are you sure you want to logout?
          </p>

          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setLogoutModalOpen(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Link to="/" className="w-full sm:w-auto">
              <Button className="bg-red-600 text-white w-full sm:w-auto">
                Logout
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardShell;
