import React, { createContext, useContext, useState, useEffect } from 'react';

interface ServiceMan {
  _id: string;
  ServiceManId: string;
  ServiceManName: string;
  Email: string;
  ContactNumber: string;
  AadhaarNumber: string;
  BranchName: string;
  ImageUrl: string;
}

interface AuthContextType {
  user: ServiceMan | null;
  token: string | null;
  login: (userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ServiceMan | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setToken(storedToken);
    }
  }, []);

  const login = (userData: any) => {
    const { serviceMan, token } = userData;
    setUser(serviceMan);
    setToken(token);
    localStorage.setItem('user', JSON.stringify(serviceMan));
    localStorage.setItem('token', token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};