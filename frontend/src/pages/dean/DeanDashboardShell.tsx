// src/SupervisorDashboardShell.tsx
import { useState, useRef, useEffect } from "react";
import { Menu, Bell, Lock, Power } from "lucide-react";
import { useAuth } from "../AuthProvider";
import { useNotificationStore } from "@/lib/notificationStore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import DeanDashboard from "./DeanDashboard";
import MyStudentsPage from "../supervisor/MyStudentsPage";
import NotificationCenter from "../NotificationCenter";
import DeanActivityLog from "./DeanActivityLog";
import DefenseDayPage from "../DefenseDayPage";
import UpdatePasswordModal from "../UpdatePasswordModal";
import DeanFacultyTab from "./DeanFacultyTab";
import StudentSessionManagement from "../provost&co/StudentSessionManagement";
import { useNavigate } from "react-router-dom";

export type DeanView =
  | "dashboard"
  | "studentSessionManagement"
  | "myStudents"
  | "facultyTab"
  | "activityLog"
  | "defenseDay"
  | "notifications";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function DeanDashboardShell() {
  const { user, logout, token } = useAuth();
  const role = user?.role || "Dean";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [currentView, setCurrentView] = useState<DeanView>("dashboard");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);

  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isMenuOpen]);

  useEffect(() => {
    if (token) {
      fetchNotifications({ baseUrl, token });
    }
  }, [token, fetchNotifications]);

  // optional: refresh when window focus to keep counts in sync across tabs
  useEffect(() => {
    const onFocus = () => {
      if (token) fetchNotifications({ baseUrl, token });
    };
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [token, fetchNotifications]);

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <DeanDashboard />;
      case "studentSessionManagement":
        return <StudentSessionManagement />;
      case "myStudents":
        return <MyStudentsPage />;
      case "facultyTab":
        return <DeanFacultyTab />;
      case "activityLog":
        return <DeanActivityLog />;
      case "defenseDay":
        return <DefenseDayPage />;
      case "notifications":
        return <NotificationCenter />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 sm:px-6 py-4 flex justify-between items-center relative">
        {/* Hamburger */}
        <div className="flex items-center gap-4">
          <Menu
            className="w-6 h-6 text-gray-600 cursor-pointer"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          />
        </div>

        {/* Side Menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute top-16 left-4 bg-white shadow-lg rounded-lg p-4 w-56 z-20"
          >
            <ul className="space-y-2 text-gray-700">
              <li
                className="cursor-pointer hover:text-amber-700"
                onClick={() => {
                  setCurrentView("dashboard");
                  setIsMenuOpen(false);
                }}
              >
                Dashboard
              </li>
              <li
                className="cursor-pointer hover:text-amber-700"
                onClick={() => {
                  setCurrentView("facultyTab");
                  setIsMenuOpen(false);
                }}
              >
                Faculty Lecturers
              </li>
              <li
                className="cursor-pointer hover:text-amber-700"
                onClick={() => {
                  setCurrentView("studentSessionManagement");
                  setIsMenuOpen(false);
                }}
              >
                Student Management
              </li>

              <li
                className="cursor-pointer hover:text-amber-700"
                onClick={() => {
                  setCurrentView("myStudents");
                  setIsMenuOpen(false);
                }}
              >
                My Students
              </li>

              <li
                className="cursor-pointer hover:text-amber-700"
                onClick={() => {
                  setCurrentView("defenseDay");
                  setIsMenuOpen(false);
                }}
              >
                Defense Page
              </li>
              
              <li
                className="cursor-pointer hover:text-amber-700"
                onClick={() => {
                  setCurrentView("activityLog");
                  setIsMenuOpen(false);
                }}
              >
                Activity Log
              </li>
              
              <li
                className="cursor-pointer hover:text-amber-700"
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

        {/* Right-side Controls */}
        <div className="flex items-center gap-4">
          <span className="hidden sm:inline capitalize text-gray-600">
            Welcome, {role}
          </span>
          <div className="relative">
            <Bell
              className="w-6 h-6 text-gray-600 cursor-pointer"
              onClick={() => setCurrentView("notifications")}
            />
            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-medium leading-none text-white bg-amber-600 rounded-full"
                aria-label={`${unreadCount} unread notifications`}
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>
          <Lock
            className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800"
            onClick={() => setResetModalOpen(true)}
          />
          <Power
            className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-600"
            onClick={() => setShowLogoutModal(true)}
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {renderView()}
      </main>

      {/* Reset Password Modal */}
      <UpdatePasswordModal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
      />

      {/* Logout Confirmation Modal */}
      <Dialog open={showLogoutModal} onOpenChange={setShowLogoutModal}>
        <DialogContent className="max-w-md bg-white rounded-lg">
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600 mt-2">
            Are you sure you want to log out?
          </p>
          <DialogFooter className="mt-6 flex justify-end gap-4">
            <Button variant="outline" onClick={() => setShowLogoutModal(false)}>
              Cancel
            </Button>
            <Button className="bg-red-600 text-white" onClick={handleLogout}>
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
