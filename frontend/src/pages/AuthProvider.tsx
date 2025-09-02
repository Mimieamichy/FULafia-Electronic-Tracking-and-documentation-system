// src/AuthProvider.tsx
import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useEffect,
} from "react";
import axios from "axios";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

interface UserProfile {
  userName: string;
  role: string;
  email: string;
  id: string;
  department: string;
  faculty?: string;
}

interface AuthContextProps {
  user: UserProfile | null;
  token: string | null;
  login: (
    email: string,
    password: string
  ) => Promise<{ user: UserProfile; token: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");


    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
        axios.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${storedToken}`;
      } catch (err) {
        console.warn("Failed to parse stored user:", err);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${baseUrl}/auth/login`, {
        email,
        password,
      });
      const { user: rawUser, token: authToken } = res.data.data;

      // Defensive role extraction
      let roleValue = "unknown";
      if (rawUser) {
        if (Array.isArray(rawUser.roles) && rawUser.roles.length > 0) {
          roleValue = rawUser.roles[0];
        } else if (typeof rawUser.roles === "string") {
          roleValue = rawUser.roles;
        } else if (rawUser.role) {
          roleValue = rawUser.role;
        }
      }

      const userProfile: UserProfile = {
        userName: `${rawUser.firstName ?? ""} ${rawUser.lastName ?? ""}`.trim(),
        role: roleValue,
        email: rawUser.email,
        id: rawUser.id,
        department: rawUser.department,
        faculty: rawUser.faculty,
      };

      console.log("User profile created:", userProfile);
      // update state + persistence
      setUser(userProfile);
      setToken(authToken);
      localStorage.setItem("user", JSON.stringify(userProfile));
      localStorage.setItem("token", authToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

      return { user: userProfile, token: authToken };
    } catch (err: any) {
      // Normalize error for callers
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials.";
      // Re-throw so SignIn can catch and show toast
      throw new Error(message);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
