import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (change) => {
    const newQuantity = Math.max(1, item.quantity + change);
    updateQuantity(item.id, newQuantity);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center py-3 border-b border-gray-200">
      <div className="flex-shrink-0 w-full sm:w-auto flex items-center mb-4 sm:mb-0">
        <Link to={`/product/${item.id}`}>
          <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
            <img 
              src={item.image} 
              alt={item.name} 
              className="h-full w-full object-cover object-center"
            />
          </div>
        </Link>
        <div className="ml-4 flex-1">
          <h3 className="text-base font-medium text-gray-900">
            <Link to={`/product/${item.id}`} className="hover:text-purple-700">
              {item.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-gray-500">${item.price.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="flex items-center justify-between sm:ml-auto sm:w-1/3">
        <div className="flex items-center border border-gray-300 rounded-md">
          <button 
            onClick={() => handleQuantityChange(-1)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="px-3 py-1 border-x border-gray-300 min-w-[40px] text-center">
            {item.quantity}
          </span>
          <button 
            onClick={() => handleQuantityChange(1)}
            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
        
        <div className="ml-4 flex flex-col items-end">
          <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
          <button 
            onClick={() => removeItem(item.id)}
            className="text-sm text-red-500 hover:text-red-700 mt-1"
            aria-label="Remove item"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;