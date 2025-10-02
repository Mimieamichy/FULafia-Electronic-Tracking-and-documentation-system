import React, { useEffect, useRef, useState } from "react";
import { Menu, Bell, Lock, Power } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import StudentDashboard from "./StudentDashboard";
import UploadWorkPage from "./UploadWorkPage";
import NotificationCenter from "../NotificationCenter";
import UpdatePasswordModal from "../UpdatePasswordModal";

export type StudentView = "dashboard" | "uploadWork" | "notifications";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

const StudentDashboardShell = () => {
  const { user, logout, token } = useAuth();
  const userName = user?.userName || "Student";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [currentView, setCurrentView] = useState<StudentView>("dashboard");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const unreadCount = useNotificationStore((s) => s.unreadCount());
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

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
    else document.removeEventListener("mousedown", onClick);
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
        return <StudentDashboard />;
      case "uploadWork":
        return <UploadWorkPage />;
      case "notifications":
        return <NotificationCenter />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm px-4 py-3 flex flex-wrap justify-between items-center gap-4 sm:gap-6 relative">
        <div className="flex items-center gap-4">
          <Menu
            className="w-6 h-6 text-gray-600 cursor-pointer"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          />
          
        </div>

        {/* Side menu */}
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute top-16 left-4 bg-white shadow-lg rounded-lg p-4 w-5/6 max-w-xs z-30"
          >
            <ul className="space-y-3 text-gray-700 text-sm">
              {[
                { label: "Dashboard", key: "dashboard" },
                { label: "Upload Work", key: "uploadWork" },
                { label: "Notifications", key: "notifications" },
              ].map((item) => (
                <li
                  key={item.key}
                  className="cursor-pointer hover:text-amber-700"
                  onClick={() => {
                    setCurrentView(item.key as StudentView);
                    setIsMenuOpen(false);
                  }}
                >
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Right-side icons */}
        <div className="flex items-center gap-4">
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

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">{renderView()}</main>

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
};

export default StudentDashboardShell;
