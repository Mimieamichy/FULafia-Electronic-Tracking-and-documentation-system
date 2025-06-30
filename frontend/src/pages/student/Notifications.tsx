import {  MessageSquare, CalendarCheck } from "lucide-react";

const mockNotifications = [
  {
    id: 1,
    title: "Supervisor Feedback Received",
    message: "Your proposal draft has been reviewed. ",
    icon: <MessageSquare className="text-amber-600" size={20} />,
    date: "June 28, 2025",
    unread: true,
  },
  {
    id: 2,
    title: "Defense Date Set",
    message: "Your proposal defense is scheduled for July 5 at 10:00AM.",
    icon: <CalendarCheck className="text-green-600" size={20} />,
    date: "June 25, 2025",
    unread: false,
  },
];

export default function StudentNotifications() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4 max-w-2xl">
        {mockNotifications.map((note) => (
          <div
            key={note.id}
            className={`flex items-start gap-4 border-b pb-4 last:border-0 ${
              note.unread ? "bg-amber-50" : ""
            }`}
          >
            <div>{note.icon}</div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-gray-800">
                {note.title}
              </h3>
              <p className="text-sm text-gray-600">{note.message}</p>
              <span className="text-xs text-gray-400">{note.date}</span>
            </div>
            {note.unread && (
              <span className="ml-auto bg-amber-600 text-white text-xs rounded-full px-2 py-0.5">
                New
              </span>
            )}
          </div>
        ))}

        {mockNotifications.length === 0 && (
          <p className="text-gray-500 text-sm text-center">
            No notifications available.
          </p>
        )}
      </div>
    </div>
  );
}
