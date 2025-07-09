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
}

interface AuthContextProps {
  user: UserProfile | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    //  console.log("🧾 Retrieved token from localStorage:", storedToken);
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post(`${baseUrl}/auth/login`, { email, password });

    const { user, token: authToken } = res.data.data;
    console.log("Login response:", res.data);
    


    const userProfile: UserProfile = {
      userName: `${user.firstName} ${user.lastName}`,
      role: user.roles[0], // assuming only one role
      email: user.email,
      id: user._id,
    };

    setUser(userProfile);
    setToken(authToken);

    localStorage.setItem("user", JSON.stringify(userProfile));
    localStorage.setItem("token", authToken);
    axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
    
    console.log("🔐 Token stored:", authToken);
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
