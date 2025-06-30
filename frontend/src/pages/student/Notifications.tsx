// src/student/StudentNotifications.tsx
import NotificationCenter from "../NotificationCenter";
import { MessageSquare, CalendarCheck } from "lucide-react";

const studentNotifications = [
  {
    id: 1,
    title: "Supervisor Comment",
    message: "Dr. Okoro has left feedback on your proposal.",
    date: "June 27, 2025",
    unread: true,
    role: "STUDENT",
    icon: <MessageSquare size={20} className="text-purple-600" />,
  },
  {
    id: 2,
    title: "Supervisor Feedback Received",
    message: "Your proposal draft has been reviewed. See comments.",
    date: "June 28, 2025",
    unread: true,
    role: "STUDENT",
    icon: <MessageSquare className="text-amber-600" size={20} />,
  },
  {
    id: 3,
    title: "Defense Date Set",
    message: "Your proposal defense is scheduled for July 5 at 10:00AM.",
    date: "June 25, 2025",
    unread: false,
    role: "STUDENT",
    icon: <CalendarCheck className="text-green-600" size={20} />,
  },
];

export default function StudentNotifications() {
  return <NotificationCenter notifications={studentNotifications} />;
}
