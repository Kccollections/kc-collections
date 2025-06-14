import React from 'react';

const OrdersFilter = ({ filterStatus, setFilterStatus, searchTerm, setSearchTerm, statusOptions }) => {
  return (
    <div className="mb-6 flex flex-col md:flex-row justify-between gap-4">
      {/* Status Filter */}
      <div className="md:w-1/3">
        <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700 mb-1">
          Filter by Status
        </label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      {/* Search */}
      <div className="md:w-2/3">
        <label htmlFor="searchOrders" className="block text-sm font-medium text-gray-700 mb-1">
          Search Orders
        </label>
        <div className="relative">
          <input
            id="searchOrders"
            type="text"
            placeholder="Search by order ID, customer name, or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrdersFilter;