// src/provost/ProvostDashboardOverview.tsx
import React from "react";
import { UserPlus, Calendar, Users, FileText, ActivityIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StatCard {
  icon: React.ReactNode;
  title: string;
  count: number | string;
  description: string;
}

const stats: StatCard[] = [
  {
    icon: <UserPlus className="w-10 h-10 text-amber-700" />,
    title: "External Examiners",
    count: "12",
    description: "added across departments",
  },
  {
    icon: <Calendar className="w-10 h-10 text-amber-700" />,
    title: "Final Defenses",
    count: "5",
    description: "scheduled for last stage",
  },
  {
    icon: <Users className="w-10 h-10 text-amber-700" />,
    title: "College Reps",
    count: "8",
    description: "assigned from lecturers",
  },
  {
    icon: <FileText className="w-10 h-10 text-amber-700" />,
    title: "Score Sheets",
    count: "1",
    description: "general template created",
  },
  {
    icon: <ActivityIcon className="w-10 h-10 text-amber-700" />,
    title: "Activity Log",
    count: "200+",
    description: "recent events across school",
  },
];

interface HodDashboardOverviewProps {
  onCreateSessionClick: () => void;
}

export default function ProvostDashboardOverview({
  onCreateSessionClick,
}: HodDashboardOverviewProps) {
  return (
    <div className="space-y-6 px-4 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">
          Welcome, Provost 👋
        </h1>
        <p className="text-gray-600 mt-1">
          Here’s an overview of your school-wide responsibilities
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {stats.map((card, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4 border border-gray-100 hover:shadow-lg transition-all"
          >
            <div className="bg-amber-50 p-3 rounded-full">
              {card.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm text-gray-500">{card.title}</div>
              <div className="text-xl font-semibold text-gray-800">
                {card.count}
              </div>
              <div className="text-sm text-gray-400">{card.description}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
          <Button
            className="
              bg-amber-700 text-white
              w-full sm:w-auto
              py-2 px-4
              text-sm sm:text-base
              rounded-md
              transition
              hover:bg-amber-800
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700 focus-visible:ring-offset-2
            "
            onClick={onCreateSessionClick}
          >
            + New Session
          </Button>
        </div>
    </div>
  );
}
