import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, User, ClipboardList, LogOut } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/home', icon: Home, label: 'Home' },
    { path: '/my-tasks', icon: ClipboardList, label: 'My Tasks' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pb-16 md:pb-0">
      {/* Desktop Navigation */}
      <nav className="bg-gradient-to-r from-blue-600 to-purple-600 shadow-md relative hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <div className="flex flex-col">
                  <h1 className="text-xl font-bold text-white">QCTech</h1>
                  <p className="text-xs text-white opacity-90">SERVICEMAN</p>
                </div>
              </div>
              <div className="ml-6 flex space-x-8">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      className={`${
                        location.pathname === item.path
                          ? 'border-white text-white'
                          : 'border-transparent text-gray-100 hover:text-white hover:border-gray-200'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-100 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Header Bar */}
      <div className="md:hidden bg-gradient-to-r from-blue-600 to-purple-600 shadow-md p-4">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-white">QCTech</h1>
          <p className="text-xs text-white opacity-90">SERVICEMAN</p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg border-t border-blue-700 flex justify-between items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center py-2 flex-1 ${
                isActive ? 'text-white' : 'text-gray-200'
              }`}
            >
              <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-200'}`} />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center py-2 flex-1 text-gray-200 hover:text-white"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-xs mt-1">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Layout;