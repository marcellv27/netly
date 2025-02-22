import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { getCurrentUser, signIn, signOut, signUp } from '../lib/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Omit<User, 'id' | 'orders'>) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      const user = await getCurrentUser();
      setUser(user);
    } catch (error) {
      console.error('Error al verificar usuario:', error);
    } finally {
      setLoading(false);
    }
  }

  const value = {
    user,
    loading,
    signIn: async (email: string, password: string) => {
      await signIn(email, password);
      await checkUser();
    },
    signUp: async (email: string, password: string, userData: Omit<User, 'id' | 'orders'>) => {
      await signUp(email, password, userData);
      await checkUser();
    },
    signOut: async () => {
      await signOut();
      setUser(null);
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
}