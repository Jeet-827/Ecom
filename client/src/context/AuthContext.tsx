import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'owner';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string, isAdminToggle: boolean) => Promise<{ success: boolean; message: string }>;
  signup: (username: string, email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore session
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Clear corrupt storage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, isAdminToggle: boolean) => {
    try {
      const url = isAdminToggle 
        ? 'http://localhost:5000/api/auth/admin/signin' 
        : 'http://localhost:5000/api/auth/signin';
      
      const res = await axios.post(url, { email, password });
      
      const resToken = res.data.accessToken;
      const resUser = res.data.user || res.data.admin; // admin login returns 'admin' key, signin returns 'user' key

      if (resToken && resUser) {
        // Ensure role is set for admins
        if (isAdminToggle && !resUser.role) {
          resUser.role = 'admin';
        }
        
        localStorage.setItem('accessToken', resToken);
        localStorage.setItem('user', JSON.stringify(resUser));
        
        setToken(resToken);
        setUser(resUser);
        return { success: true, message: res.data.message || 'Login successful' };
      }
      return { success: false, message: 'Invalid response from server' };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed. Please verify credentials.' 
      };
    }
  };

  const signup = async (username: string, email: string, password: string) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/signup', { username, email, password });
      const resToken = res.data.accessToken;
      const resUser = res.data.user;

      if (resToken && resUser) {
        localStorage.setItem('accessToken', resToken);
        localStorage.setItem('user', JSON.stringify(resUser));
        
        setToken(resToken);
        setUser(resUser);
        return { success: true, message: res.data.message || 'Registration successful' };
      }
      return { success: true, message: 'Signup complete! Please login.' };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Signup failed. Please try again.' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token;
  const isAdmin = user ? (user.role === 'admin' || user.role === 'owner') : false;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isAdmin, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
