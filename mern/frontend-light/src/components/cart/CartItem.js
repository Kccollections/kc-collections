import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  
  const handleUpdateQuantity = (newQuantity) => {
    updateQuantity(item.id, newQuantity);
  };
  
  const handleRemove = () => {
    removeFromCart(item.id);
  };

  const price = item.salePrice || item.price;
  const totalPrice = price * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row border-b border-gray-200 py-4">
      <div className="sm:w-24 h-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 mb-3 sm:mb-0">
        <Link to={`/product/${item.id}`}>
          <img
            src={item.image}
            alt={item.name}
            className="h-full w-full object-cover object-center"
          />
        </Link>
      </div>

      <div className="flex flex-1 flex-col sm:ml-4">
        <div className="flex justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-900">
              <Link to={`/product/${item.id}`}>{item.name}</Link>
            </h3>
            {item.color && <p className="mt-1 text-sm text-gray-500">Color: {item.color}</p>}
            {item.size && <p className="mt-1 text-sm text-gray-500">Size: {item.size}</p>}
          </div>
          <p className="text-right font-medium text-gray-900">${totalPrice.toFixed(2)}</p>
        </div>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-gray-300 rounded-md">
            <button
              type="button"
              className="p-1 text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => handleUpdateQuantity(Math.max(1, item.quantity - 1))}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
              </svg>
            </button>
            <input
              type="text"
              className="w-10 border-0 text-center focus:outline-none focus:ring-0"
              value={item.quantity}
              readOnly
            />
            <button
              type="button"
              className="p-1 text-gray-600 hover:text-gray-900 focus:outline-none"
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <button
            type="button"
            className="text-sm font-medium text-purple-600 hover:text-purple-500"
            onClick={handleRemove}
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;