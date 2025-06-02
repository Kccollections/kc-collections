const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Address = require('../models/Address');
const Order = require('../models/Order');
const Offer = require('../models/Offers');
const Message = require('../models/contact');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const Review = require('../models/Review');
const Slider = require('../models/slider');
const Coupon = require('../models/Coupon');
const OrderTemp = require('../models/OrderTemp');
const connectDB = require('../../config/db');

// Demo users data
const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@kccollection.com',
    mobile: '+1234567890',
    password: 'admin123',
    role: 'admin'
  },
  {
    name: 'John Doe',
    email: 'john.doe@email.com',
    mobile: '+1234567891',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Jane Smith',
    email: 'jane.smith@email.com',
    mobile: '+1234567892',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Mike Johnson',
    email: 'mike.johnson@email.com',
    mobile: '+1234567893',
    password: 'password123',
    role: 'user'
  },
  {
    name: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    mobile: '+1234567894',
    password: 'password123',
    role: 'user'
  }
];

// Demo products data (matching your schema exactly)
const demoProducts = [
  {
    name: 'Diamond Solitaire Ring',
    category: 'Rings',
    price: 2500,
    startingPrice: 3000,
    sale: true,
    description: 'Elegant diamond solitaire ring crafted in 18k white gold with a brilliant cut diamond.',
    brand: 'KC Collection',
    stock: 15,
    material: 'Diamond',
    weight: 3.2,
    dimensions: 'Size 6-8 adjustable',
    rating: 4.8,
    color: 'White Gold',
    attentionLevel: 'High',
    images: ['1734766329754-663449468.jpeg', '1734766334203-326756582.jpeg']
  },
  {
    name: 'Pearl Drop Earrings',
    category: 'Earrings',
    price: 450,
    startingPrice: 550,
    sale: true,
    description: 'Classic pearl drop earrings with sterling silver hooks, perfect for formal occasions.',
    brand: 'KC Collection',
    stock: 25,
    material: 'Silver',
    weight: 4.1,
    dimensions: '2.5cm length',
    rating: 4.6,
    color: 'Silver',
    attentionLevel: 'Medium',
    images: ['1734766341169-572754043.jpeg', '1734766334203-326756582.jpeg']
  },
  {
    name: 'Gold Chain Necklace',
    category: 'Necklace',
    price: 1200,
    startingPrice: 1400,
    sale: true,
    description: 'Beautiful 14k gold chain necklace with delicate link design, perfect for layering.',
    brand: 'KC Collection',
    stock: 20,
    material: 'Gold',
    weight: 8.5,
    dimensions: '18 inches',
    rating: 4.7,
    color: 'Gold',
    attentionLevel: 'High',
    images: ['1734766329754-663449468.jpeg', '1734766334203-326756582.jpeg']
  },
  {
    name: 'Silver Tennis Bracelet',
    category: 'Bracelet',
    price: 350,
    startingPrice: 420,
    sale: true,
    description: 'Stunning silver tennis bracelet with cubic zirconia stones for everyday elegance.',
    brand: 'KC Collection',
    stock: 30,
    material: 'Silver',
    weight: 12.3,
    dimensions: '7-8 inches adjustable',
    rating: 4.5,
    color: 'Silver',
    attentionLevel: 'Medium',
    images: ['1734766341169-572754043.jpeg', '1734766329754-663449468.jpeg']
  },
  {
    name: 'Gemstone Pendant',
    category: 'Pendant',
    price: 320,
    startingPrice: 380,
    sale: false,
    description: 'Beautiful amethyst gemstone pendant in sterling silver setting.',
    brand: 'KC Collection',
    stock: 22,
    material: 'Gemstone',
    weight: 5.8,
    dimensions: '2cm x 1.5cm',
    rating: 4.4,
    color: 'Purple',
    attentionLevel: 'Medium',
    images: ['1734766334203-326756582.jpeg', '1734766341169-572754043.jpeg']
  },
  {
    name: 'Bridal Jewelry Set',
    category: 'Set',
    price: 4500,
    startingPrice: 5200,
    sale: true,
    description: 'Complete bridal jewelry set with necklace, earrings, and bracelet in gold.',
    brand: 'KC Collection',
    stock: 8,
    material: 'Gold',
    weight: 45.2,
    dimensions: 'Complete Set',
    rating: 4.9,
    color: 'Gold',
    attentionLevel: 'High',
    images: ['1734766329754-663449468.jpeg', '1734766334203-326756582.jpeg']
  },
  {
    name: 'Diamond Stud Earrings',
    category: 'Earrings',
    price: 1800,
    startingPrice: 2100,
    sale: true,
    description: 'Classic diamond stud earrings in 14k white gold, perfect for any occasion.',
    brand: 'KC Collection',
    stock: 10,
    material: 'Diamond',
    weight: 2.1,
    dimensions: '5mm diameter',
    rating: 4.9,
    color: 'White Gold',
    attentionLevel: 'High',
    images: ['1734766341169-572754043.jpeg', '1734766329754-663449468.jpeg']
  },
  {
    name: 'Platinum Band Ring',
    category: 'Rings',
    price: 2200,
    startingPrice: 2500,
    sale: false,
    description: 'Elegant platinum band ring with minimalist design for modern style.',
    brand: 'KC Collection',
    stock: 12,
    material: 'Platinum',
    weight: 4.5,
    dimensions: 'Size 6-9 adjustable',
    rating: 4.6,
    color: 'Platinum',
    attentionLevel: 'Low',
    images: ['1734766334203-326756582.jpeg', '1734766341169-572754043.jpeg']
  }
];

