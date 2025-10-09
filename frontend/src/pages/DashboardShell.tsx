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
import { useNotificationStore } from "@/lib/notificationStore";
import UpdatePasswordModal from "./UpdatePasswordModal";
import HodDashboardOverview from "./provost&co/HodDashboardOverview";
import PgLecturerManagement from "./provost&co/PgLecturerManagement";
import StudentSessionManagement from "./provost&co/StudentSessionManagement";
import MyStudentsPage from "./supervisor/MyStudentsPage";
import CreateSession from "./provost&co/CreateSession";
import ProvostDashboardOverview from "./provost&co/ProvostDashboard";
import ProvostActivityLog from "./provost&co/ProvostActivityLog";
import DefenseDayPage from "./DefenseDayPage";
import NotificationCenter from "./NotificationCenter";
import { useNavigate } from "react-router-dom";
export type DashboardView =
  | "overview"
  | "pgLecturer"
  | "studentSession"
  | "myStudents"
  | "notifications"
  | "activityLog"
  | "defenseDay";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function DashboardShell() {
  const { user, logout, token } = useAuth();
  const role = user?.role || "";
  console.log("user role:", role);

  const isHod = role?.toUpperCase() === "HOD";
  const isProvost = role?.toUpperCase() === "PROVOST";
  const userName = user?.userName;

  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<DashboardView>("overview");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [sessionModalOpen, setSessionModalOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

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

  useEffect(() => {
    if (token) {
      fetchNotifications({ baseUrl, token });
    }
  }, [token, fetchNotifications]);

  // optional: refresh when window focus to keep counts in sync across tabs
  

  const renderView = () => {
    switch (currentView) {
      case "overview":
        return isProvost ? (
          <ProvostDashboardOverview
            onCreateSessionClick={() => setSessionModalOpen(true)}
          />
        ) : (
          <HodDashboardOverview />
        );
      case "pgLecturer":
        return <PgLecturerManagement />;
      case "studentSession":
        return <StudentSessionManagement />;
      case "myStudents":
        return <MyStudentsPage />;
      case "notifications":
        return <NotificationCenter />;
      case "activityLog":
        return isProvost || isHod ? <ProvostActivityLog /> : null;
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
            onClick={() => setIsMenuOpen((o) => !o)}
          />
          <span className="text-gray-700 capitalize">Welcome, {userName}</span>
        </div>

        {/* Side‑menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute top-16 left-4 bg-white shadow-lg rounded-lg p-4 w-64 z-10"
          >
            <ul className="space-y-2 text-gray-700">
              <li
                onClick={() => {
                  setCurrentView("overview");
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer hover:text-amber-700"
              >
                Dashboard
              </li>
              <li
                onClick={() => {
                  setCurrentView("pgLecturer");
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer hover:text-amber-700"
              >
                {isProvost
                  ? "External Examiners"
                  : isHod
                  ? "PG Coordinators & Lecturers"
                  : "Students & Lecturers"}
              </li>
              <li
                onClick={() => {
                  setCurrentView("studentSession");
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer hover:text-amber-700"
              >
                Student Management
              </li>
              <li
                onClick={() => {
                  setCurrentView("myStudents");
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer hover:text-amber-700"
              >
                My Students
              </li>
              {(isHod || isProvost) && (
                <li
                  onClick={() => {
                    setCurrentView("activityLog");
                    setIsMenuOpen(false);
                  }}
                  className="cursor-pointer hover:text-amber-700"
                >
                  Activity Log
                </li>
              )}
              <li
                onClick={() => {
                  setCurrentView("defenseDay");
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer hover:text-amber-700"
              >
                Defense Page
              </li>
              <li
                onClick={() => {
                  setCurrentView("notifications");
                  setIsMenuOpen(false);
                }}
                className="cursor-pointer hover:text-amber-700"
              >
                Notifications
              </li>
            </ul>
          </div>
        )}

        {/* Right‑side icons */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Bell
              className="w-6 h-6 text-gray-600 cursor-pointer"
              onClick={() => setCurrentView("notifications")}
            />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 cursor-pointer -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-amber-600 rounded-full"
                aria-label={`${unreadCount} unread notifications`}
                onClick={() => setCurrentView("notifications")}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>

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
      <main className="container mx-auto px-4 py-8">{renderView()}</main>

      {/* Create Session Modal (HOD only) */}
      {isHod ||
        (isProvost && (
          <CreateSession
            isOpen={sessionModalOpen}
            onClose={() => setSessionModalOpen(false)}
            onCreated={() => {
              /* ... */
            }}
          />
        ))}

      {/* Reset Password Modal */}
      <UpdatePasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
        <DialogContent className="max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p className="p-4">Are you sure you want to log out?</p>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLogoutModalOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 text-white" onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
