// src/dean/DeanDashboard.tsx
import React, { useEffect, useState } from "react";
import { Users, Building2Icon, BookOpen, CalendarDays } from "lucide-react";
import { useAuth } from "../AuthProvider";

interface Metrics {
  departments: number;
  students: number;
  lecturers: number;
  upcomingDefenses: number;
}

// Mock fetch — replace with real API calls
async function fetchFacultyMetrics(): Promise<Metrics> {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          departments: 5,
          students: 240,
          lecturers: 35,
          upcomingDefenses: 12,
        }),
      300
    )
  );
}

export default function DeanDashboard() {
  const [metrics, setMetrics] = useState<Metrics>({
    departments: 0,
    students: 0,
    lecturers: 0,
    upcomingDefenses: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const faculty = user?.faculty ;



  useEffect(() => {
    fetchFacultyMetrics().then((data) => {
      setMetrics(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <p className="text-center py-10 text-gray-500">Loading...</p>;
  }

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Faculty of {faculty} Overview</h1>
        <p className="text-gray-600 mt-1">
          Here’s a quick snapshot of your faculty’s key metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Departments */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4 border border-gray-100 hover:shadow-md transition">
          <div className="bg-amber-50 p-3 rounded-full">
            <Building2Icon className="w-8 h-8 text-amber-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Departments</p>
            <p className="text-2xl font-semibold text-gray-800">
              {metrics.departments}
            </p>
          </div>
        </div>

        {/* Students */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4 border border-gray-100 hover:shadow-md transition">
          <div className="bg-amber-50 p-3 rounded-full">
            <Users className="w-8 h-8 text-amber-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Students</p>
            <p className="text-2xl font-semibold text-gray-800">
              {metrics.students}
            </p>
          </div>
        </div>

        {/* Lecturers */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4 border border-gray-100 hover:shadow-md transition">
          <div className="bg-amber-50 p-3 rounded-full">
            <BookOpen className="w-8 h-8 text-amber-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Lecturers</p>
            <p className="text-2xl font-semibold text-gray-800">
              {metrics.lecturers}
            </p>
          </div>
        </div>

        {/* Upcoming Defenses */}
        <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4 border border-gray-100 hover:shadow-md transition">
          <div className="bg-amber-50 p-3 rounded-full">
            <CalendarDays className="w-8 h-8 text-amber-700" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Upcoming Defenses</p>
            <p className="text-2xl font-semibold text-gray-800">
              {metrics.upcomingDefenses}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
