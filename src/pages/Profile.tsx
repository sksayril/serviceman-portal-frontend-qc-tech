import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, Phone, MapPin, CreditCard, Edit, Shield, Building, Calendar } from 'lucide-react';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header Section with Background */}
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-36 sm:h-48">
              <div className="absolute top-0 right-0 p-4">
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition duration-300 shadow-lg text-sm sm:text-base"
                >
                  <LogOut className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                  Logout
                </button>
              </div>
            </div>
            
            {/* Profile Image Overlay - Centered on mobile */}
            <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 sm:left-10 sm:translate-x-0">
              <div className="rounded-full border-4 border-white shadow-xl">
                {user.ImageUrl ? (
                  <img
                    src={user.ImageUrl}
                    alt={user.ServiceManName}
                    className="w-28 h-28 sm:w-32 sm:h-32 object-cover rounded-full"
                  />
                ) : (
                  <div className="w-28 h-28 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-14 h-14 sm:w-16 sm:h-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="pt-20 pb-8 px-4 sm:px-6 md:px-10">
            {/* User Name and Edit Button - Stacked on mobile */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 sm:mb-8 text-center sm:text-left">
              <div className="mb-4 sm:mb-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{user.ServiceManName}</h1>
                <div className="flex items-center justify-center sm:justify-start mt-1">
                  <Shield className="w-4 h-4 text-blue-600 mr-2" />
                  <span className="text-blue-600 font-medium text-sm sm:text-base">Service ID: {user.ServiceManId}</span>
                </div>
              </div>
              <button className="flex items-center justify-center sm:justify-start px-4 py-2 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition duration-200 w-full sm:w-auto">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </button>
            </div>

            {/* Details Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Personal Information Card */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 sm:p-6 shadow-sm border border-blue-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Personal Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-500">Email Address</h3>
                    </div>
                    <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base break-all">{user.Email}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <Phone className="w-4 h-4 text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                    </div>
                    <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base">{user.ContactNumber}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center">
                      <CreditCard className="w-4 h-4 text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-500">Aadhaar Number</h3>
                    </div>
                    <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base">
                      {user.AadhaarNumber ? 
                        `XXXX-XXXX-${user.AadhaarNumber.substring(user.AadhaarNumber.length - 4)}` : 
                        "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Work Information Card */}
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-5 sm:p-6 shadow-sm border border-green-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2 text-green-600" />
                  Work Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center">
                      <Building className="w-4 h-4 text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-500">Branch</h3>
                    </div>
                    <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base">{user.BranchName}</p>
                  </div>
                  
                  {/* Added Service ID display in Work Information card for better visibility on mobile */}
                  <div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 text-gray-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-500">Service ID</h3>
                    </div>
                    <p className="text-gray-900 font-medium mt-1 text-sm sm:text-base break-all">{user.ServiceManId}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;