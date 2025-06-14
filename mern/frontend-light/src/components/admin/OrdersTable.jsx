import React from 'react';

const OrdersTable = ({ orders, getStatusColor, formatDate, viewOrderDetails, updateOrderStatus }) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <p className="text-gray-500">No orders found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="py-3 px-4 text-left font-medium text-gray-700">Order ID</th>
            <th className="py-3 px-4 text-left font-medium text-gray-700">Date</th>
            <th className="py-3 px-4 text-left font-medium text-gray-700">Customer</th>
            <th className="py-3 px-4 text-left font-medium text-gray-700">Total</th>
            <th className="py-3 px-4 text-left font-medium text-gray-700">Status</th>
            <th className="py-3 px-4 text-left font-medium text-gray-700">Payment</th>
            <th className="py-3 px-4 text-left font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {orders.map(order => (
            <tr key={order._id}>
              <td className="py-3 px-4 font-medium text-purple-700">{order._id}</td>
              <td className="py-3 px-4 text-gray-500">{formatDate(order.orderDate)}</td>
              <td className="py-3 px-4">
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-gray-500">{order.email}</p>
                </div>
              </td>
              <td className="py-3 px-4 font-medium">${parseFloat(order.total || 0).toFixed(2)}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                  {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                </span>
              </td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : 
                  order.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {order.paymentStatus ? order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1) : 'Pending'}
                </span>
              </td>
              <td className="py-3 px-4 space-x-2">
                <button 
                  onClick={() => viewOrderDetails(order)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  View
                </button>
                
                <div className="relative inline-block text-left mt-1">
                  <select 
                    value={order.status || 'pending'}
                    onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                    className="block w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;