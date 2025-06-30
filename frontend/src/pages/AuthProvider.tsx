// src/AuthProvider.tsx
import { createContext, useState, ReactNode, useContext } from 'react';

export type Role = 'HOD' | 'PG_COORD' | 'SUPERVISOR' | 'STUDENT';

interface AuthContextProps {
  role: Role;
  userName: string;
  setRole: (r: Role) => void;
  setUserName: (n: string) => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>('PG_COORD');    // default can be adjusted
  const [userName, setUserName] = useState<string>('John Doe');

  return (
    <AuthContext.Provider value={{ role, userName, setRole, setUserName }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
