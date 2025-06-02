const Razorpay = require('razorpay');

const razorpay = new Razorpay({
    key_id: 'rzp_test_yIZJEB6YyYUQ90', // Replace with your Razorpay Key ID
    key_secret: 'dLpNb8cB36reDlMuNvq2igU8' // Replace with your Razorpay Secret Key
});

module.exports = razorpay;
