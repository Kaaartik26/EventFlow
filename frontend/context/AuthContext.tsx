import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI, facultyAPI } from '../services/api';

// Safe AsyncStorage wrapper
const safeAsyncStorage = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.warn('AsyncStorage getItem error:', error);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.warn('AsyncStorage setItem error:', error);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.warn('AsyncStorage removeItem error:', error);
    }
  },
};

interface User {
  id: number;
  name: string;
  email: string;
  role: 'student' | 'admin';
  created_at: string;
}

interface Faculty {
  id: number;
  name: string;
  email: string;
  department: string;
  created_at: string;
}

interface AuthContextType {
  user: User | Faculty | null;
  userType: 'student' | 'admin' | 'faculty' | null;
  token: string | null;
  login: (email: string, password: string, type: 'student' | 'admin' | 'faculty') => Promise<void>;
  signup: (userData: any, type: 'student' | 'admin' | 'faculty') => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | Faculty | null>(null);
  const [userType, setUserType] = useState<'student' | 'admin' | 'faculty' | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await safeAsyncStorage.getItem('token');
      const storedUserType = await safeAsyncStorage.getItem('userType');
      const storedUser = await safeAsyncStorage.getItem('user');

      if (storedToken && storedUserType && storedUser) {
        setToken(storedToken);
        setUserType(storedUserType as any);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      // Reset auth state on error
      setToken(null);
      setUserType(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string, type: 'student' | 'admin' | 'faculty') => {
    try {
      setIsLoading(true);
      
      let response;
      let userData;
      if (type === 'faculty') {
        response = await authAPI.facultyLogin({ email, password });
        const { access_token } = response.data;
        
        // Set token first, then get user data
        setToken(access_token);
        await safeAsyncStorage.setItem('token', access_token);
        
        const facultyData = await authAPI.getFacultyMe();
        userData = facultyData.data;
      } else {
        response = await authAPI.login({ email, password });
        const { access_token } = response.data;
        
        // Set token first, then get user data
        setToken(access_token);
        await safeAsyncStorage.setItem('token', access_token);
        
        const userResponse = await authAPI.getMe();
        userData = userResponse.data;
      }

      setUserType(type);
      setUser(userData);
      
      await safeAsyncStorage.setItem('userType', type);
      await safeAsyncStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: any, type: 'student' | 'admin' | 'faculty') => {
    try {
      setIsLoading(true);
      
      let response;
      if (type === 'faculty') {
        response = await authAPI.facultySignup(userData);
      } else {
        response = await authAPI.signup({ ...userData, role: type });
      }

      // Auto-login after signup
      await login(userData.email, userData.password, type);
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await safeAsyncStorage.removeItem('token');
      await safeAsyncStorage.removeItem('userType');
      await safeAsyncStorage.removeItem('user');
      
      setUser(null);
      setUserType(null);
      setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state even if AsyncStorage fails
      setUser(null);
      setUserType(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userType,
        token,
        login,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