// Demo addresses data (matching your Address schema)
const demoAddresses = [
  {
    name: 'John Doe',
    mobile: '+1234567891',
    streetAddress: '123 Main Street, Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'USA',
    isDefault: true
  },
  {
    name: 'Jane Smith',
    mobile: '+1234567892',
    streetAddress: '456 Oak Avenue, Suite 12',
    city: 'Los Angeles',
    state: 'CA',
    postalCode: '90210',
    country: 'USA',
    isDefault: false
  },
  {
    name: 'Mike Johnson',
    mobile: '+1234567893',
    streetAddress: '789 Pine Road, Floor 3',
    city: 'Chicago',
    state: 'IL',
    postalCode: '60601',
    country: 'USA',
    isDefault: true
  },
  {
    name: 'Sarah Wilson',
    mobile: '+1234567894',
    streetAddress: '321 Elm Street, Unit 5A',
    city: 'Houston',
    state: 'TX',
    postalCode: '77001',
    country: 'USA',
    isDefault: true
  }
];

// Demo contact messages (matching your contact schema)
const demoMessages = [
  {
    name: 'Emma Thompson',
    email: 'emma@email.com',
    message: 'Hi, I\'m interested in your diamond collection. Do you offer custom sizing?'
  },
  {
    name: 'Robert Chen',
    email: 'robert.chen@email.com',
    message: 'What is your return policy for jewelry items? I want to purchase a gift.'
  },
  {
    name: 'Lisa Garcia',
    email: 'lisa.garcia@email.com',
    message: 'Do you have any gold necklaces in 16-inch length? I couldn\'t find the size on your website.'
  },
  {
    name: 'David Miller',
    email: 'david.miller@email.com',
    message: 'I received my order yesterday and I\'m very happy with the quality. Thank you!'
  },
  {
    name: 'Amanda Johnson',
    email: 'amanda.j@email.com',
    message: 'Are your pearls cultured or natural? I\'m looking for authentic pearl jewelry.'
  }
];

// Demo slider data
const demoSliders = [
  {
    img: '/uploads/1734766329754-663449468.jpeg',
    alt: 'Diamond Collection Banner',
    title: 'Exquisite Diamond Collection',
    description: 'Discover our stunning range of diamond jewelry crafted with precision and elegance.',
    link: '/products?category=Rings'
  },
  {
    img: '/uploads/1734766334203-326756582.jpeg',
    alt: 'Gold Jewelry Banner',
    title: 'Timeless Gold Jewelry',
    description: 'Explore our beautiful gold collection that never goes out of style.',
    link: '/products?category=Necklace'
  },
  {
    img: '/uploads/1734766341169-572754043.jpeg',
    alt: 'Bridal Collection Banner',
    title: 'Bridal Collection',
    description: 'Make your special day unforgettable with our exclusive bridal jewelry sets.',
    link: '/products?category=Set'
  }
];

