// src/hod/HodDashboardOverview.tsx
import { GraduationCap, Users, BookUser, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "../AuthProvider";

interface StatItem {
  icon: React.ReactNode;
  title: string;
  count: number;
}

const statData: StatItem[] = [
  {
    icon: <GraduationCap className="w-8 sm:w-10 h-8 sm:h-10 text-amber-700" />,
    title: "PG Coordinators",
    count: 4,
  },
  {
    icon: <Users className="w-8 sm:w-10 h-8 sm:h-10 text-amber-700" />,
    title: "Lecturers",
    count: 12,
  },
  {
    icon: <BookUser className="w-8 sm:w-10 h-8 sm:h-10 text-amber-700" />,
    title: "Students",
    count: 120,
  },
  {
    icon: <CalendarDays className="w-8 sm:w-10 h-8 sm:h-10 text-amber-700" />,
    title: "Active Sessions",
    count: 3,
  },
];



export default function HodDashboardOverview() {
  const { user } = useAuth();
 
  // Fallback if name isn't available
  const displayName = user?.userName  || "User";

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-screen-lg mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
          Welcome, {displayName} 👋
        </h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Here’s an overview of your {user?.role}, {user?.department} activities
        </p>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statData.map((item, idx) => (
          <div
            key={idx}
            className="
              bg-white rounded-xl shadow-md p-5 flex items-center gap-4 border border-gray-100
              hover:shadow-lg transition-shadow duration-300 ease-in-out
              min-w-0
            "
          >
            <div className="bg-amber-50 p-3 rounded-full flex-shrink-0">
              {item.icon}
            </div>
            <div className="truncate">
              <div className="text-sm sm:text-base text-gray-500 truncate">
                {item.title}
              </div>
              <div className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                {item.count}
              </div>
            </div>
          </div>
        ))}
      </div>

     
    </div>
  );
}
