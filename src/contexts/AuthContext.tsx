import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { UserRole } from '@/types';
import { mockPatients, mockDoctors } from '@/services/mockData';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage key for persisting auth
const AUTH_STORAGE_KEY = 'mindcarex_auth_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check mock data for matching user
    const doctor = mockDoctors.find(d => d.email === email);
    const patient = mockPatients.find(p => p.email === email);
    
    const foundUser = doctor || patient;
    
    if (foundUser) {
      const authUser: AuthUser = {
        id: foundUser.id,
        email: foundUser.email || email,
        name: foundUser.name,
        role: foundUser.role,
        created_at: foundUser.created_at,
      };
      setUser(authUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
      setIsLoading(false);
      return;
    }
    
    // For demo purposes, accept any email/password and create a mock user
    const mockUser: AuthUser = {
      id: `user-${Date.now()}`,
      email,
      name: email.split('@')[0],
      role: 'PATIENT',
      created_at: new Date().toISOString(),
    };
    
    setUser(mockUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser));
    setIsLoading(false);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string, role: UserRole) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Create new user
    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      email,
      name,
      role,
      created_at: new Date().toISOString(),
    };
    
    setUser(newUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
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
