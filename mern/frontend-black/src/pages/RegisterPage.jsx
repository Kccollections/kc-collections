import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { api } from '../config/apiConfig';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };
  
  const validateForm = () => {
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    // Validate password strength
    const passwordRegex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;
    if (!passwordRegex.test(formData.password)) {
      setError('Password must be at least 8 characters long and include one uppercase letter, one lowercase letter, and one number');
      return false;
    }
    
    // Validate mobile number (10 digits)
    const mobileRegex = /^[0-9]{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      setError('Please enter a valid 10-digit mobile number');
      return false;
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Form validation
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Extract first and last name from full name
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const userData = {
        name: formData.name,
        firstName,
        lastName,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password
      };
      
      // Use the configured API service to register the user
      const success = await register(userData);
      
      if (success) {
        toast.success('Registration successful!');
        navigate('/login');
      } else {
        setError('Failed to create an account. Please try again.');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Failed to create an account. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="name" className="block text-gray-700 text-sm font-medium mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your email address"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="mobile" className="block text-gray-700 text-sm font-medium mb-1">
                  Mobile *
                </label>
                <input
                  type="tel"
                  id="mobile"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your mobile number"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">10-digit mobile number</p>
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your password"
                  required
                />
                <p className="mt-1 text-xs text-gray-500">
                  Password must be at least 8 characters long, and include one uppercase letter, one lowercase letter, and one number.
                </p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Re-enter your password"
                  required
                />
              </div>
              
              <Button
                type="submit"
                fullWidth
                disabled={loading}
                className={loading ? "flex justify-center items-center" : ""}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
              
              <div className="mt-4 text-sm text-gray-600">
                <p className="privacy-policy">
                  A link to set a new password will be sent to your email address. Your personal data will be used to support your
                  experience throughout this website, to manage access to your account, and for other purposes described in our{" "}
                  <Link to="/privacy" className="text-purple-600 hover:text-purple-800">
                    privacy policy
                  </Link>.
                </p>
              </div>
            </form>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Already have an account?{" "}
              <Link to="/login" className="text-purple-600 hover:text-purple-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegisterPage;