const axios = require('axios');
const Order = require('../models/Order');

const SHIPROCKET_API_URL = process.env.USE_SANDBOX
    ? 'https://apiv2.shiprocket.in/v1/external/sandbox'
    : 'https://apiv2.shiprocket.in/v1/external';
const SHIPROCKET_EMAIL = process.env.SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = process.env.SHIPROCKET_PASSWORD;


const getAuthToken = async () => {
    try {
        const response = await axios.post(`${SHIPROCKET_API_URL}/auth/login`, {
            email: SHIPROCKET_EMAIL,
            password: SHIPROCKET_PASSWORD,
            
        });
        return response.data.token;
    } catch (error) {
        console.error('Error fetching Shiprocket auth token:', error.response?.data || error.message);
        throw new Error('Failed to fetch Shiprocket auth token');
    }
};

const getPickupLocations = async () => {
    try {
        const token = await getAuthToken();
        const response = await axios.get(`${SHIPROCKET_API_URL}/settings/company/pickup`, {
            headers: { Authorization: `Bearer ${token}` },
        });

        // console.log("🚀 Available Pickup Locations:", JSON.stringify(response.data, null, 2));

        return response.data.data?.shipping_address || []; // ✅ Extract pickup locations correctly
    } catch (error) {
        console.error('❌ Error fetching pickup locations:', error.response?.data || error.message);
        return [];
    }
};


const assignCourier = async (shipmentId) => {
    try {
        const token = await getAuthToken();
        const url = `${SHIPROCKET_API_URL}/courier/assign/awb`;

        const payload = {
            shipment_id: shipmentId,
            is_international: 0 // 1 for international shipments
        };

        const response = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (response.data && response.data.awb_code) {
            return response.data;
        } else {
            console.error('❌ Failed to assign courier:', response.data);
            return null;
        }
    } catch (error) {
        console.error('❌ Error assigning courier:', error.response?.data || error.message);
        return null;
    }
};




const formatPhoneNumber = (phone) => {
    console.log("phone",phone);

    if (!phone || phone.length < 10) return "9876543210"; // Provide a real-looking fallback number

    phone = phone.replace(/\D/g, ""); // Remove non-numeric characters

    // If Indian number (10 digits), return as is
    if (phone.length === 10) return phone;

    // If international, prepend '+' (E.164 format)
    if (phone.length > 10) return `+${phone}`;

    return "9876543210"; // Fallback if all else fails
};

const validCountries = [
    "India", "United States", "United Kingdom", "Canada", "Australia",
    "Germany", "France", "Italy", "Spain", "China", "Japan"
    // Add more as needed
];

const validateCountry = (country) => {
    if (!country || typeof country !== "string") return "India"; // Default to India
    const formattedCountry = country.trim();
    return validCountries.includes(formattedCountry) ? formattedCountry : "India";
};


const createShipment = async (orderId, shipmentDetails) => {
    try {
        const token = await getAuthToken();
        const url = `${SHIPROCKET_API_URL}/orders/create/adhoc`;

        if (!shipmentDetails.items || shipmentDetails.items.length === 0) {
            throw new Error("❌ No items found in shipmentDetails");
        }

        const seenSKUs = new Set();
        const orderItems = shipmentDetails.items.map((item, index) => {
            let sku = item.sku || `SKU-${item.id}`;
            while (seenSKUs.has(sku)) {
                sku = `${sku}-${index + 1}`; // Ensure uniqueness
            }
            seenSKUs.add(sku);

            return {
                name: item.name || `Product-${index + 1}`,
                sku: sku,
                units: item.quantity || 1,
                selling_price: item.selling_price || 0,
            };
        });

        // Get valid pickup locations
        const pickupLocations = await getPickupLocations();
        if (!pickupLocations || pickupLocations.length === 0) {
            throw new Error("❌ No valid pickup locations found!");
        }
        
        const validPickupLocation = pickupLocations.find(loc => loc.is_primary_location)?.pickup_location || pickupLocations[0].pickup_location;
        // console.log("✅ Using Pickup Location:", validPickupLocation);
        

        // const validPickupLocation = pickupLocations[0].pickup_location; // ✅ Use pickup location NAME
        const order = await Order.findOne({ _id: orderId });
                // console.log("order",order);

        const payload = {
            order_id: orderId,
            
            order_date: new Date().toISOString().split('T')[0],
            pickup_location: validPickupLocation, // ✅ Must be a string, e.g., "Primary"

            billing_customer_name: shipmentDetails.origin.name,
            billing_last_name: shipmentDetails.origin.last_name || "N/A",
            billing_phone: formatPhoneNumber(shipmentDetails.origin.phoneNumber),
            billing_address: shipmentDetails.origin.address,
            billing_city: shipmentDetails.origin.city,
            billing_pincode: shipmentDetails.origin.pin_code,
            billing_state: shipmentDetails.origin.state,
            billing_country: shipmentDetails.origin.country,

            shipping_customer_name: shipmentDetails.destination.name,
            shipping_address: shipmentDetails.destination.address,
            shipping_phone: formatPhoneNumber(shipmentDetails.destination.phoneNumber),
            shipping_city: shipmentDetails.destination.city,
            shipping_pincode: shipmentDetails.destination.pin_code,
            shipping_state: shipmentDetails.destination.state,
            shipping_country: validateCountry(shipmentDetails.destination.country),
            shipping_is_billing: false,

            order_items: orderItems, 
            payment_method: order.payment_method , // Use the same payment method as in the Order model

            sub_total: shipmentDetails.sub_total || 0,

            length: shipmentDetails.length || 10,
            breadth: shipmentDetails.breadth || 10,
            height: shipmentDetails.height || 10,
            weight: shipmentDetails.weight || 1,
        };

        // console.log('📨 Payload Sent to Shiprocket:', JSON.stringify(payload, null, 2));

        const response = await axios.post(url, payload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        console.error('❌ Error creating shipment:', error.response?.data || error.message);
        throw new Error('Failed to create shipment');
    }
};


module.exports = { createShipment,assignCourier};
