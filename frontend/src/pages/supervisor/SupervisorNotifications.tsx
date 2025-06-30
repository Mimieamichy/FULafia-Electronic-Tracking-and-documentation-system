// src/supervisor/SupervisorNotifications.tsx
import NotificationCenter from "../NotificationCenter";
import { Users, CalendarCheck, MessageSquare } from "lucide-react";

const supervisorNotifications = [
  {
    id: 1,
    title: "New Student Assigned",
    message: "You have been assigned to supervise Grace A.",
    date: "June 25, 2025",
    unread: true,
    role: "SUPERVISOR",
    icon: <Users size={20} className="text-blue-600" />,
  },
  {
    id: 2,
    title: "Upcoming Defense",
    message: "You’re on the panel for a defense scheduled July 2.",
    date: "June 28, 2025",
    unread: false,
    role: "SUPERVISOR",
    icon: <CalendarCheck size={20} className="text-green-600" />,
  },
];

export default function SupervisorNotifications() {
  return <NotificationCenter notifications={supervisorNotifications} />;
}
