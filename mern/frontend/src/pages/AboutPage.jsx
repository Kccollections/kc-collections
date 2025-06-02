import React from 'react';
import MainLayout from '../layouts/MainLayout';

const AboutPage = () => {
  return (
    <MainLayout>
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">About KC Collection</h1>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Story</h2>
          <p className="text-gray-700 mb-4">
            Founded in 2010, KC Collection began as a small family-owned jewelry shop with a passion for craftsmanship and quality. 
            What started as a modest storefront has grown into a respected name in the jewelry industry, known for our unique designs 
            and commitment to excellence.
          </p>
          <p className="text-gray-700">
            Each piece in our collection tells a story and is crafted with the utmost attention to detail. We take pride in offering 
            jewelry that celebrates life's special moments and becomes a cherished part of our customers' lives.
          </p>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
          <p className="text-gray-700">
            At KC Collection, our mission is to create timeless jewelry that combines traditional craftsmanship with contemporary designs. 
            We believe in the value of quality materials, ethical sourcing, and creating pieces that can be treasured for generations to come.
          </p>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Values</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium mb-2">Quality</h3>
              <p className="text-gray-700">We use only the finest materials and maintain strict quality control throughout our manufacturing process.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium mb-2">Integrity</h3>
              <p className="text-gray-700">We are transparent in our business practices and committed to ethical sourcing of all our materials.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium mb-2">Innovation</h3>
              <p className="text-gray-700">We continuously explore new designs and techniques to create unique and meaningful pieces.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium mb-2">Customer Focus</h3>
              <p className="text-gray-700">We prioritize customer satisfaction and strive to provide an exceptional shopping experience.</p>
            </div>
          </div>
        </div>
        
        <div className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Our Team</h2>
          <p className="text-gray-700 mb-6">
            Our talented team of designers, craftspeople, and jewelry experts work together to bring our vision to life. With decades of 
            combined experience, our team is dedicated to creating exceptional jewelry that our customers will love.
          </p>
        </div>
      </div>
    </div>
    </MainLayout>
  );
};

export default AboutPage;