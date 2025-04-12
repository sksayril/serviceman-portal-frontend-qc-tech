import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Search, Calendar, Info, MessageSquare, Image as ImageIcon, Eye, Filter } from 'lucide-react';

interface Task {
  _id: string;
  organizationName: string;
  productName: string;
  additionalInfo: string;
  remarks: string;
  images: string[];
  createdAt: string;
}

const MyTasks = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch('http://localhost:3100/admin/api/serviceman/my-tasks', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          const sortedTasks = data.tasks.sort((a: Task, b: Task) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setTasks(sortedTasks);
          setFilteredTasks(sortedTasks);
        } else {
          setError(data.message || 'Failed to fetch tasks');
        }
      } catch (err) {
        setError('Failed to connect to the server');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token]);

  // Filter tasks based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTasks(tasks);
    } else {
      const filtered = tasks.filter(task => 
        task.organizationName.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTasks(filtered);
    }
  }, [searchTerm, tasks]);

  // Handle sort order change
  const handleSortChange = (order: 'newest' | 'oldest') => {
    setSortOrder(order);
    const sorted = [...filteredTasks].sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return order === 'newest' ? dateB - dateA : dateA - dateB;
    });
    setFilteredTasks(sorted);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleString('en-US', options);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-white rounded-lg shadow-md p-8">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <p className="text-gray-600 font-medium">Loading your tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-md">
        <div className="flex items-center">
          <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
          </svg>
          <div>
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with title and search */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-white">My Tasks</h2>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by organization"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full sm:w-64 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
              />
              <Search className="absolute left-3 top-2.5 w-5 h-5 text-white text-opacity-70" />
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-white bg-opacity-20 border border-white border-opacity-30 rounded-lg">
              <Filter className="w-4 h-4 text-white" />
              <select 
                value={sortOrder}
                onChange={(e) => handleSortChange(e.target.value as 'newest' | 'oldest')}
                className="bg-transparent text-white focus:outline-none text-sm"
              >
                <option value="newest" className="text-gray-900">Newest first</option>
                <option value="oldest" className="text-gray-900">Oldest first</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Task count */}
      <div className="flex justify-between items-center px-2">
        <p className="text-gray-600">
          Showing <span className="font-semibold text-gray-900">{filteredTasks.length}</span> 
          {filteredTasks.length !== tasks.length && (
            <> out of <span className="font-semibold text-gray-900">{tasks.length}</span></>
          )} tasks
        </p>
        
        {searchTerm && (
          <button 
            onClick={() => setSearchTerm('')}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Clear search
          </button>
        )}
      </div>
      
      {/* Tasks list */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No tasks found</h3>
          <p className="text-gray-500">
            {searchTerm ? 
              `No tasks match your search for "${searchTerm}"` : 
              "You haven't submitted any tasks yet"}
          </p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredTasks.map((task) => (
            <div 
              key={task._id} 
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100 hover:border-blue-200"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-5">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{task.organizationName}</h3>
                    <div className="flex items-center text-gray-500 text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(task.createdAt)}
                    </div>
                  </div>
                  <span className="px-4 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {task.productName}
                  </span>
                </div>
                
                <div className="space-y-5">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <Info className="w-4 h-4 text-blue-600 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Additional Information</h4>
                    </div>
                    <p className="text-gray-700">{task.additionalInfo}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <MessageSquare className="w-4 h-4 text-blue-600 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">Remarks</h4>
                    </div>
                    <p className="text-gray-700">{task.remarks}</p>
                  </div>
                  
                  <div>
                    <div className="flex items-center mb-3">
                      <ImageIcon className="w-4 h-4 text-blue-600 mr-2" />
                      <h4 className="text-sm font-medium text-gray-700">
                        Images ({task.images.length})
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {task.images.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={image}
                            alt={`Task ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-md cursor-pointer"
                            onClick={() => setSelectedImage(image)}
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 flex items-center justify-center transition-all duration-300 rounded-lg">
                            <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300" />
                          </div>
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">
                            {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Image preview modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <button 
              className="absolute top-2 right-2 bg-black bg-opacity-60 text-white p-2 rounded-full hover:bg-opacity-80"
              onClick={() => setSelectedImage(null)}
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasks;