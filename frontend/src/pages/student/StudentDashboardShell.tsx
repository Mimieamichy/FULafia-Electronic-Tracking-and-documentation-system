import React, { useEffect, useRef, useState } from "react";
import { Menu, Bell, Lock, Power } from "lucide-react";
import { Link } from "react-router-dom";
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

export type StudentView = "dashboard" | "uploadWork" | "notifications";

const StudentDashboardShell = () => {
  const { user } = useAuth();
  const userName = user?.userName || "Student";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [currentView, setCurrentView] = useState<StudentView>("dashboard");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

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
            onClick={() => setLogoutModalOpen(true)}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">{renderView()}</main>

      {/* Reset Password Modal */}
      <Dialog open={resetModalOpen} onOpenChange={setResetModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Your Password</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 mb-4">
            A reset link will be sent to your email.
          </p>
          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2">
            <Button variant="outline" onClick={() => setResetModalOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-amber-700 text-white"
              onClick={() => setResetModalOpen(false)}
            >
              Send Reset Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Modal */}
      <Dialog open={logoutModalOpen} onOpenChange={setLogoutModalOpen}>
        <DialogContent className="max-w-md w-full mx-0 sm:mx-auto sm:rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Confirm Logout
            </DialogTitle>
          </DialogHeader>

          <p className="text-sm text-gray-600 mb-4">
            Are you sure you want to logout?
          </p>

          <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2">
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

export default StudentDashboardShell;
