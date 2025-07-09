// src/hod/NotificationsTab.tsx or NotificationsPage.tsx
import NotificationCenter from "../NotificationCenter";
import { Users, CalendarCheck, MessageSquare } from "lucide-react";
import { useAuth } from "../AuthProvider";

export default function NotificationsTab() {
  const { user } = useAuth();

  const hodNotifications = [
    {
      id: 1,
      title: "New Student Assigned",
      message: "You have been assigned to supervise Grace A.",
      date: "June 25, 2025",
      unread: true,
      role: "HOD",
      icon: <Users size={20} className="text-blue-600" />,
    },
    {
      id: 2,
      title: "Upcoming Defense",
      message: "You’re on the panel for a defense scheduled July 2.",
      date: "June 28, 2025",
      unread: false,
      role: "HOD",
      icon: <CalendarCheck size={20} className="text-green-600" />,
    },
  ];

  const provostNotifications = [
    {
      id: 1,
      title: "New External Examiner Added",
      message: "Dr. Jane Smith has been added as an external examiner.",
      date: "June 24, 2025",
      unread: true,
      role: "PROVOST",
      icon: <Users size={20} className="text-blue-600" />,
    },
    {
      id: 2,
      title: "Final Defense Scheduled",
      message: "Final defense for PhD candidates scheduled for July 5.",
      date: "June 29, 2025",
      unread: false,
      role: "PROVOST",
      icon: <CalendarCheck size={20} className="text-green-600" />,
    },
  ];

  const pgcNotifications = [
    {
      id: 3,
      title: "Proposal Uploaded",
      message: "New proposal uploaded by Chinedu Okeke.",
      date: "June 26, 2025",
      unread: true,
      role: "PG_COORD",
      icon: <MessageSquare size={20} className="text-purple-600" />,
    },
    {
      id: 4,
      title: "Defense Results Submitted",
      message: "Scores submitted for Internal Defense - Stage 2.",
      date: "June 27, 2025",
      unread: false,
      role: "PG_COORD",
      icon: <CalendarCheck size={20} className="text-green-600" />,
    },
  ];

  const notifications =
   user?.role?.toUpperCase() === "HOD" ? hodNotifications : user?.role?.toUpperCase() === "PG_COORD" ? pgcNotifications : provostNotifications;

  return <NotificationCenter notifications={notifications} />;
}
