import { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { api } from '../config/apiConfig';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Check if user is logged in from localStorage
    const storedUser = localStorage.getItem('user');
    const storedToken = localStorage.getItem('token');
    
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    if (storedToken) {
      setToken(storedToken);
    }
    
    setLoading(false);
  }, []);

  const login = async (identifier, password) => {
    try {
      // Use the API service for login
      const response = await api.auth.login(identifier, password);
      
      if (!response.success) {
        toast.error(response.message || 'Login failed');
        return false;
      }
      
      setUser(response.user);
      setToken(response.token);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      
      toast.success('Login successful');
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'An error occurred during login');
      return false;
    }
  };

  const loginWithOtp = async (identifier, otp) => {
    try {
      // Call the API for OTP-based login
      const response = await api.auth.loginWithOtp(identifier, otp);
      
      if (!response.success) {
        toast.error(response.message || 'OTP verification failed');
        return false;
      }
      
      setUser(response.user);
      setToken(response.token);
      
      // Store in localStorage
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      
      toast.success('Login successful');
      return true;
    } catch (error) {
      console.error('OTP login error:', error);
      toast.error(error.message || 'An error occurred during OTP verification');
      return false;
    }
  };

  const sendOtp = async (identifier) => {
    try {
      const response = await api.auth.sendOtp(identifier);
      
      if (!response.success) {
        toast.error(response.message || 'Failed to send OTP');
        return false;
      }
      
      toast.success(response.message || 'OTP sent successfully!');
      return true;
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
      return false;
    }
  };

  const register = async (userData) => {
    try {
      // Use the API service to register the user
      const response = await api.auth.register(userData);
      
      if (!response.success) {
        toast.error(response.message || 'Registration failed');
        return false;
      }
      
      // Don't set the user in state - user needs to login after registration
      toast.success(response.message || 'Registration successful. Please log in.');
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error(error.message || 'An error occurred during registration');
      return false;
    }
  };

  const logout = () => {
    // Call the API logout if needed (for server-side logout)
    try {
      api.auth.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    // Clear local storage and state
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out successfully');
  };

  const isAdmin = () => {
    return user && user.role === 'admin';
  };

  const getUserProfile = async () => {
    if (!user) return null;
    
    try {
      const userProfile = await api.auth.getUserProfile(user.id);
      return userProfile;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    loginWithOtp,
    sendOtp,
    register,
    logout,
    isAdmin,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};