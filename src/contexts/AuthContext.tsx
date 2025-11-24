import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserResponse } from "@/lib/api";

interface AuthContextType {
  user: UserResponse | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedEmail = localStorage.getItem("userEmail");
    const storedUser = localStorage.getItem("user");
    
    if (storedEmail && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("userEmail");
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = (email: string) => {
    localStorage.setItem("userEmail", email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("userEmail");
    localStorage.removeItem("user");
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
