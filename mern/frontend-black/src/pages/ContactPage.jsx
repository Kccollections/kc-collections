import React from 'react';
import MainLayout from '../layouts/MainLayout';

const ContactPage = () => {
  return (
    <MainLayout>
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Contact Us</h1>
      
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <form className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter subject"
            />
          </div>
          
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              rows="5"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Type your message here..."
            ></textarea>
          </div>
          
          <button
            type="submit"
            className="w-full bg-green-800 py-2 px-4 text-white font-medium rounded-md hover:bg-primary-dark transition-colors"
          >
            Send Message
          </button>
        </form>
        
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4">Get in Touch</h3>
          <div className="space-y-3">
            <p>
              <span className="font-medium">Address:</span> 123 Jewelry Lane, Gem City, GC 12345
            </p>
            <p>
              <span className="font-medium">Phone:</span> +1 (555) 123-4567
            </p>
            <p>
              <span className="font-medium">Email:</span> contact@kccollection.com
            </p>
            <p>
              <span className="font-medium">Working Hours:</span> Monday - Saturday: 10 AM - 8 PM
            </p>
          </div>
        </div>
      </div>
    </div>
    </MainLayout>
  );
};

export default ContactPage;