// Demo coupons
const demoCoupons = [
  {
    code: 'WELCOME20',
    discountAmount: 20,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    code: 'SAVE15',
    discountAmount: 15,
    expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    isActive: true
  },
  {
    code: 'EXPIRED10',
    discountAmount: 10,
    expirationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    isActive: false
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('Connected to database for seeding...');

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Address.deleteMany({});
    await Order.deleteMany({});
    await Offer.deleteMany({});
    await Message.deleteMany({});
    await Cart.deleteMany({});
    await Wishlist.deleteMany({});
    await Review.deleteMany({});
    await Slider.deleteMany({});
    await Coupon.deleteMany({});
    await OrderTemp.deleteMany({});

    // Create users
    console.log('Creating demo users...');
    const hashedUsers = await Promise.all(
      demoUsers.map(async (user) => ({
        ...user,
        password: await bcrypt.hash(user.password, 10)
      }))
    );
    const createdUsers = await User.insertMany(hashedUsers);
    console.log(`✓ Created ${createdUsers.length} users`);

    // Create products
    console.log('Creating demo products...');
    const createdProducts = await Product.insertMany(demoProducts);
    console.log(`✓ Created ${createdProducts.length} products`);

    // Create addresses and link to users
    console.log('Creating demo addresses...');
    const addressesWithUsers = demoAddresses.map((address, index) => ({
      ...address,
      userId: createdUsers[index + 1]._id // Skip admin, assign to regular users
    }));
    const createdAddresses = await Address.insertMany(addressesWithUsers);
    console.log(`✓ Created ${createdAddresses.length} addresses`);

    // Create orders
    console.log('Creating demo orders...');
    const demoOrders = [
      {
        userId: createdUsers[1]._id,
        items: [
          { productId: createdProducts[0]._id, quantity: 1 },
          { productId: createdProducts[1]._id, quantity: 2 }
        ],
        address: createdAddresses[0]._id,
        totalAmount: 3400,
        paymentStatus: 'Paid',
        payment_method: 'ONLINE',
        paymentMode: 'Card',
        paymentIntentId: 'pi_demo_1234567890',
        shippingStatus: 'Delivered',
        deliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        shippingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        trackingId: 'TRK123456789'
      },
      {
        userId: createdUsers[2]._id,
        items: [
          { productId: createdProducts[2]._id, quantity: 1 },
          { productId: createdProducts[5]._id, quantity: 1 }
        ],
        address: createdAddresses[1]._id,
        totalAmount: 5700,
        paymentStatus: 'Paid',
        payment_method: 'ONLINE',
        paymentMode: 'UPI',
        paymentIntentId: 'pi_demo_1234567891',
        shippingStatus: 'Shipped',
        shippingDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        trackingId: 'TRK123456790'
      },
      {
        userId: createdUsers[3]._id,
        items: [
          { productId: createdProducts[3]._id, quantity: 1 },
          { productId: createdProducts[4]._id, quantity: 1 }
        ],
        address: createdAddresses[2]._id,
        totalAmount: 670,
        paymentStatus: 'Pending',
        payment_method: 'COD',
        shippingStatus: 'Pending'
      },
      {
        userId: createdUsers[4]._id,
        items: [
          { productId: createdProducts[6]._id, quantity: 1 }
        ],
        address: createdAddresses[3]._id,
        totalAmount: 1800,
        paymentStatus: 'Paid',
        payment_method: 'ONLINE',
        paymentMode: 'Net Banking',
        paymentIntentId: 'pi_demo_1234567892',
        shippingStatus: 'Pending'
      }
    ];
    const createdOrders = await Order.insertMany(demoOrders);
    console.log(`✓ Created ${createdOrders.length} orders`);

    // Create offers
    console.log('Creating demo offers...');
    const demoOffers = [
      {
        title: 'New Year Special - 20% Off',
        description: 'Get 20% off on all jewelry items. Limited time offer!',
        discountPercentage: 20,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid on all products. Cannot be combined with other offers.',
        isActive: true,
        applicableProducts: [createdProducts[0]._id, createdProducts[1]._id, createdProducts[2]._id]
      },
      {
        title: 'Valentine\'s Day Sale - 15% Off',
        description: 'Special discount for Valentine\'s Day on rings and necklaces.',
        discountPercentage: 15,
        validFrom: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        validUntil: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        termsAndConditions: 'Valid on rings and necklaces only. Minimum purchase of $500.',
        isActive: true,
        applicableProducts: [createdProducts[0]._id, createdProducts[2]._id]
      }
    ];
    const createdOffers = await Offer.insertMany(demoOffers);
    console.log(`✓ Created ${createdOffers.length} offers`);

    // Create contact messages
    console.log('Creating demo messages...');
    const createdMessages = await Message.insertMany(demoMessages);
    console.log(`✓ Created ${createdMessages.length} contact messages`);

    // Create cart items
    console.log('Creating demo cart items...');
    const demoCarts = [
      {
        userId: createdUsers[1]._id,
        items: [
          { productId: createdProducts[0]._id, quantity: 1 },
          { productId: createdProducts[3]._id, quantity: 2 }
        ]
      },
      {
        userId: createdUsers[2]._id,
        items: [
          { productId: createdProducts[4]._id, quantity: 1 }
        ]
      }
    ];
    const createdCarts = await Cart.insertMany(demoCarts);
    console.log(`✓ Created ${createdCarts.length} cart items`);

    // Create wishlist items
    console.log('Creating demo wishlist items...');
    const demoWishlists = [
      {
        userId: createdUsers[1]._id,
        items: [
          { productId: createdProducts[5]._id },
          { productId: createdProducts[6]._id }
        ]
      },
      {
        userId: createdUsers[3]._id,
        items: [
          { productId: createdProducts[0]._id },
          { productId: createdProducts[2]._id },
          { productId: createdProducts[7]._id }
        ]
      }
    ];
    const createdWishlists = await Wishlist.insertMany(demoWishlists);
    console.log(`✓ Created ${createdWishlists.length} wishlist items`);

    // Create reviews
    console.log('Creating demo reviews...');
    const demoReviews = [
      {
        userId: createdUsers[1]._id,
        productId: createdProducts[0]._id,
        rating: 5,
        comment: 'Absolutely stunning ring! The quality is exceptional and it arrived beautifully packaged.',
        imageUrl: '/uploads/1734766329754-663449468.jpeg'
      },
      {
        userId: createdUsers[2]._id,
        productId: createdProducts[1]._id,
        rating: 4,
        comment: 'Beautiful earrings, exactly as described. Fast shipping and great customer service.'
      },
      {
        userId: createdUsers[3]._id,
        productId: createdProducts[2]._id,
        rating: 5,
        comment: 'Perfect necklace for everyday wear. Great quality gold and very comfortable.'
      },
      {
        userId: createdUsers[4]._id,
        productId: createdProducts[3]._id,
        rating: 4,
        comment: 'Lovely bracelet, fits perfectly. Would definitely recommend to others.',
        imageUrl: '/uploads/1734766341169-572754043.jpeg'
      }
    ];
    const createdReviews = await Review.insertMany(demoReviews);
    console.log(`✓ Created ${createdReviews.length} reviews`);

    // Create slider items
    console.log('Creating demo slider items...');
    const createdSliders = await Slider.insertMany(demoSliders);
    console.log(`✓ Created ${createdSliders.length} slider items`);

    // Create coupons
    console.log('Creating demo coupons...');
    const createdCoupons = await Coupon.insertMany(demoCoupons);
    console.log(`✓ Created ${createdCoupons.length} coupons`);

    // Create order temp data
    console.log('Creating demo order temp data...');
    const demoOrderTemps = [
      {
        orderID: 'temp_order_123',
        items: [
          { productId: createdProducts[0]._id.toString(), quantity: 1 },
          { productId: createdProducts[1]._id.toString(), quantity: 1 }
        ],
        totalAmount: '2950'
      }
    ];
    const createdOrderTemps = await OrderTemp.insertMany(demoOrderTemps);
    console.log(`✓ Created ${createdOrderTemps.length} order temp items`);

    console.log('\n🎉 Demo data seeding completed successfully!');
    console.log('\nDemo Credentials:');
    console.log('Admin: admin@kccollection.com / admin123');
    console.log('Users: john.doe@email.com / password123 (and others)');
    console.log('\nData Summary:');
    console.log(`- ${createdUsers.length} Users`);
    console.log(`- ${createdProducts.length} Products`);
    console.log(`- ${createdAddresses.length} Addresses`);
    console.log(`- ${createdOrders.length} Orders`);
    console.log(`- ${createdOffers.length} Offers`);
    console.log(`- ${createdMessages.length} Contact Messages`);
    console.log(`- ${createdCarts.length} Cart Items`);
    console.log(`- ${createdWishlists.length} Wishlist Items`);
    console.log(`- ${createdReviews.length} Reviews`);
    console.log(`- ${createdSliders.length} Slider Items`);
    console.log(`- ${createdCoupons.length} Coupons`);
    console.log(`- ${createdOrderTemps.length} Order Temp Items`);
    
    mongoose.connection.close();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
