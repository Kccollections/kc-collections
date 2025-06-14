import React from 'react';
import Modal from '../ui/Modal';

const OrderDetailsModal = ({ 
  showDetailsModal, 
  setShowDetailsModal, 
  selectedOrder, 
  formatDate, 
  getStatusColor,
  updateOrderStatus 
}) => {
  if (!selectedOrder) return null;
  
  return (
    <Modal 
      isOpen={showDetailsModal} 
      onClose={() => setShowDetailsModal(false)} 
      title={`Order Details: ${selectedOrder._id}`}
    >
      <div className="space-y-6">
        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-medium mb-2">Customer Information</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p><span className="font-medium">Name:</span> {selectedOrder.customerName}</p>
            <p><span className="font-medium">Email:</span> {selectedOrder.email}</p>
            <p><span className="font-medium">Phone:</span> {selectedOrder.phone}</p>
          </div>
        </div>
        
        {/* Order Items */}
        <div>
          <h3 className="text-lg font-medium mb-2">Order Items</h3>
          <div className="bg-gray-50 rounded-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Item</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Price</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Quantity</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {selectedOrder.items.map((item, index) => (
                  <tr key={index}>
                    <td className="py-3 px-3">
                      <div className="flex items-center">
                        {item.image && (
                          <img 
                            src={item.image.includes('http') ? item.image : `/uploads/${item.image}`} 
                            alt={item.name} 
                            className="w-12 h-12 object-cover rounded mr-3"
                          />
                        )}
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3">${item.price?.toFixed(2)}</td>
                    <td className="py-3 px-3">{item.quantity}</td>
                    <td className="py-3 px-3">${(item.price * item.quantity)?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Order Totals */}
          <div className="mt-4 space-y-1">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>${selectedOrder.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping:</span>
              <span>${selectedOrder.shippingCost?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>${selectedOrder.tax?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium pt-2 border-t mt-2">
              <span>Total:</span>
              <span>${selectedOrder.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Shipping Information */}
        <div>
          <h3 className="text-lg font-medium mb-2">Shipping Information</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p>
              <span className="font-medium">Address:</span> {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} {selectedOrder.shippingAddress.zip}, {selectedOrder.shippingAddress.country}
            </p>
            <p><span className="font-medium">Shipping Method:</span> {selectedOrder.shippingMethod}</p>
            {selectedOrder.trackingNumber && (
              <p>
                <span className="font-medium">Tracking Number:</span> 
                {selectedOrder.trackingUrl ? (
                  <a href={selectedOrder.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                    {selectedOrder.trackingNumber}
                  </a>
                ) : (
                  <span className="ml-1">{selectedOrder.trackingNumber}</span>
                )}
              </p>
            )}
          </div>
        </div>
        
        {/* Payment Information */}
        <div>
          <h3 className="text-lg font-medium mb-2">Payment Information</h3>
          <div className="bg-gray-50 p-4 rounded-md">
            <p><span className="font-medium">Payment Method:</span> {selectedOrder.paymentMethod}</p>
            <p><span className="font-medium">Payment Status:</span> 
              <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {selectedOrder.paymentStatus.charAt(0).toUpperCase() + selectedOrder.paymentStatus.slice(1)}
              </span>
            </p>
          </div>
        </div>
        
        {/* Order Status */}
        <div>
          <h3 className="text-lg font-medium mb-2">Order Status</h3>
          <div className="bg-gray-50 p-4 rounded-md flex justify-between items-center">
            <div>
              <p>Current Status: 
                <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                  {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                </span>
              </p>
              <p className="text-sm text-gray-500 mt-1">Order Date: {formatDate(selectedOrder.orderDate)}</p>
            </div>
            
            <div>
              <select 
                value={selectedOrder.status}
                onChange={(e) => {
                  updateOrderStatus(selectedOrder._id, e.target.value);
                  // Update local modal state immediately for better user experience
                }}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        {selectedOrder.notes && (
          <div>
            <h3 className="text-lg font-medium mb-2">Notes</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p>{selectedOrder.notes}</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;