// src/supervisor/SupervisorDashboard.tsx
import { useAuth } from "../AuthProvider";
import { CalendarCheck, Users, Bell } from "lucide-react";

export default function SupervisorDashboard() {
  const { userName } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">
        Welcome back, {userName}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Assigned Students */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col items-start">
          <Users className="text-amber-700 mb-3" size={32} />
          <h2 className="text-lg font-semibold text-gray-800">
            Assigned Students
          </h2>
          <p className="text-3xl font-bold text-amber-700 mt-2">5</p>
          <p className="text-gray-500 text-sm">students assigned to you</p>
        </div>

        {/* Upcoming Defenses */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col items-start">
          <CalendarCheck className="text-amber-700 mb-3" size={32} />
          <h2 className="text-lg font-semibold text-gray-800">
            Upcoming Defenses
          </h2>
          <p className="text-3xl font-bold text-amber-700 mt-2">2</p>
          <p className="text-gray-500 text-sm">defenses scheduled</p>
        </div>

        {/* Notifications */}
        <div className="bg-white shadow rounded-lg p-6 flex flex-col items-start">
          <Bell className="text-amber-700 mb-3" size={32} />
          <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          <p className="text-3xl font-bold text-amber-700 mt-2">3</p>
          <p className="text-gray-500 text-sm">new updates</p>
        </div>
      </div>
    </div>
  );
}
