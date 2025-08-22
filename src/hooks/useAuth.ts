import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { api } from '../lib/api';
import type { User } from '../types';

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (userData: {
    email: string;
    password: string;
    name: string;
    type: 'adopter' | 'advertiser';
    phone: string;
    address: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = await api.getUser(session.user.id);
        setUser(userData);
      }
    } catch (err) {
      console.error('Error checking session:', err);
      setError('Erro ao verificar sessão existente');
      await supabase.auth.signOut();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user: userData, isAdmin } = await api.signin(email, password);
      setUser(userData);
      return { success: true };
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: err.message };
    }
  };

  const signup = async (userData: {
    email: string;
    password: string;
    name: string;
    type: 'adopter' | 'advertiser';
    phone: string;
    address: string;
  }) => {
    try {
      const { user: newUser } = await api.signup(userData);
      setUser(newUser);
      return { success: true };
    } catch (err: any) {
      console.error('Signup error:', err);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    signup,
    logout
  };
}
