import { GraduationCap, Users, BookUser, CalendarDays } from "lucide-react";

const statData = [
  {
    icon: <GraduationCap className="w-10 h-10 text-amber-700" />,
    title: "PG Coordinators",
    count: 4,
  },
  {
    icon: <Users className="w-10 h-10 text-amber-700" />,
    title: "Lecturers",
    count: 12,
  },
  {
    icon: <BookUser className="w-10 h-10 text-amber-700" />,
    title: "Students",
    count: 120,
  },
  {
    icon: <CalendarDays className="w-10 h-10 text-amber-700" />,
    title: "Active Sessions",
    count: 3,
  },
];

const HodDashboardOverview = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-800">Welcome, Dr. James Bagudu 👋</h1>
        <p className="text-gray-600 mt-1">Here’s an overview of your departmental activities</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statData.map((item, idx) => (
          <div
            key={idx}
            className="bg-white rounded-xl shadow-md p-6 flex items-center gap-4 border border-gray-100 hover:shadow-lg transition-all"
          >
            <div className="bg-amber-50 p-3 rounded-full">
              {item.icon}
            </div>
            <div>
              <div className="text-sm text-gray-500">{item.title}</div>
              <div className="text-xl font-semibold text-gray-800">{item.count}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HodDashboardOverview;
