import { useState } from "react";
import { BellRing, CheckCircle, Calendar } from "lucide-react";

interface Notification {
  id: string;
  type: 'submission' | 'defense' | 'general';
  message: string;
  timestamp: string;
  read: boolean;
}

const iconMap = {
  submission: <BellRing className="w-6 h-6 text-amber-700" />,
  defense:    <Calendar className="w-6 h-6 text-amber-700" />,
  general:    <CheckCircle className="w-6 h-6 text-amber-700" />,
};

const initialNotifications: Notification[] = [
  { id: '1', type: 'submission', message: 'Student Camilla Park submitted Thesis Draft.', timestamp: '2025-06-24 14:35', read: false },
  { id: '2', type: 'defense', message: 'Defense scheduled for Jacob Philip on 2025-07-01.', timestamp: '2025-06-23 09:20', read: true },
  { id: '3', type: 'general', message: 'New lecturer Engr. Christabel Henry added.', timestamp: '2025-06-22 11:15', read: false },
];

const SupervisorNotifications = () => {
  const [notifications, setNotifications] = useState(initialNotifications);

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
        {notifications.map((n, idx) => (
          <div key={n.id} className={`flex items-center p-4 ${n.read ? '' : 'bg-amber-50'}`}>
            <div className="mr-4">{iconMap[n.type]}</div>
            <div className="flex-1">
              <div className="text-gray-800">{n.message}</div>
              <div className="text-sm text-gray-500">{n.timestamp}</div>
            </div>
            {!n.read && (
              <button onClick={() => markRead(n.id)} className="text-amber-700 hover:text-amber-800">
                Mark Read
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupervisorNotifications;
