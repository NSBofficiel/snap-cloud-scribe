
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  isAuthenticated: boolean;
  isGuest: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isGuest, setIsGuest] = useState<boolean>(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      const authStatus = localStorage.getItem("snapcloud_auth");
      
      setIsAuthenticated(!!data.session || authStatus === "true" || authStatus === "guest");
      setIsGuest(authStatus === "guest");
    };
    
    checkAuthStatus();
    
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "snapcloud_auth") {
        const authStatus = e.newValue;
        setIsAuthenticated(authStatus === "true" || authStatus === "guest");
        setIsGuest(authStatus === "guest");
      }
    };
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        setIsGuest(false);
        localStorage.setItem("snapcloud_auth", "true");
        
        recordLoginHistory();
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsGuest(false);
        localStorage.removeItem("snapcloud_auth");
        localStorage.removeItem("snapcloud_username");
      }
    });
    
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      subscription.unsubscribe();
    };
  }, []);

  const recordLoginHistory = async () => {
    try {
      const userAgent = navigator.userAgent;
      
      await supabase.rpc('record_login', {
        user_agent_str: userAgent
      });
    } catch (error) {
      console.error('Error recording login with RPC:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (email === "guest@example.com" && password === "guest") {
      localStorage.setItem("snapcloud_auth", "guest");
      localStorage.setItem("snapcloud_username", "Guest");
      setIsAuthenticated(true);
      setIsGuest(true);
      return true;
    }
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        return false;
      }
      
      if (data.user) {
        localStorage.setItem("snapcloud_auth", "true");
        localStorage.setItem("snapcloud_username", email.split("@")[0]);
        setIsAuthenticated(true);
        setIsGuest(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (isGuest) {
        localStorage.removeItem("snapcloud_auth");
        localStorage.removeItem("snapcloud_username");
        localStorage.removeItem("snapcloud_photo");
        setIsAuthenticated(false);
        setIsGuest(false);
      } else if (user) {
        await supabase.rpc('record_logout');
        await supabase.auth.signOut();
        
        localStorage.removeItem("snapcloud_auth");
        localStorage.removeItem("snapcloud_username");
        localStorage.removeItem("snapcloud_photo");
        setIsAuthenticated(false);
        setIsGuest(false);
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isGuest, login, logout }}>
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
