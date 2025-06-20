import { useState, useEffect, useRef } from "react";
import { Menu, Power, Bell } from "lucide-react";
import { Link } from "react-router-dom";

import ViewProjectTopic from "./ViewProjectTopic";
import AssignPGCoordinator from "./AssignPGCoordinator";
import ProjectReview from "./ProjectReview";

const HodDashboard = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'home' | 'projectTopics' | 'assignPG' | 'projectReview'>('home');
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
                onClick={() => { setCurrentView('projectTopics'); setIsMenuOpen(false); }}
              >
                View Project Topics
              </li>
              <li
                className="hover:text-amber-700 cursor-pointer"
                onClick={() => { setCurrentView('assignPG'); setIsMenuOpen(false); }}
              >
                Assign PG Coordinator
              </li>
              <li
                className="hover:text-amber-700 cursor-pointer"
                onClick={() => { setCurrentView('projectReview'); setIsMenuOpen(false); }}
              >
                View Project Review
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
        {currentView === 'home' && (
          <>
            <h1 className="text-2xl font-semibold text-gray-800 mb-4">Welcome, HOD</h1>
            <p className="text-gray-600">Please select an action from the menu to proceed.</p>
          </>
        )}
        {currentView === 'projectTopics' && <ViewProjectTopic />}
        {currentView === 'assignPG' && <AssignPGCoordinator />}
        {currentView === 'projectReview' && <ProjectReview />}
      </main>
    </div>
  );
};

export default HodDashboard;
