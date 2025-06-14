import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import api from '../../services/realApi';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    expenses: 0,
    totalOrders: 0,
    newInvoices: 0,
    salesData: [],
    labels: [],
    categories: [],
    orderCounts: [],
    salesDataWeekly: [],
    labelsWeekly: [],
    products: {
      lowStock: 0,
      outOfStock: 0,
      lowStockItems: [],
      outOfStockItems: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  
  // Redirect if not logged in or not an admin
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" state={{ from: { pathname: '/admin/dashboard' } }} replace />;
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch dashboard data
        const data = await api.admin.getDashboard();
        
        // Helper function to parse JSON safely or return the original value if it's already an object
        const safeJSONParse = (value, defaultValue = []) => {
          if (!value) return defaultValue;
          if (typeof value === 'object') return value;
          try {
            return JSON.parse(value);
          } catch (err) {
            console.warn(`Error parsing JSON: ${err.message}`);
            return defaultValue;
          }
        };
        
        // Parse JSON strings back to arrays/objects
        const parsedData = {
          ...data,
          salesData: safeJSONParse(data.salesData, []),
          labels: safeJSONParse(data.labels, []),
          categories: safeJSONParse(data.categories, []),
          orderCounts: safeJSONParse(data.orderCounts, []),
          salesDataWeekly: safeJSONParse(data.salesDataWeekly, []),
          labelsWeekly: safeJSONParse(data.labelsWeekly, []),
          products: {
            ...data.products,
            lowStockItems: data.products.lowStockItems || [],
            outOfStockItems: data.products.outOfStockItems || []
          }
        };
        
        setDashboardData(parsedData);
        
        // Fetch recent orders
        const ordersResponse = await api.admin.getAllOrders();
        // Get the most recent 5 orders
        const sortedOrders = ordersResponse.all.sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        ).slice(0, 5);
        
        // Transform orders into the format needed for display
        const formattedRecentOrders = sortedOrders.map(order => ({
          id: order._id,
          customer: order.userId?.name || 'Unknown Customer',
          date: order.createdAt,
          status: order.status,
          total: order.totalAmount
        }));
        
        setRecentOrders(formattedRecentOrders);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load dashboard data");
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
      case 'Delivered':
        return 'bg-green-100 text-green-800';
      case 'Processing':
      case 'Shipped':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  if (loading) {
    return (
      <MainLayout>
        <AdminLayout>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
              <p className="mt-3 text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        </AdminLayout>
      </MainLayout>
    );
  }
  
  if (error) {
    return (
      <MainLayout>
        <AdminLayout>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="text-red-600 text-xl mb-2">Error</div>
              <p className="text-gray-600">{error}</p>
              <button 
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </AdminLayout>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6">Dashboard</h1>
        
        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Orders Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Orders</p>
                <p className="text-2xl font-bold">{dashboardData.totalOrders}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Pending</span>
                <span className="font-medium">{dashboardData.newInvoices}</span>
              </div>
            </div>
          </div>
          
          {/* Revenue Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
                <p className="text-2xl font-bold">${dashboardData.totalSales?.toLocaleString() || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
              </div>
              <div className="text-xs text-gray-500 mt-1">Expenses: ${dashboardData.expenses?.toLocaleString() || 0}</div>
            </div>
          </div>
          
          {/* Weekly Sales Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Weekly Sales</p>
                <p className="text-2xl font-bold">
                  ${dashboardData.salesDataWeekly?.reduce((acc, val) => acc + val, 0)?.toLocaleString() || 0}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">Last 7 days</div>
              <div className="flex justify-between mt-1">
                {dashboardData.labelsWeekly?.map((day, index) => (
                  <div key={day} className="text-center">
                    <div className="text-xs text-gray-500">{day}</div>
                    <div className="h-10 flex items-end justify-center">
                      <div 
                        className="w-4 bg-blue-500 rounded-t"
                        style={{ 
                          height: `${Math.max(5, (dashboardData.salesDataWeekly[index] / Math.max(...dashboardData.salesDataWeekly) * 40) || 5)}px` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Order Categories Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-gray-500 text-sm font-medium">Categories</p>
                <p className="text-2xl font-bold">{dashboardData.categories?.length || 0}</p>
              </div>
            </div>
            <div className="mt-4">
              <div className="space-y-2">
                {dashboardData.categories?.slice(0, 3).map((category, index) => (
                  <div key={category} className="flex justify-between text-sm">
                    <span className="text-gray-500">{category}</span>
                    <span className="font-medium">{dashboardData.orderCounts?.[index] || 0} orders</span>
                  </div>
                ))}
                {dashboardData.categories?.length > 3 && (
                  <div className="text-xs text-center text-blue-600">
                    +{dashboardData.categories.length - 3} more categories
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white shadow-md rounded-lg mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentOrders.length > 0 ? recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">#{order.id.substring(0, 8)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{order.customer}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${order.total?.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a href={`/admin/orders/${order.id}`} className="text-purple-600 hover:text-purple-900">
                        View
                      </a>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      No recent orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200 text-right">
            <a href="/admin/orders" className="text-sm font-medium text-purple-600 hover:text-purple-900">
              View All Orders →
            </a>
          </div>
        </div>
        
        {/* Monthly Sales Chart */}
        <div className="bg-white shadow-md rounded-lg mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Sales</h3>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-end space-x-2">
              {dashboardData.labels?.map((month, index) => (
                <div key={month} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-purple-500 rounded-t"
                    style={{ 
                      height: `${Math.max(8, (dashboardData.salesData[index] / Math.max(...dashboardData.salesData) * 200) || 8)}px` 
                    }}
                  ></div>
                  <div className="text-xs text-gray-500 mt-2">{month}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div className="bg-white shadow-md rounded-lg">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Inventory Alerts</h3>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <h4 className="font-medium text-gray-700 mb-2">Low Stock Items ({dashboardData.products.lowStock})</h4>
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-700">
                      {dashboardData.products.lowStock} items are running low on stock. <a href="/admin/products" className="font-medium underline text-yellow-700 hover:text-yellow-600">Review inventory</a>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Low Stock Products List */}
              {dashboardData.products.lowStockItems && dashboardData.products.lowStockItems.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-md border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.products.lowStockItems.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            #{product._id.substring(0, 8)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            ${product.price}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <a href={`/admin/product/${product._id}`} className="text-purple-600 hover:text-purple-900">
                              Update
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Out of Stock Items ({dashboardData.products.outOfStock})</h4>
              <div className="bg-red-50 border-l-4 border-red-400 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">
                      {dashboardData.products.outOfStock} items are out of stock. <a href="/admin/products" className="font-medium underline text-red-700 hover:text-red-600">Manage inventory</a>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Out of Stock Products List */}
              {dashboardData.products.outOfStockItems && dashboardData.products.outOfStockItems.length > 0 && (
                <div className="mt-3 overflow-hidden rounded-md border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.products.outOfStockItems.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            #{product._id.substring(0, 8)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                            {product.name}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            ${product.price}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <a href={`/admin/product/${product._id}`} className="text-purple-600 hover:text-purple-900">
                              Restock
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
    </MainLayout>
  );
};

export default AdminDashboard;