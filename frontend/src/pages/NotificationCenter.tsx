

// ---------------------------------------------------------
// src/components/NotificationCenter.tsx
import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useAuth } from "./AuthProvider";

type NotificationItem = {
  _id?: string;
  id?: string | number;
  title: string;
  message: string;
  date?: string;
  unread?: boolean;
  icon?: any;
  role?: string; // or an array/string depending on backend
  [k: string]: any;
};

const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function NotificationCenter() {
  const { user, token } = useAuth() as { user?: any; token?: string };
  const [notes, setNotes] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // grab role from user.role as you requested
  const userRole = user?.role ?? null;

  useEffect(() => {
    let mounted = true;
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${baseUrl}/notification`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        // log raw response status for debugging
        console.log("/notification GET response status:", res.status, res.statusText);

        if (!res.ok) {
          const txt = await res.text();
          console.error("/notification GET error body:", txt);
          throw new Error(`Failed to load notifications (${res.status}): ${txt}`);
        }

        const json = await res.json();
        // log the API response payload for you to inspect
        console.log("/notification GET payload:", json);

        // support common shapes: { data: [...] } or raw array
        const payload = json?.data ?? json ?? [];

        if (!Array.isArray(payload)) {
          console.error("Unexpected notifications payload shape:", payload);
          throw new Error("Unexpected notifications payload");
        }

        if (!mounted) return;
        setNotes(payload as NotificationItem[]);
      } catch (err: any) {
        console.error("NotificationCenter fetch error:", err);
        if (mounted) setError(err?.message ?? String(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchNotifications();
    return () => {
      mounted = false;
    };
  }, [token, userRole]);

  const markAsReadLocal = (id: string | number) => {
    setNotes((prev) => prev.map((n) => (n._id === id || n.id === id ? { ...n, unread: false } : n)));
  };

  // Updated to call /notification endpoint without putting the id in the URL
  // We send the id in the request body (or adjust if your backend expects different shape)
  const markAsReadApi = async (id: string | number) => {
    const url = `${baseUrl}/notification`;
    const body = JSON.stringify({ id });

    try {
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
      });

      // log the response so you can inspect server behavior
      console.log("/notification PATCH response status:", res.status, res.statusText);
      const txt = await res.text();
      try {
        const parsed = txt ? JSON.parse(txt) : null;
        console.log("/notification PATCH payload:", parsed);
      } catch (_e) {
        console.log("/notification PATCH text:", txt);
      }

      if (!res.ok) {
        console.warn(`Failed to mark notification read (${res.status})`);
      }
    } catch (err) {
      console.warn("markAsReadApi error:", err);
    }
  };

  const handleClick = (id: string | number) => {
    markAsReadLocal(id);
    markAsReadApi(id);
  };

  // filter by role: show notification if it has no role OR it matches user.role
  const visibleNotes = notes.filter((n) => {
    if (!n.role) return true;
    // support string role or array of roles
    if (Array.isArray(n.role)) return n.role.includes(userRole);
    return String(n.role) === String(userRole);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">{userRole ?? "User"} Notifications</h1>

      <div className="bg-white rounded-lg shadow p-6 space-y-4 max-w-2xl">
        {loading ? (
          <div className="text-sm text-gray-500">Loading notifications...</div>
        ) : error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : visibleNotes.length === 0 ? (
          <p className="text-sm text-center text-gray-500">No notifications.</p>
        ) : (
          visibleNotes.map((note) => (
            <div
              key={note._id ?? note.id}
              onClick={() => handleClick(note._id ?? note.id ?? "")}
              className={`flex items-start gap-4 border-b pb-4 last:border-0 cursor-pointer ${
                note.unread ? "bg-amber-50" : ""
              }`}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleClick(note._id ?? note.id ?? "");
              }}
            >
              <div>{note.icon ?? <Bell size={20} className="text-amber-600" />}</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-800">{note.title}</h3>
                <p className="text-sm text-gray-600">{note.message}</p>
                {note.date && <span className="text-xs text-gray-400">{note.date}</span>}
              </div>

              {note.unread && (
                <span className="ml-auto bg-amber-600 text-white text-xs rounded-full px-2 py-0.5">New</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
