import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';
import { productsApi } from '../../services/realApi';

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce search function
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const performSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    try {
      // Use the existing productsApi.getWithFilters method
      const data = await productsApi.getWithFilters({
        search: searchTerm,
        limit: 5 // Only get 5 results for the dropdown
      });
      
      setSearchResults(data.products || []);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/product?search=${encodeURIComponent(searchTerm)}&page=1&limit=9&sort=featured`);
      setIsExpanded(false);
      setSearchTerm('');
    }
  };

  const handleResultClick = (productId) => {
    navigate(`/product/${productId}`);
    setIsExpanded(false);
    setSearchTerm('');
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setTimeout(() => document.getElementById('search-input')?.focus(), 100);
    }
  };

  return (
    <div ref={searchRef} className="relative hidden md:block">
      <form onSubmit={handleSubmit} className="flex items-center">
        <div className={`flex items-center transition-all duration-300 ${isExpanded ? 'w-64' : 'w-10'} bg-white border border-gray-200 rounded-full overflow-hidden`}>
          <button
            type="button"
            onClick={toggleExpand}
            className="flex-shrink-0 px-2 text-gray-500 hover:text-purple-600"
          >
            <FaSearch className="h-4 w-4" />
          </button>
          
          {isExpanded && (
            <input
              id="search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search products..."
              className="w-full py-2 pl-1 pr-3 text-sm text-gray-700 focus:outline-none"
            />
          )}
        </div>
      </form>

      {/* Search results dropdown */}
      {isExpanded && searchTerm.length >= 2 && (
        <div className="absolute z-50 w-64 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : searchResults.length > 0 ? (
            <ul>
              {searchResults.slice(0, 5).map((product) => (
                <li 
                  key={product._id} 
                  onClick={() => handleResultClick(product._id)}
                  className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                >
                  {product.images?.[0] && (
                    <img 
                      src={product.images[0]} 
                      alt={product.name} 
                      className="w-10 h-10 object-cover mr-2 rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                    <p className="text-xs text-gray-500">₹{product.price.toFixed(2)}</p>
                  </div>
                </li>
              ))}
              {searchResults.length > 5 && (
                <li className="p-2 text-center text-sm text-purple-600 hover:bg-gray-100 cursor-pointer" onClick={handleSubmit}>
                  See all {searchResults.length} results
                </li>
              )}
            </ul>
          ) : searchTerm.length >= 2 ? (
            <div className="p-4 text-center text-gray-500">No products found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;