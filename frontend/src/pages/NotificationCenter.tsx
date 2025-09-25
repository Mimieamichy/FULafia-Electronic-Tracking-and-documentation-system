// src/components/NotificationCenter.tsx (simplified parts)
import  { useEffect } from "react";
import { useAuth } from "./AuthProvider";
import { useNotificationStore } from "@/lib/notificationStore";
import { Bell } from "lucide-react";

export default function NotificationCenter() {
  const { user, token } = useAuth();
  const baseUrl = import.meta.env.VITE_BACKEND_URL;

  
  const loading = useNotificationStore((s) => s.loading);
  const fetchNotifications = useNotificationStore((s) => s.fetchNotifications);
  const markAsReadLocal = useNotificationStore((s) => s.markAsReadLocal);
  const markAsReadApi = useNotificationStore((s) => s.markAsReadApi);
  const visibleForUser = useNotificationStore((s) => s.visibleForUser);

  // fetch if store empty (or just rely on DashboardShell to fetch)
  useEffect(() => {
    if (token) {
      fetchNotifications({ baseUrl, token });
    }
  }, [token, fetchNotifications]);

  // compute visible and unread
  const userId = user?._id ?? user?.id ?? null;
  const userRoles = user?.roles ?? user?.role ?? null;
  const visible = visibleForUser(userId, userRoles);

  const handleClick = async (id: string) => {
    markAsReadLocal(id); // optimistic update in store
    // persist
    await markAsReadApi({ baseUrl, token, id });
    // optionally re-fetch canonical state:
    // await fetchNotifications({ baseUrl, token });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold uppercase">{user?.role ?? "User"} Notifications</h1>
      <div className="bg-white rounded-lg shadow p-6 space-y-4 max-w-2xl">
        {loading ? (
          <div className="text-sm text-gray-500">Loading notifications...</div>
        ) : visible.length === 0 ? (
          <p className="text-sm text-center text-gray-500">No notifications.</p>
        ) : (
          visible.map((note) => (
            <div
              key={note._id}
              onClick={() => handleClick(note._id)}
              className={`flex items-start gap-4 border-b pb-4 last:border-0 cursor-pointer ${note.read ? "" : "bg-amber-50"}`}
            >
              <div>
                {note.read ? <Bell size={20} className="text-gray-400" /> : <Bell size={20} className="text-amber-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">{note.message}</p>
                {note.createdAt && <div className="text-xs text-gray-400 mt-1">{new Date(note.createdAt).toLocaleString()}</div>}
              </div>
              {!note.read && <span className="ml-auto bg-amber-600 text-white text-xs rounded-full px-2 py-0.5">New</span>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
