import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { UserRole } from '@/types';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  created_at: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage key
const AUTH_USER_KEY = 'mindcarex_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_USER_KEY);
    
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem(AUTH_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const saveUser = (authUser: AuthUser) => {
    setUser(authUser);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
  };

  const clearUser = () => {
    setUser(null);
    localStorage.removeItem(AUTH_USER_KEY);
  };

  // Placeholder login - replace with your Spring Boot API call
  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with Spring Boot API call
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password }),
      // });
      // const data = await response.json();
      // saveUser(data.user);
      
      // Temporary: Create user from email for demo purposes
      saveUser({
        id: `user-${Date.now()}`,
        email,
        name: email.split('@')[0],
        role: 'PATIENT',
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Placeholder register - replace with your Spring Boot API call
  const register = useCallback(async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    
    try {
      // TODO: Replace with Spring Boot API call
      // const response = await fetch('/api/auth/register', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email, password, name, role }),
      // });
      // const data = await response.json();
      // saveUser(data.user);
      
      // Temporary: Create user for demo purposes
      saveUser({
        id: `user-${Date.now()}`,
        email,
        name,
        role,
        created_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    // TODO: Call Spring Boot logout endpoint if needed
    clearUser();
  }, []);

  const handleSetUser = useCallback((newUser: AuthUser | null) => {
    if (newUser) {
      saveUser(newUser);
    } else {
      clearUser();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        setUser: handleSetUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
