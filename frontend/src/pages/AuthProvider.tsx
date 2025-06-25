import { createContext, useState, ReactNode, useContext } from 'react';

export type Role = 'HOD' | 'PG_COORD';

interface AuthContextProps {
  role: Role;
  userName: string;
  setRole: (r: Role) => void;
  setUserName: (n: string) => void;
}

// This is the actual context object:
export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// This is the provider component:
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [role, setRole] = useState<Role>('PG_COORD');
  const [userName, setUserName] = useState('John Doe');

  return (
    <AuthContext.Provider value={{ role, userName, setRole, setUserName }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to consume the context:
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
