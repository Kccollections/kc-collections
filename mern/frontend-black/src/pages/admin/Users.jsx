import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import Modal from '../../components/ui/Modal';
import { api } from '../../services/realApi';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  // User form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    role: 'customer',
    password: '',
    confirmPassword: ''
  });

  const roles = [
    { value: 'all', label: 'All Users' },
    { value: 'admin', label: 'Administrators' },
    { value: 'customer', label: 'Customers' }
  ];

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch users from the API
      const data = await api.admin.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Password validation for new users
    if (!selectedUser && formData.password !== formData.confirmPassword) {
      toast.error("Passwords don't match!");
      return;
    }

    try {
      if (selectedUser) {
        // Update existing user
        await api.admin.updateUserRole(selectedUser._id, formData.role);
        
        // Update local state
        setUsers(users.map(user => 
          user._id === selectedUser._id 
            ? { 
                ...user, 
                name: formData.name,
                email: formData.email,
                mobile: formData.mobile || '',
                role: formData.role
              } 
            : user
        ));
        
        toast.success('User updated successfully');
      } else {
        // Create new user - this would typically be handled by a different API endpoint
        // For now, we'll simulate it with a mock implementation
        toast.info('New user creation would be implemented with a real API endpoint');
        
        // Simulate new user creation for UI demonstration
        const newUser = {
          _id: `USR${Math.floor(1000 + Math.random() * 9000)}`,
          name: formData.name,
          email: formData.email,
          mobile: formData.mobile || '',
          role: formData.role,
          createdAt: new Date().toISOString(),
          lastLogin: null,
          status: 'active',
          orders: 0
        };

        // Update local state
        setUsers([...users, newUser]);
      }
      
      // Close modal and reset form
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(`Failed to save user: ${error.message}`);
    }
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      mobile: user.mobile || '',
      role: user.role,
      password: '',
      confirmPassword: ''
    });
    setShowModal(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        // Call API to delete user
        await api.admin.deleteUser(userId);

        // Update local state
        setUsers(users.filter(user => user._id !== userId));
        toast.success('User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(`Failed to delete user: ${error.message}`);
      }
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      // In a production app, this would be an API call
      // For now, we'll just update the local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, status: newStatus } : user
      ));
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error(`Failed to update user status: ${error.message}`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      mobile: '',
      role: 'customer',
      password: '',
      confirmPassword: ''
    });
    setSelectedUser(null);
  };

  // Format date to more readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Filter users based on role and search term
  const filteredUsers = users.filter(user => {
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.mobile && user.mobile.includes(searchTerm));
    return matchesRole && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <button 
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
          >
            Add New User
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Role Filter */}
          <div className="md:w-1/3">
            <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Role
            </label>
            <select
              id="roleFilter"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
          
          {/* Search */}
          <div className="md:w-2/3">
            <label htmlFor="searchUsers" className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <input
              id="searchUsers"
              type="text"
              placeholder="Search by name, email or phone"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            {filteredUsers.length > 0 ? (
              <table className="min-w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Name</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Email</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Role</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Status</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Joined</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Last Login</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Orders</th>
                    <th className="py-3 px-4 text-left font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUsers.map(user => (
                    <tr key={user._id}>
                      <td className="py-3 px-4 font-medium">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                          {user.status?.charAt(0).toUpperCase() + user.status?.slice(1) || 'Active'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{formatDate(user.lastLogin)}</td>
                      <td className="py-3 px-4 text-center">{user.orders || 0}</td>
                      <td className="py-3 px-4 space-x-2">
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          Edit
                        </button>
                        
                        {user.role !== 'admin' && (
                          <button 
                            onClick={() => handleDeleteUser(user._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        )}
                        
                        <div className="relative inline-block text-left mt-1">
                          <select 
                            value={user.status || 'active'}
                            onChange={(e) => handleUpdateStatus(user._id, e.target.value)}
                            className="block w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No users found</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* User Form Modal */}
      <Modal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        title={selectedUser ? "Edit User" : "Add New User"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>
          
          {/* Phone */}
          <div>
            <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              id="mobile"
              type="text"
              name="mobile"
              value={formData.mobile}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          
          {/* Role */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="customer">Customer</option>
              <option value="admin">Administrator</option>
            </select>
          </div>
          
          {/* Password - only required for new users */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              {selectedUser ? "New Password (leave blank to keep current)" : "Password"}
            </label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required={!selectedUser}
            />
          </div>
          
          {/* Confirm Password - only required for new users */}
          {(!selectedUser || formData.password) && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                required={!selectedUser || formData.password.length > 0}
              />
            </div>
          )}
          
          <div className="flex justify-end pt-4 space-x-3">
            <button 
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="px-4 py-2 bg-primary border-2 border-black rounded-md hover:bg-primary-dark"
            >
              {selectedUser ? "Update User" : "Add User"}
            </button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
};

export default Users;