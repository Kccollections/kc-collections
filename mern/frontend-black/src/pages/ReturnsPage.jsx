import React from 'react';

const ReturnsPage = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Returns & Exchanges</h1>
      
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Our Policy</h2>
          <p className="text-gray-700 mb-4">
            At KC Collection, we want you to be completely satisfied with your purchase. If for any reason you are 
            not satisfied, we offer returns and exchanges within 30 days of purchase, subject to the following conditions.
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Return Conditions</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700">
            <li>Items must be returned in their original condition and packaging</li>
            <li>Products must be unworn and unaltered</li>
            <li>All tags and certificates must be attached</li>
            <li>A valid receipt or proof of purchase is required</li>
            <li>Custom-designed or personalized items cannot be returned unless defective</li>
            <li>Sale items are final sale and cannot be returned or exchanged</li>
          </ul>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">How to Return an Item</h2>
          <ol className="list-decimal pl-6 space-y-4 text-gray-700">
            <li>
              <p className="font-medium">Contact Customer Service</p>
              <p>Please contact our customer service team at returns@kccollection.com or call us at +1 (555) 123-4567 to initiate your return.</p>
            </li>
            <li>
              <p className="font-medium">Complete the Return Form</p>
              <p>Fill out the return form that was included with your order or download it from our website.</p>
            </li>
            <li>
              <p className="font-medium">Pack Your Items</p>
              <p>Carefully pack the items in their original packaging along with the completed return form.</p>
            </li>
            <li>
              <p className="font-medium">Ship Your Return</p>
              <p>Use the prepaid shipping label provided by our customer service team or send your return to:</p>
              <p className="mt-2 ml-4">
                KC Collection Returns<br />
                123 Jewelry Lane<br />
                Gem City, GC 12345
              </p>
            </li>
          </ol>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Refund Process</h2>
          <p className="text-gray-700 mb-4">
            Once we receive your return, our team will inspect the item(s) to ensure they meet our return conditions. 
            Refunds will be issued to the original payment method within 5-7 business days after inspection.
          </p>
          <p className="text-gray-700">
            Please note that shipping charges are non-refundable unless the return is due to our error or a defective product.
          </p>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Exchanges</h2>
          <p className="text-gray-700">
            If you would like to exchange an item for a different size or color, please indicate this on your return form. 
            If the exchange item is unavailable, a store credit or refund will be issued.
          </p>
        </div>
        
        <div className="p-4 bg-gray-100 rounded-md">
          <h3 className="text-lg font-medium mb-2">Questions?</h3>
          <p className="text-gray-700">
            If you have any questions about our return policy, please contact our customer service team 
            at returns@kccollection.com or call +1 (555) 123-4567.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReturnsPage;