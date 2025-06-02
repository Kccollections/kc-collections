import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [authMethod, setAuthMethod] = useState('password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  const { login, loginWithOtp, sendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check if the user was redirected from another page
  const from = location.state?.from?.pathname || '/';
  
  const handleAuthMethodChange = (e) => {
    setAuthMethod(e.target.value);
  };

  const handleSendOtp = async () => {
    // Validation functions
    const isPhoneNumber = (input) => /^[0-9]{10}$/.test(input);
    const isEmail = (input) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);

    if (!identifier) {
      toast.error('Please enter your email or mobile number.');
      return;
    }

    if (isEmail(identifier)) {
      toast.error('Please enter a valid phone number to receive an OTP.');
      return;
    }

    if (!isPhoneNumber(identifier)) {
      toast.error('Please enter a valid 10-digit phone number.');
      return;
    }

    // If valid phone number, proceed with sending OTP
    try {
      setLoading(true);
      const success = await sendOtp(identifier);
      if (!success) {
        toast.error('Failed to send OTP. Please try again.');
      }
    } catch (error) {
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      let success;
      if (authMethod === 'password') {
        success = await login(identifier, password);
      } else {
        success = await loginWithOtp(identifier, otp);
      }
      
      if (success) {
        navigate(from, { replace: true });
      } else {
        setError('Failed to log in. Please check your credentials.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="identifier" className="block text-gray-700 text-sm font-medium mb-1">
                  Email address or Mobile number *
                </label>
                <input
                  type="text"
                  id="identifier"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter your email or mobile number"
                  required
                />
              </div>
              
              <div className="mb-4">
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="authMethod"
                      value="password"
                      checked={authMethod === 'password'}
                      onChange={handleAuthMethodChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-2 block text-sm text-gray-700">
                      Login with Password
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="authMethod"
                      value="otp"
                      checked={authMethod === 'otp'}
                      onChange={handleAuthMethodChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                    />
                    <span className="ml-2 block text-sm text-gray-700">
                      Login with OTP
                    </span>
                  </label>
                </div>
              </div>
              
              {authMethod === 'password' ? (
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-1">
                      Password *
                    </label>
                  </div>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter your password"
                    required={authMethod === 'password'}
                  />
                </div>
              ) : (
                <div className="mb-4">
                  <label htmlFor="otp" className="block text-gray-700 text-sm font-medium mb-1">
                    OTP *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Enter your OTP"
                      required={authMethod === 'otp'}
                    />
                    <Button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={loading}
                      variant="outline"
                      className="whitespace-nowrap"
                    >
                      Send OTP
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </span>
                </label>
              </div>
              
              <div className="flex space-x-4">
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
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="text-center mt-6">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <Link to="/register" className="text-purple-600 hover:text-purple-800 font-medium">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default LoginPage;