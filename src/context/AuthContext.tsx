
import React, { createContext, useContext, useState, useEffect } from "react";

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      const authStatus = localStorage.getItem("snapcloud_auth");
      setIsAuthenticated(authStatus === "true" || authStatus === "guest");
    };
    
    checkAuthStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // This is a simple mock implementation
    // In a real app, you would validate against a backend
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // For demo, we're accepting any non-empty credentials
      if (email && password) {
        localStorage.setItem("snapcloud_auth", "true");
        // Save a default username from the email
        localStorage.setItem("snapcloud_username", email.split("@")[0]);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("snapcloud_auth");
    localStorage.removeItem("snapcloud_username");
    localStorage.removeItem("snapcloud_photo");
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
