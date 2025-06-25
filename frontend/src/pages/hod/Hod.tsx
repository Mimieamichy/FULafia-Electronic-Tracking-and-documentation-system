import { useState, useEffect, useRef } from "react";
import { Menu, Power, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import HodDashboardOverview from "./HodDashboardOverview";
import PgLecturerManagement from "./PgLecturerManagement";
import StudentSessionManagement from "./StudentSessionManagement";
import NotificationsTab from "./NotificationsTab";

const HodDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'projectTopics' | 'assignPG' | 'notifications'>('home');
  const menuRef = useRef<HTMLDivElement>(null);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center relative">
        <Menu
          className="w-6 h-6 text-gray-600 cursor-pointer"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        />
        {isMenuOpen && (
          <div ref={menuRef} className="absolute top-16 left-4 bg-white shadow-lg rounded-lg p-4 w-64 z-10">
            <ul className="space-y-3 text-gray-700">
              <li
                className="hover:text-amber-700 cursor-pointer"
                onClick={() => { setCurrentView('home'); setIsMenuOpen(false); }}
              >
                Home
              </li>
              <li
                className="hover:text-amber-700 cursor-pointer"
                onClick={() => { setCurrentView('projectTopics'); setIsMenuOpen(false); }}
              >
                View Students
              </li>
              <li
                className="hover:text-amber-700 cursor-pointer"
                onClick={() => { setCurrentView('assignPG'); setIsMenuOpen(false); }}
              >
                Assign PG Coordinator
              </li>
              <li
                className="hover:text-amber-700 cursor-pointer"
                onClick={() => { setCurrentView('notifications'); setIsMenuOpen(false); }}
              >
               Notifications
              </li>
            </ul>
          </div>
        )}
        <div className="flex items-center gap-4">
          <span className="text-gray-600">Tue April 2024</span>
          <Bell className="w-6 h-6 text-gray-600 cursor-pointer hover:text-gray-800 transition-colors" />
          <Link to="/" title="Sign out">
            <Power className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-600 transition-colors" />
          </Link>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {currentView === 'home' && <HodDashboardOverview />}
        {currentView === 'projectTopics' && <StudentSessionManagement />}
        {currentView === 'assignPG' && <PgLecturerManagement />}
        {currentView === 'notifications' && <NotificationsTab />}
      </main>
    </div>
  );
};

export default HodDashboard;
