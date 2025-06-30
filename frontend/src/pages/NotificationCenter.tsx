// src/components/NotificationCenter.tsx
import { useState } from "react";
import { useAuth } from "./AuthProvider";
import { Bell, MessageSquare, CalendarCheck, Users } from "lucide-react";

type Notification = {
  id: number;
  title: string;
  message: string;
  date: string;
  unread: boolean;
  icon?: JSX.Element;
  role?: string; // Optional: to filter by role
};

interface NotificationCenterProps {
  notifications: Notification[];
}

const NotificationCenter = ({ notifications }: NotificationCenterProps) => {
  const { role } = useAuth();
  const [localNotes, setLocalNotes] = useState(notifications);

  const handleClick = (id: number) => {
    setLocalNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{role} Notifications</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4 max-w-2xl">
        {localNotes
          .filter((n) => !n.role || n.role === role)
          .map((note) => (
            <div
              key={note.id}
              onClick={() => handleClick(note.id)}
              className={`flex items-start gap-4 border-b pb-4 last:border-0 cursor-pointer ${
                note.unread ? "bg-amber-50" : ""
              }`}
            >
              <div>{note.icon ?? <Bell size={20} className="text-amber-600" />}</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-800">{note.title}</h3>
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

        {localNotes.length === 0 && (
          <p className="text-sm text-center text-gray-500">No notifications.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationCenter;
