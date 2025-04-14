
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

  // Check if user is already logged in
  useEffect(() => {
    const checkAuthStatus = async () => {
      const { data } = await supabase.auth.getSession();
      const authStatus = localStorage.getItem("snapcloud_auth");
      
      setIsAuthenticated(!!data.session || authStatus === "true" || authStatus === "guest");
      setIsGuest(authStatus === "guest");
    };
    
    checkAuthStatus();
    
    // Listen for storage events to handle multi-tab scenarios
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "snapcloud_auth") {
        const authStatus = e.newValue;
        setIsAuthenticated(authStatus === "true" || authStatus === "guest");
        setIsGuest(authStatus === "guest");
      }
    };
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        setIsGuest(false);
        localStorage.setItem("snapcloud_auth", "true");
        
        // Record login in history
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
      // Get user agent and create login record
      const userAgent = navigator.userAgent;
      
      await supabase.from('login_history').insert({
        ip_address: 'Unknown', // IP is not accessible on client side for privacy
        user_agent: userAgent
      });
    } catch (error) {
      console.error('Error recording login:', error);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Handle guest login case specifically
    if (email === "guest@example.com" && password === "guest") {
      localStorage.setItem("snapcloud_auth", "guest");
      localStorage.setItem("snapcloud_username", "Guest");
      setIsAuthenticated(true);
      setIsGuest(true);
      return true;
    }
    
    // Regular login logic
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
        // Save username from email
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
    if (isGuest) {
      // For guest users, just clear local storage
      localStorage.removeItem("snapcloud_auth");
      localStorage.removeItem("snapcloud_username");
      localStorage.removeItem("snapcloud_photo");
      setIsAuthenticated(false);
      setIsGuest(false);
    } else {
      // For regular users, sign out from Supabase
      try {
        // Update logout timestamp if possible
        await supabase.from('login_history')
          .update({ logout_timestamp: new Date().toISOString() })
          .is('logout_timestamp', null);
          
        // Sign out from Supabase
        await supabase.auth.signOut();
        
        localStorage.removeItem("snapcloud_auth");
        localStorage.removeItem("snapcloud_username");
        localStorage.removeItem("snapcloud_photo");
        setIsAuthenticated(false);
        setIsGuest(false);
      } catch (error) {
        console.error("Logout error:", error);
      }
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
