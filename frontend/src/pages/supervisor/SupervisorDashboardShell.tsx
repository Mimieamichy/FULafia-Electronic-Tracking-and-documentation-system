// src/SupervisorDashboardShell.tsx
import React, { useState, useRef, useEffect } from "react";
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
import SupervisorDashboard from "./SupervisorDashboard";
import MyStudentsPage from "./MyStudentsPage";
import NotificationCenter from "../NotificationCenter";
import DefenseDayPage from "../DefenseDayPage";
import UpdatePasswordModal from "../UpdatePasswordModal";

export type SupervisorView =
  | "dashboard"
  | "myStudents"
  | "defenseDay"
  | "notifications";

export default function SupervisorDashboardShell() {
  const { user, logout } = useAuth();

  const role = user?.role || "User";
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const [currentView, setCurrentView] = useState<SupervisorView>("dashboard");
  const [resetModalOpen, setResetModalOpen] = useState(false);
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [isMenuOpen]);

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <SupervisorDashboard />;
      case "myStudents":
        return <MyStudentsPage />;
      case "defenseDay":
        return <DefenseDayPage />;
      case "notifications":
        return <NotificationCenter />;
      default:
        return null;
    }
  };
  // Logout
  const handleLogout = () => {
    logout();
    navigate("/");
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
                Defense Day
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
          <span className="hidden sm:inline text-gray-600">
            Welcome, {role}
          </span>
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
