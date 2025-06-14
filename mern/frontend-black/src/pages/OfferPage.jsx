import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { getAllOffers } from '../services/realApi';

const OfferPage = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState({ message: '', type: '' });

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        setLoading(true);
        const offersData = await getAllOffers();
        setOffers(offersData || []);
      } catch (err) {
        console.error('Error fetching offers:', err);
        setError('Failed to load offers. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOffers();
  }, []);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) {
      setSubscribeStatus({ message: 'Please enter an email address', type: 'error' });
      return;
    }

    try {
      // If you have a newsletter subscription API, call it here
      // For now, we'll just simulate a success
      setSubscribeStatus({ message: 'Thank you for subscribing!', type: 'success' });
      setEmail('');
    } catch (err) {
      setSubscribeStatus({ message: 'Failed to subscribe. Please try again later.', type: 'error' });
    }
  };

  // Format date from ISO to readable format
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Calculate discount percentage text
  const getDiscountText = (offer) => {
    if (!offer) return '';
    return `${offer.discountPercentage || 0}% OFF`;
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2 text-center">Special Offers</h1>
        <p className="text-gray-600 text-center mb-10">Discover our current promotions and discounts</p>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center p-8 bg-red-50 rounded-lg text-red-600">
            <p>{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md"
            >
              Try Again
            </button>
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">No Current Offers</h2>
            <p className="text-gray-600">Check back soon for upcoming promotions!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {offers.map((offer) => (
              <div key={offer._id || offer.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-2xl font-semibold">{offer.title}</h2>
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-bold">
                      {getDiscountText(offer)}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-4">{offer.description}</p>
                  
                  <div className="bg-gray-100 p-3 rounded-md mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 text-sm">Promo Code:</span>
                      <span className="font-mono font-bold text-lg">{offer.discountCode || 'NO_CODE_NEEDED'}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Valid until: {formatDate(offer.validUntil || offer.endDate)}</span>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 p-4">
                  <Link 
                    to="/shop" 
                    className="block w-full bg-primary text-white text-center py-2 rounded-md hover:bg-primary-dark transition duration-200"
                  >
                    Shop Now
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-16 bg-gray-100 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-semibold mb-2">Subscribe to Our Newsletter</h2>
          <p className="text-gray-700 mb-6">Stay updated on our latest offers and promotions</p>
          
          {subscribeStatus.message && (
            <div className={`mb-4 p-3 rounded ${subscribeStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {subscribeStatus.message}
            </div>
          )}
          
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto flex">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-4 py-2 rounded-l-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-r-md hover:bg-primary-dark transition duration-200"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default OfferPage;