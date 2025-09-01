import React, { useEffect, useRef, useState } from "react";
import { Menu, Bell, Lock, Power } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../AuthProvider";
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
import StudentNotifications from "./Notifications";
import UpdatePasswordModal from "../UpdatePasswordModal";

export type StudentView = "dashboard" | "uploadWork" | "notifications";

const StudentDashboardShell = () => {
  const { user, logout } = useAuth();
  const userName = user?.userName || "Student";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [currentView, setCurrentView] = useState<StudentView>("dashboard");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  

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

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <StudentDashboard />;
      case "uploadWork":
        return <UploadWorkPage />;
      case "notifications":
        return <StudentNotifications />;
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
          <span className="text-gray-700 text-sm sm:text-base">
            Welcome, {userName}
          </span>
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
          <Bell
            className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800"
            onClick={() => setCurrentView("notifications")}
          />
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
