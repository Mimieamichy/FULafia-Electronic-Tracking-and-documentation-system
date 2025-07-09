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

import HodDashboardOverview from "./provost&co/HodDashboardOverview";
import PgLecturerManagement from "./provost&co/PgLecturerManagement";
import StudentSessionManagement from "./provost&co/StudentSessionManagement";
import NotificationsTab from "./provost&co/NotificationsTab";
import MyStudentsPage from "./supervisor/MyStudentsPage";
import CreateSession from "./provost&co/CreateSession";
import ProvostDashboardOverview from "./provost&co/ProvostDashboard";
import ProvostActivityLog from "./provost&co/ProvostActivityLog";
import DefenseDayPage from "./DefenseDayPage"
export type DashboardView =
  | "overview"
  | "pgLecturer"
  | "studentSession"
  | "myStudents"
  | "notifications"
  | "activityLog"
  | "defenseDay";

export default function DashboardShell() {
  const { user, logout } = useAuth();
  const role = user?.role?.toUpperCase() || "";
  const isHod = role === "HOD";
  const isProvost = role === "PROVOST";
  const userName = user?.userName || "User";

  const [currentView, setCurrentView] = useState<DashboardView>("overview");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // close menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isMenuOpen]);

  const renderView = () => {
    switch (currentView) {
      case "overview":
        return isProvost
          ? <ProvostDashboardOverview />
          : <HodDashboardOverview onCreateSessionClick={() => setSessionModalOpen(true)} />;
      case "pgLecturer":
        return <PgLecturerManagement />;
      case "studentSession":
        return <StudentSessionManagement />;
      case "myStudents":
        return <MyStudentsPage />;
      case "notifications":
        return <NotificationsTab />;
      case "activityLog":
        return isProvost ? <ProvostActivityLog /> : null;
      case "defenseDay":
        return <DefenseDayPage />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-4 flex justify-between items-center relative">
        <div className="flex items-center gap-4">
          <Menu
            className="w-6 h-6 text-gray-600 cursor-pointer"
            onClick={() => setIsMenuOpen(o => !o)}
          />
          <span className="text-gray-700">
            Welcome, {userName} 
          </span>
        </div>

        {/* Side‑menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute top-16 left-4 bg-white shadow-lg rounded-lg p-4 w-64 z-10"
          >
            <ul className="space-y-2 text-gray-700">
              <li onClick={() => { setCurrentView("overview"); setIsMenuOpen(false) }} className="cursor-pointer hover:text-amber-700">
                Dashboard
              </li>
              <li onClick={() => { setCurrentView("pgLecturer"); setIsMenuOpen(false) }} className="cursor-pointer hover:text-amber-700">
                {isProvost ? "External Examiners & Lecturers" : "PG Coordinator & Lecturers"}
              </li>
              <li onClick={() => { setCurrentView("studentSession"); setIsMenuOpen(false) }} className="cursor-pointer hover:text-amber-700">
                Seminar & Sessions
              </li>
              <li onClick={() => { setCurrentView("myStudents"); setIsMenuOpen(false) }} className="cursor-pointer hover:text-amber-700">
                My Students
              </li>
              {isProvost && (
                <li onClick={() => { setCurrentView("activityLog"); setIsMenuOpen(false) }} className="cursor-pointer hover:text-amber-700">
                  Activity Log
                </li>
              )}
              <li onClick={() => { setCurrentView("defenseDay"); setIsMenuOpen(false) }} className="cursor-pointer hover:text-amber-700">
                Defense Day
              </li>
              <li onClick={() => { setCurrentView("notifications"); setIsMenuOpen(false) }} className="cursor-pointer hover:text-amber-700">
                Notifications
              </li>
            </ul>
          </div>
        )}

        {/* Right‑side icons */}
        <div className="flex items-center gap-4">
          <Bell
            className="w-6 h-6 text-gray-600 cursor-pointer"
            onClick={() => setCurrentView("notifications")}
          />
          <Lock
            className="w-6 h-6 text-gray-600 cursor-pointer"
            onClick={() => setResetModalOpen(true)}
          />
          <Power
            className="w-6 h-6 text-red-500 cursor-pointer"
            onClick={() => setLogoutModalOpen(true)}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {renderView()}
      </main>

      {/* Create Session Modal (HOD only) */}
      {isHod && (
        <CreateSession
          isOpen={sessionModalOpen}
          onClose={() => setSessionModalOpen(false)}
          onCreated={() => {/* ... */}}
        />
      )}

      {/* Reset Password Modal */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Reset Password</DialogTitle></DialogHeader>
          <p className="p-4">A reset link will be emailed to you.</p>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setResetModalOpen(false)}>Cancel</Button>
            <Button className="bg-amber-700 text-white" onClick={() => setResetModalOpen(false)}>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader><DialogTitle>Confirm Logout</DialogTitle></DialogHeader>
          <p className="p-4">Are you sure you want to log out?</p>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLogoutModalOpen(false)}>Cancel</Button>
            <Button className="bg-red-600 text-white" onClick={() => { logout(); }}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
