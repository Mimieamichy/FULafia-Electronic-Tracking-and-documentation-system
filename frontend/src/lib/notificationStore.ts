// src/stores/notificationStore.ts
import {create} from "zustand";

export type NotificationItem = {
  _id: string;
  recipient?: string;
  role?: string | string[];
  message: string;
  read?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [k: string]: any;
};

type State = {
  notifications: NotificationItem[];
  loading: boolean;
  error: string | null;

  // actions
  setNotifications: (notes: NotificationItem[]) => void;
  fetchNotifications: (opts: { baseUrl: string; token?: string }) => Promise<void>;
  markAsReadLocal: (id: string) => void;
  markAsReadApi: (opts: { baseUrl: string; token?: string; id: string }) => Promise<void>;
  // utility selectors (derived)
  unreadCount: () => number;
  visibleForUser: (userId?: string | null, userRoles?: string[] | null) => NotificationItem[];
};

export const useNotificationStore = create<State>((set, get) => ({
  notifications: [],
  loading: false,
  error: null,

  setNotifications: (notes) => set({ notifications: notes, error: null }),

  fetchNotifications: async ({ baseUrl, token }) => {
    set({ loading: true, error: null });
    try {
      const res = await fetch(`${baseUrl}/notification`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok) {
        const txt = await res.text();
        const err = `Failed to fetch notifications (${res.status}): ${txt}`;
        set({ error: err, loading: false });
        console.warn("[notificationStore] fetch error:", err);
        return;
      }

      const json = await res.json();
      const payload = json?.data ?? json ?? [];
      if (!Array.isArray(payload)) {
        set({ error: "Unexpected payload shape", loading: false });
        console.error("[notificationStore] unexpected payload:", payload);
        return;
      }

      set({ notifications: payload as NotificationItem[], loading: false });
      console.log("[notificationStore] fetched notifications:", payload);
    } catch (err: any) {
      console.error("[notificationStore] fetch exception:", err);
      set({ error: err?.message ?? String(err), loading: false });
    }
  },

  markAsReadLocal: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) => (n._id === id ? { ...n, read: true } : n)),
    })),

  markAsReadApi: async ({ baseUrl, token, id }) => {
    try {
      const body = JSON.stringify({ _id: id, read: true });
      const res = await fetch(`${baseUrl}/notification`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body,
      });

      console.log("[notificationStore] PATCH status:", res.status, res.statusText);
      const txt = await res.text();
      try {
        console.log("[notificationStore] PATCH body:", txt ? JSON.parse(txt) : txt);
      } catch {
        console.log("[notificationStore] PATCH text:", txt);
      }

      if (!res.ok) {
        console.warn("[notificationStore] markAsReadApi failed:", res.status);
      }
      // Optionally: re-fetch the notifications to ensure canonical state:
      // await get().fetchNotifications({ baseUrl, token });
    } catch (err) {
      console.warn("[notificationStore] markAsReadApi exception:", err);
    }
  },

  unreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },

  visibleForUser: (userId?: string | null, userRoles?: string[] | null) => {
    const rolesNorm = (r?: string[] | string | null) => {
      if (!r) return [];
      if (Array.isArray(r)) return r.map((x) => String(x).toLowerCase());
      return [String(r).toLowerCase()];
    };
    const userRolesArr = rolesNorm(userRoles);
    const roleMatches = (notifRole?: string | string[] | null) => {
      if (!notifRole) return true;
      const notifRoles = Array.isArray(notifRole)
        ? notifRole.map((r) => String(r).toLowerCase())
        : [String(notifRole).toLowerCase()];
      if (userRolesArr.length === 0) return false;
      for (const nr of notifRoles) {
        if (userRolesArr.includes(nr)) return true;
        if (nr === "supervisor" && userRolesArr.some((ur) => ur.includes("supervisor"))) return true;
        if (userRolesArr.some((ur) => ur.includes(nr) || nr.includes(ur))) return true;
      }
      return false;
    };

    return get().notifications.filter((n) => {
      if (n.recipient) {
        if (!userId) return false;
        if (String(n.recipient) === String(userId)) return true;
        return false;
      }
      return roleMatches(n.role as any);
    });
  },
}));
