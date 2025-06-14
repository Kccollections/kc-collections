import React, { useState, useEffect } from 'react';
import AdminLayout from '../../layouts/AdminLayout';
import { api } from '../../services/realApi';
import { toast } from 'react-toastify';

// Import the new components
import OrdersFilter from '../../components/admin/OrdersFilter';
import OrdersTable from '../../components/admin/OrdersTable';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Status options for filtering
  const statusOptions = [
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Fetch all orders from the real API
      const response = await api.admin.getAllOrders();
      
      // The response is an object with grouped orders, we'll use the 'all' property
      const ordersData = response.all || [];
      console.log('Orders data from API:', ordersData); // Debug log
      
      // Format orders for our component
      const formattedOrders = ordersData.map(order => ({
        _id: order._id,
        customerName: order.userId?.name || 'Guest User',
        email: order.userId?.email || 'N/A',
        phone: order.address?.mobile || 'N/A',
        orderDate: order.createdAt || new Date().toISOString(),
        rawDate: new Date(order.createdAt || new Date()),
        total: order.totalAmount,
        status: order.status || 'pending',
        paymentMethod: order.paymentMethod || 'N/A',
        paymentStatus: order.paymentStatus || 'pending',
        items: order.items.map(item => ({
          productId: item.productId?._id || item.productId,
          name: item.productId?.name || 'Product',
          price: item.productId?.price || 0,
          quantity: item.quantity,
          image: item.productId?.images?.[0] || ''
        })),
        shippingAddress: {
          street: order.address?.streetAddress || '',
          city: order.address?.city || '',
          state: order.address?.state || '',
          zip: order.address?.postalCode || '',
          country: order.address?.country || ''
        },
        trackingNumber: order.trackingId || '',
        trackingUrl: order.trackingUrl || '',
        shippingMethod: order.shippingMethod || 'Standard',
        shippingCost: order.shippingCost || 0,
        tax: order.tax || 0,
        subtotal: (order.totalAmount - (order.shippingCost || 0) - (order.tax || 0)) || 0,
        notes: order.notes || ''
      }));
      
      // Sort orders by date in descending order (newest first)
      const sortedOrders = formattedOrders.sort((a, b) => b.rawDate - a.rawDate);
      
      setOrders(sortedOrders);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`Attempting to update order ${orderId} to status: ${newStatus}`);
      
      // Call the real API to update the order status
      const response = await api.admin.updateOrderStatus(orderId, newStatus);
      console.log('API response:', response);
      
      // Update local state
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      // If the order is currently being viewed, update it as well
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(`Failed to update order status: ${error.message}`);
    }
  };

  // Get status color based on order status
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date to more readable format
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter orders based on status and search term
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status?.toLowerCase() === filterStatus;
    const matchesSearch = 
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Order Management</h1>

        <OrdersFilter 
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusOptions={statusOptions}
        />

        {/* Orders Table */}
        {loading ? (
          <LoadingSpinner message="Loading orders..." />
        ) : (
          <OrdersTable 
            orders={filteredOrders}
            getStatusColor={getStatusColor}
            formatDate={formatDate}
            viewOrderDetails={viewOrderDetails}
            updateOrderStatus={updateOrderStatus}
          />
        )}
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        showDetailsModal={showDetailsModal}
        setShowDetailsModal={setShowDetailsModal}
        selectedOrder={selectedOrder}
        formatDate={formatDate}
        getStatusColor={getStatusColor}
        updateOrderStatus={updateOrderStatus}
      />
    </AdminLayout>
  );
};

export default Orders;