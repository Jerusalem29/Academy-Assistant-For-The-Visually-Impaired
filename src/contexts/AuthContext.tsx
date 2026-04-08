import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isHead: boolean;
  isLecturer: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Define mock users with different roles
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Elias Kemal',
    role: 'head',
    department: 'Computer Science',
    email: 'head@haramaya.edu'
  },
  {
    id: '2',
    name: 'Prof. Sarah Johnson',
    role: 'lecturer',
    department: 'Computer Science',
    email: 'lecturer@haramaya.edu'
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Valid credentials
    const validCredentials: { [key: string]: string } = {
      'head@haramaya.edu': 'password',
      'lecturer@haramaya.edu': 'password'
    };

    if (validCredentials[email] && password === validCredentials[email]) {
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      }
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const isAuthenticated = !!currentUser;
  const isHead = isAuthenticated && currentUser?.role === 'head';
  const isLecturer = isAuthenticated && currentUser?.role === 'lecturer';

  return (
    <AuthContext.Provider value={{
      currentUser,
      login,
      logout,
      isAuthenticated,
      isHead,
      isLecturer
    }}>
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