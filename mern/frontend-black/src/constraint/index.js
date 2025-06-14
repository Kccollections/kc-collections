// KC Collection Mock Backend
// This file serves as a mock backend for the KC Collection website
// It provides mock data for products, users, orders, addresses, wishlists, etc.

// -------------------------------
// PRODUCTS DATA
// -------------------------------
const products = [
  {
    id: 'prod-001',
    name: 'Diamond Pendant Necklace',
    category: 'Necklace',
    price: 499.99,
    startingPrice: 599.99,
    sale: false,
    rating: 5,
    reviewCount: 24,
    description: 'This elegant diamond pendant necklace features a stunning 0.5-carat diamond set in 18k white gold. The pendant hangs from a delicate 18-inch chain, making it perfect for both everyday wear and special occasions.',
    brand: 'KC Collection',
    features: [
      '0.5-carat brilliant-cut diamond',
      '18k white gold setting',
      '18-inch adjustable chain',
      'Secure lobster clasp',
      'Comes in a luxury gift box'
    ],
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    ],
    stock: 15,
    material: 'Gold',
    dimensions: '18 inches (chain) / 0.5 inches (pendant)',
    weight: 3.5,
    color: 'Gold',
    attentionLevel: 'Medium',
    createdAt: '2025-02-15T10:30:00Z',
    isNew: true,
    relatedProducts: ['prod-005', 'prod-009'],
  },
  {
    id: 'prod-002',
    name: 'Gold Hoop Earrings',
    category: 'Earrings',
    price: 99.99,
    startingPrice: 129.99,
    sale: true,
    rating: 4,
    reviewCount: 18,
    description: 'These classic gold hoop earrings are the perfect addition to any jewelry collection. Made from 14k yellow gold, they feature a polished finish and secure snap closures.',
    brand: 'KC Collection',
    features: [
      '14k yellow gold construction',
      '1.5-inch diameter',
      'Polished finish',
      'Secure snap closures'
    ],
    images: [
      'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1635767798638-3665a373f197?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    ],
    stock: 25,
    material: 'Gold',
    dimensions: '1.5-inch diameter',
    weight: 2.8,
    color: 'Gold',
    attentionLevel: 'Low',
    createdAt: '2025-01-10T14:20:00Z',
    isNew: false,
  },
  {
    id: 'prod-003',
    name: 'Silver Charm Bracelet',
    category: 'Bracelet',
    price: 89.99,
    startingPrice: 89.99,
    sale: false,
    rating: 4,
    reviewCount: 12,
    description: 'This sterling silver charm bracelet features a delicate chain with a lobster clasp and comes with three pre-attached charms. Perfect for gift-giving or as a special treat for yourself.',
    brand: 'KC Collection',
    features: [
      'Sterling silver bracelet',
      'Three included charms',
      'Adjustable length from 7-8 inches',
      'Lobster clasp closure'
    ],
    images: [
      'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1608042314453-ae338d80c427?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1603974372039-adc49044b6bd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    ],
    stock: 0,
    material: 'Silver',
    dimensions: '7-8 inches (adjustable)',
    weight: 4.2,
    color: 'Silver',
    attentionLevel: 'Medium',
    createdAt: '2025-02-01T09:10:00Z',
    isNew: false,
  },
  {
    id: 'prod-004',
    name: 'Pearl Ring',
    category: 'Rings',
    price: 199.99,
    startingPrice: 199.99,
    sale: false,
    rating: 5,
    reviewCount: 31,
    description: 'This elegant pearl ring features a lustrous freshwater pearl set in sterling silver. The modern design makes it perfect for both casual and formal occasions.',
    brand: 'KC Collection',
    features: [
      '8mm freshwater pearl',
      'Sterling silver setting',
      'Comfort-fit band',
      'Available in sizes 5-10'
    ],
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1602173574767-37ac01994b2a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1589674781759-c21c37956a44?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    ],
    stock: 8,
    material: 'Silver',
    dimensions: 'Pearl: 8mm diameter',
    weight: 3.0,
    color: 'White/Silver',
    attentionLevel: 'Medium',
    createdAt: '2024-12-15T16:45:00Z',
    isNew: false,
  },
  {
    id: 'prod-005',
    name: 'Sapphire Pendant',
    category: 'Pendant',
    price: 349.99,
    startingPrice: 349.99,
    sale: false,
    rating: 4,
    reviewCount: 8,
    description: 'This stunning sapphire pendant features a 1-carat blue sapphire surrounded by a halo of small diamonds, set in 14k white gold. The pendant comes with an 18-inch white gold chain.',
    brand: 'KC Collection',
    features: [
      '1-carat blue sapphire',
      'Diamond halo (0.15 carat total weight)',
      '14k white gold setting',
      '18-inch white gold chain',
      'Lobster clasp'
    ],
    images: [
      'https://images.pexels.com/photos/3266700/pexels-photo-3266700.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/6858599/pexels-photo-6858599.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/10570051/pexels-photo-10570051.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    stock: 5,
    material: 'Gold',
    dimensions: '18-inch chain, 12mm pendant diameter',
    weight: 4.1,
    color: 'Blue/Gold',
    attentionLevel: 'High',
    createdAt: '2025-03-20T11:30:00Z',
    isNew: true,
  },
  {
    id: 'prod-006',
    name: 'Diamond Stud Earrings',
    category: 'Earrings',
    price: 299.99,
    startingPrice: 299.99,
    sale: false,
    rating: 5,
    reviewCount: 42,
    description: 'These classic diamond stud earrings feature a pair of round brilliant-cut diamonds totaling 0.5 carats, set in 14k white gold with secure screw backs.',
    brand: 'KC Collection',
    features: [
      '0.5 carat total weight (0.25 carats each)',
      'Round brilliant-cut diamonds',
      '14k white gold settings',
      'Secure screw backs'
    ],
    images: [
      'https://images.pexels.com/photos/10650797/pexels-photo-10650797.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/5442447/pexels-photo-5442447.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/12808020/pexels-photo-12808020.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    stock: 12,
    material: 'Diamond',
    dimensions: '4mm diameter each',
    weight: 1.6,
    color: 'White/Silver',
    attentionLevel: 'Medium',
    createdAt: '2025-01-05T09:20:00Z',
    isNew: false,
  },
  {
    id: 'prod-007',
    name: 'Gold Chain Bracelet',
    category: 'Bracelet',
    price: 149.99,
    startingPrice: 179.99,
    sale: true,
    rating: 4,
    reviewCount: 16,
    description: 'This elegant gold chain bracelet features a classic link design crafted from 18k gold. The adjustable length and lobster clasp make it comfortable and easy to wear.',
    brand: 'KC Collection',
    features: [
      '18k gold construction',
      'Classic link design',
      'Adjustable length from 6.5-7.5 inches',
      'Lobster clasp closure'
    ],
    images: [
      'https://images.pexels.com/photos/10949896/pexels-photo-10949896.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/5442456/pexels-photo-5442456.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/13829102/pexels-photo-13829102.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    stock: 10,
    material: 'Gold',
    dimensions: '6.5-7.5 inches (adjustable)',
    weight: 5.8,
    color: 'Gold',
    attentionLevel: 'Low',
    createdAt: '2024-11-25T14:45:00Z',
    isNew: false,
  },
  {
    id: 'prod-008',
    name: 'Emerald Ring',
    category: 'Rings',
    price: 429.99,
    startingPrice: 429.99,
    sale: false,
    rating: 5,
    reviewCount: 19,
    description: 'This stunning ring features a 1-carat emerald-cut emerald flanked by small round diamonds on each side, set in 14k yellow gold.',
    brand: 'KC Collection',
    features: [
      '1-carat emerald-cut emerald',
      '0.2 carat total weight diamond accents',
      '14k yellow gold setting',
      'Available in sizes 5-10'
    ],
    images: [
      'https://images.pexels.com/photos/4482900/pexels-photo-4482900.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/10949888/pexels-photo-10949888.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    stock: 4,
    material: 'Gemstone',
    dimensions: 'Center stone: 7x5mm',
    weight: 3.5,
    color: 'Green/Gold',
    attentionLevel: 'High',
    createdAt: '2025-03-15T10:15:00Z',
    isNew: true,
  },
  {
    id: 'prod-009',
    name: 'Rose Gold Necklace',
    category: 'Necklace',
    price: 249.99,
    startingPrice: 249.99,
    sale: false,
    rating: 4,
    reviewCount: 27,
    description: 'This delicate rose gold necklace features a minimalist design with a small bar pendant. Made from 14k rose gold with an adjustable chain length.',
    brand: 'KC Collection',
    features: [
      '14k rose gold construction',
      'Bar pendant (25mm x 3mm)',
      'Adjustable chain from 16-18 inches',
      'Spring ring clasp'
    ],
    images: [
      'https://images.pexels.com/photos/10651021/pexels-photo-10651021.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/10650798/pexels-photo-10650798.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/10650798/pexels-photo-10650798.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    stock: 15,
    material: 'Gold',
    dimensions: '16-18 inches (adjustable)',
    weight: 2.3,
    color: 'Rose Gold',
    attentionLevel: 'Medium',
    createdAt: '2025-02-10T08:30:00Z',
    isNew: false,
  },
  {
    id: 'prod-010',
    name: 'Pearl Drop Earrings',
    category: 'Earrings',
    price: 149.99,
    startingPrice: 149.99,
    sale: false,
    rating: 5,
    reviewCount: 33,
    description: 'These elegant pearl drop earrings feature lustrous freshwater pearls suspended from sterling silver posts. Perfect for adding a touch of sophistication to any outfit.',
    brand: 'KC Collection',
    features: [
      '9mm freshwater pearls',
      'Sterling silver posts',
      'Comfortable friction backs',
      'Total drop length: 1.5 inches'
    ],
    images: [
      'https://images.pexels.com/photos/9428776/pexels-photo-9428776.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/10949837/pexels-photo-10949837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/12150080/pexels-photo-12150080.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    stock: 9,
    material: 'Silver',
    dimensions: '1.5 inches drop length',
    weight: 3.2,
    color: 'White/Silver',
    attentionLevel: 'Medium',
    createdAt: '2025-01-20T15:40:00Z',
    isNew: false,
  },
  {
    id: 'prod-011',
    name: 'Charm Bracelet',
    category: 'Bracelet',
    price: 89.99,
    startingPrice: 119.99,
    sale: true,
    rating: 4,
    reviewCount: 21,
    description: 'This sterling silver charm bracelet comes with five pre-attached charms including a heart, star, moon, key, and flower. The bracelet features an adjustable chain with a lobster clasp.',
    brand: 'KC Collection',
    features: [
      'Sterling silver construction',
      'Five included charms',
      'Adjustable length from 6.5-8 inches',
      'Lobster clasp closure'
    ],
    images: [
      'https://images.pexels.com/photos/9428775/pexels-photo-9428775.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/13829087/pexels-photo-13829087.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/10949896/pexels-photo-10949896.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    stock: 7,
    material: 'Silver',
    dimensions: '6.5-8 inches (adjustable)',
    weight: 6.2,
    color: 'Silver',
    attentionLevel: 'Medium',
    createdAt: '2025-01-15T11:25:00Z',
    isNew: false,
  },
  {
    id: 'prod-012',
    name: 'Diamond Engagement Ring',
    category: 'Rings',
    price: 999.99,
    startingPrice: 999.99,
    sale: false,
    rating: 5,
    reviewCount: 48,
    description: 'This stunning engagement ring features a 1-carat round brilliant-cut diamond center stone set in a cathedral setting with pavé diamonds along the band, all in 14k white gold.',
    brand: 'KC Collection',
    features: [
      '1-carat round brilliant-cut center diamond (VS clarity, G color)',
      '0.25 carat total weight pavé diamonds on band',
      '14k white gold setting',
      'Cathedral style setting',
      'Available in sizes 4-10'
    ],
    images: [
      'https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/12629248/pexels-photo-12629248.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      'https://images.pexels.com/photos/1721937/pexels-photo-1721937.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    ],
    stock: 3,
    material: 'Diamond',
    dimensions: 'Center stone: 6.5mm diameter',
    weight: 3.8,
    color: 'White/Silver',
    attentionLevel: 'High',
    createdAt: '2025-03-25T09:00:00Z',
    isNew: true,
  }
];

// -------------------------------
// USERS DATA
// -------------------------------
const users = [
  {
    id: 'user-001',
    name: 'Admin User',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@kccollection.com',
    password: 'hashed_password_123', // In a real app, passwords would be hashed
    phone: '+1 (555) 123-4567',
    role: 'admin',
    createdAt: '2025-01-15T10:30:00Z',
    lastLogin: '2025-04-19T08:45:00Z',
    status: 'active',
    addressBook: [
      {
        id: 'addr-001',
        type: 'work',
        default: true,
        name: 'Admin User',
        street: '123 Admin Street',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94105',
        country: 'United States',
        phone: '+1 (555) 123-4567'
      }
    ]
  },
  {
    id: 'user-002',
    name: 'John Doe',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'hashed_password_456',
    phone: '+1 (555) 234-5678',
    role: 'customer',
    createdAt: '2025-02-10T14:20:00Z',
    lastLogin: '2025-04-18T16:30:00Z',
    status: 'active',
    addressBook: [
      {
        id: 'addr-002',
        type: 'home',
        default: true,
        name: 'John Doe',
        street: '123 Main Street, Apt 4B',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'United States',
        phone: '+1 (555) 234-5678'
      },
      {
        id: 'addr-003',
        type: 'work',
        default: false,
        name: 'John Doe',
        street: '456 Corporate Avenue',
        city: 'New York',
        state: 'NY',
        zipCode: '10022',
        country: 'United States',
        phone: '+1 (555) 234-5679'
      }
    ]
  },
  {
    id: 'user-003',
    name: 'Jane Smith',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    password: 'hashed_password_789',
    phone: '+1 (555) 345-6789',
    role: 'customer',
    createdAt: '2025-02-15T09:10:00Z',
    lastLogin: '2025-04-17T11:20:00Z',
    status: 'active',
    addressBook: [
      {
        id: 'addr-004',
        type: 'home',
        default: true,
        name: 'Jane Smith',
        street: '789 Park Avenue',
        city: 'Boston',
        state: 'MA',
        zipCode: '02115',
        country: 'United States',
        phone: '+1 (555) 345-6789'
      }
    ]
  },
  {
    id: 'user-004',
    name: 'Robert Johnson',
    firstName: 'Robert',
    lastName: 'Johnson',
    email: 'robert@example.com',
    password: 'hashed_password_101',
    phone: '+1 (555) 456-7890',
    role: 'customer',
    createdAt: '2025-02-20T16:45:00Z',
    lastLogin: '2025-04-15T14:15:00Z',
    status: 'active',
    addressBook: [
      {
        id: 'addr-005',
        type: 'home',
        default: true,
        name: 'Robert Johnson',
        street: '567 Oak Street',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'United States',
        phone: '+1 (555) 456-7890'
      }
    ]
  },
  {
    id: 'user-005',
    name: 'Emily Davis',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily@example.com',
    password: 'hashed_password_202',
    phone: '+1 (555) 567-8901',
    role: 'customer',
    createdAt: '2025-03-05T11:30:00Z',
    lastLogin: '2025-04-10T09:45:00Z',
    status: 'inactive',
    addressBook: [
      {
        id: 'addr-006',
        type: 'home',
        default: true,
        name: 'Emily Davis',
        street: '890 Pine Street',
        city: 'Seattle',
        state: 'WA',
        zipCode: '98101',
        country: 'United States',
        phone: '+1 (555) 567-8901'
      }
    ]
  }
];

// -------------------------------
// ORDERS DATA
// -------------------------------
const orders = [
  {
    id: 'ORD10001',
    userId: 'user-002',
    customerName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 234-5678',
    orderDate: '2025-04-15T10:30:00Z',
    total: 299.99,
    status: 'delivered',
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    items: [
      {
        product: {
          id: 'prod-001',
          name: 'Gold Studded Earrings',
          price: 129.99,
          image: 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
        },
        quantity: 1,
        price: 129.99
      },
      {
        product: {
          id: 'prod-002',
          name: 'Diamond Pendant Necklace',
          price: 150.00,
          image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80'
        },
        quantity: 1,
        price: 150.00
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    trackingNumber: 'TRK123456789',
    shippingMethod: 'Standard Shipping',
    shippingCost: 15.00,
    tax: 5.00,
    subtotal: 279.99,
    notes: ''
  },
  {
    id: 'ORD10002',
    userId: 'user-003',
    customerName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 345-6789',
    orderDate: '2025-04-18T14:45:00Z',
    total: 499.99,
    status: 'processing',
    paymentMethod: 'PayPal',
    paymentStatus: 'paid',
    items: [
      {
        product: {
          id: 'prod-005',
          name: 'Diamond Tennis Bracelet',
          price: 499.99,
          image: '/assets/Intersect-5.png'
        },
        quantity: 1,
        price: 499.99
      }
    ],
    shippingAddress: {
      name: 'Jane Smith',
      street: '789 Park Avenue',
      city: 'Boston',
      state: 'MA',
      zipCode: '02115',
      country: 'United States'
    },
    trackingNumber: '',
    shippingMethod: 'Express Shipping',
    shippingCost: 25.00,
    tax: 45.00,
    subtotal: 429.99,
    notes: 'Please gift wrap'
  },
  {
    id: 'ORD10003',
    userId: 'user-004',
    customerName: 'Robert Johnson',
    email: 'robert@example.com',
    phone: '+1 (555) 456-7890',
    orderDate: '2025-04-19T09:15:00Z',
    total: 89.99,
    status: 'pending',
    paymentMethod: 'Credit Card',
    paymentStatus: 'pending',
    items: [
      {
        product: {
          id: 'prod-003',
          name: 'Silver Charm Bracelet',
          price: 89.99,
          image: '/assets/Intersect-3.png'
        },
        quantity: 1,
        price: 89.99
      }
    ],
    shippingAddress: {
      name: 'Robert Johnson',
      street: '567 Oak Street',
      city: 'Chicago',
      state: 'IL',
      zipCode: '60601',
      country: 'United States'
    },
    trackingNumber: '',
    shippingMethod: 'Standard Shipping',
    shippingCost: 10.00,
    tax: 8.10,
    subtotal: 71.89,
    notes: ''
  },
  {
    id: 'ORD10004',
    userId: 'user-002',
    customerName: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 234-5678',
    orderDate: '2025-04-12T16:20:00Z',
    total: 199.98,
    status: 'shipped',
    paymentMethod: 'Credit Card',
    paymentStatus: 'paid',
    items: [
      {
        product: {
          id: 'prod-006',
          name: 'Gold Hoop Earrings',
          price: 99.99,
          image: '/assets/Intersect-6.png'
        },
        quantity: 2,
        price: 199.98
      }
    ],
    shippingAddress: {
      name: 'John Doe',
      street: '123 Main Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'United States'
    },
    trackingNumber: 'TRK987654321',
    shippingMethod: 'Standard Shipping',
    shippingCost: 15.00,
    tax: 16.50,
    subtotal: 168.48,
    notes: ''
  },
  {
    id: 'ORD10005',
    userId: 'user-005',
    customerName: 'Emily Davis',
    email: 'emily@example.com',
    phone: '+1 (555) 567-8901',
    orderDate: '2025-04-10T11:05:00Z',
    total: 349.99,
    status: 'cancelled',
    paymentMethod: 'Credit Card',
    paymentStatus: 'refunded',
    items: [
      {
        product: {
          id: 'prod-008',
          name: 'Sapphire Ring',
          price: 349.99,
          image: '/assets/Intersect-8.png'
        },
        quantity: 1,
        price: 349.99
      }
    ],
    shippingAddress: {
      name: 'Emily Davis',
      street: '890 Pine Street',
      city: 'Seattle',
      state: 'WA',
      zipCode: '98101',
      country: 'United States'
    },
    trackingNumber: '',
    shippingMethod: 'Standard Shipping',
    shippingCost: 15.00,
    tax: 31.50,
    subtotal: 303.49,
    notes: 'Customer requested cancellation'
  }
];

// -------------------------------
// WISHLISTS DATA
// -------------------------------
const wishlists = {
  'user-002': [
    {
      id: 'prod-001',
      name: 'Gold Studded Earrings',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      inStock: true
    },
    {
      id: 'prod-002',
      name: 'Diamond Pendant Necklace',
      price: 150.00,
      image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      inStock: true
    },
    {
      id: 'prod-003',
      name: 'Silver Charm Bracelet',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      inStock: false
    }
  ],
  'user-003': [
    {
      id: 'prod-005',
      name: 'Sapphire Pendant',
      price: 349.99,
      image: '/assets/Intersect-5.png',
      inStock: true
    },
    {
      id: 'prod-008',
      name: 'Emerald Ring',
      price: 429.99,
      image: '/assets/Intersect-8.png',
      inStock: true
    }
  ],
  'user-004': [
    {
      id: 'prod-010',
      name: 'Pearl Drop Earrings',
      price: 149.99,
      image: '/assets/Intersect-1.png',
      inStock: true
    }
  ]
};

// -------------------------------
// CARTS DATA
// -------------------------------
const carts = {
  'user-002': [
    {
      id: 'prod-001',
      name: 'Gold Studded Earrings',
      price: 129.99,
      image: 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
      quantity: 1
    },
    {
      id: 'prod-009',
      name: 'Rose Gold Necklace',
      price: 249.99,
      image: 'https://images.pexels.com/photos/10651021/pexels-photo-10651021.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      quantity: 1
    }
  ],
  'user-003': [
    {
      id: 'prod-004',
      name: 'Pearl Ring',
      price: 199.99,
      image: '/assets/Intersect-4.png',
      quantity: 1
    }
  ]
};

// -------------------------------
// OFFERS/PROMOTIONS DATA
// -------------------------------
const offers = [
  {
    id: 'offer-001',
    title: 'Summer Sale - 20% Off',
    description: 'Get 20% off on all jewelry items this summer. Use code SUMMER20 at checkout.',
    discountCode: 'SUMMER20',
    discountPercentage: 20,
    minPurchase: 100.00,
    startDate: '2025-06-01T00:00:00Z',
    endDate: '2025-08-31T23:59:59Z',
    image: 'https://images.pexels.com/photos/5638333/pexels-photo-5638333.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    status: 'active',
    eligibleCategories: ['all']
  },
  {
    id: 'offer-002',
    title: 'Free Shipping on Orders $150+',
    description: 'Enjoy free standard shipping on all orders over $150. No code necessary.',
    discountCode: null,
    discountPercentage: 0,
    minPurchase: 150.00,
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    image: 'https://images.pexels.com/photos/6214476/pexels-photo-6214476.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    status: 'active',
    eligibleCategories: ['all']
  },
  {
    id: 'offer-003',
    title: 'Buy One Get One 50% Off - Earrings',
    description: 'Buy one pair of earrings and get the second pair at 50% off. Add both items to cart and use code BOGO50.',
    discountCode: 'BOGO50',
    discountPercentage: 50,
    minPurchase: 0.00,
    startDate: '2025-05-01T00:00:00Z',
    endDate: '2025-05-31T23:59:59Z',
    image: 'https://images.pexels.com/photos/8386654/pexels-photo-8386654.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    status: 'active',
    eligibleCategories: ['Earrings']
  },
  {
    id: 'offer-004',
    title: 'New Customer - 10% Off First Purchase',
    description: 'New customers get 10% off their first purchase. Use code WELCOME10 at checkout.',
    discountCode: 'WELCOME10',
    discountPercentage: 10,
    minPurchase: 0.00,
    startDate: '2025-01-01T00:00:00Z',
    endDate: '2025-12-31T23:59:59Z',
    image: 'https://images.pexels.com/photos/6063712/pexels-photo-6063712.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    status: 'active',
    eligibleCategories: ['all']
  }
];

// -------------------------------
// REVIEWS DATA
// -------------------------------
const reviews = [
  {
    id: 'review-001',
    userId: 'user-002',
    productId: 'prod-001',
    userName: 'John D.',
    rating: 5,
    title: 'Beautiful earrings',
    comment: 'These earrings are absolutely stunning! The quality is exceptional and they look even better in person.',
    date: '2025-03-20T14:30:00Z',
    verified: true
  },
  {
    id: 'review-002',
    userId: 'user-003',
    productId: 'prod-001',
    userName: 'Jane S.',
    rating: 5,
    title: 'Perfect gift',
    comment: 'I bought these for my daughter and she loved them! The packaging was beautiful and the earrings are high quality.',
    date: '2025-03-15T09:20:00Z',
    verified: true
  },
  {
    id: 'review-003',
    userId: 'user-004',
    productId: 'prod-002',
    userName: 'Robert J.',
    rating: 4,
    title: 'Nice necklace',
    comment: 'The necklace is beautiful, but the clasp is a bit difficult to use. Otherwise, it\'s perfect.',
    date: '2025-03-10T17:45:00Z',
    verified: true
  },
  {
    id: 'review-004',
    userId: 'user-005',
    productId: 'prod-003',
    userName: 'Emily D.',
    rating: 3,
    title: 'Decent bracelet',
    comment: 'The bracelet looks nice but feels a bit lightweight. I was expecting something more substantial for the price.',
    date: '2025-02-28T11:10:00Z',
    verified: true
  }
];

// -------------------------------
// CATEGORIES DATA
// -------------------------------
const categories = [
  {
    id: 'cat-001',
    name: 'Necklace',
    slug: 'necklace',
    description: 'Beautiful necklaces for every occasion',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    productCount: 2
  },
  {
    id: 'cat-002',
    name: 'Earrings',
    slug: 'earrings',
    description: 'Stunning earrings to complement any outfit',
    image: 'https://images.unsplash.com/photo-1629224316810-9d8805b95e76?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    productCount: 3
  },
  {
    id: 'cat-003',
    name: 'Bracelet',
    slug: 'bracelet',
    description: 'Elegant bracelets for your wrist',
    image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    productCount: 3
  },
  {
    id: 'cat-004',
    name: 'Rings',
    slug: 'rings',
    description: 'Beautiful rings for every finger',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80',
    productCount: 3
  },
  {
    id: 'cat-005',
    name: 'Pendant',
    slug: 'pendant',
    description: 'Stunning pendants for your necklace',
    image: 'https://images.pexels.com/photos/3266700/pexels-photo-3266700.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    productCount: 1
  },
  {
    id: 'cat-006',
    name: 'Set',
    slug: 'set',
    description: 'Complete jewelry sets for a coordinated look',
    image: 'https://images.pexels.com/photos/12863816/pexels-photo-12863816.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    productCount: 0
  }
];

// -------------------------------
// EXPORT MOCK API FUNCTIONS
// -------------------------------

// Get all products
export const getAllProducts = () => {
  return products;
};

// Get product by ID
export const getProductById = (id) => {
  return products.find(product => product.id === id) || null;
};

// Get products by category
export const getProductsByCategory = (category) => {
  return products.filter(product => product.category === category);
};

// Get featured products
export const getFeaturedProducts = () => {
  return products.filter(product => product.attentionLevel === 'High').slice(0, 4);
};

// Get new arrivals
export const getNewArrivals = () => {
  return products.filter(product => product.isNew);
};

// Get products on sale
export const getProductsOnSale = () => {
  return products.filter(product => product.sale);
};

// Search products
export const searchProducts = (query) => {
  const searchTerm = query.toLowerCase();
  return products.filter(product => 
    product.name.toLowerCase().includes(searchTerm) || 
    product.category.toLowerCase().includes(searchTerm) || 
    product.description.toLowerCase().includes(searchTerm)
  );
};

// Authentication functions
export const loginUser = (email, password) => {
  const user = users.find(u => u.email === email);
  if (!user) {
    return { success: false, message: 'User not found' };
  }
  
  // In a real app, we would verify the password hash
  // For demo purposes, let's pretend the password matches
  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role
    }
  };
};

// Get user profile
export const getUserProfile = (userId) => {
  const user = users.find(u => u.id === userId);
  if (!user) return null;
  
  // Don't send back password
  const { password, ...userProfile } = user;
  return userProfile;
};

// Get user addresses
export const getUserAddresses = (userId) => {
  const user = users.find(u => u.id === userId);
  return user?.addressBook || [];
};

// Get user orders
export const getUserOrders = (userId) => {
  return orders.filter(order => order.userId === userId);
};

// Get order by ID
export const getOrderById = (orderId) => {
  return orders.find(order => order.id === orderId) || null;
};

// Get user wishlist
export const getUserWishlist = (userId) => {
  return wishlists[userId] || [];
};

// Add to wishlist
export const addToWishlist = (userId, productId) => {
  const product = getProductById(productId);
  if (!product) return false;
  
  if (!wishlists[userId]) {
    wishlists[userId] = [];
  }
  
  // Check if product is already in wishlist
  const existingItem = wishlists[userId].find(item => item.id === productId);
  if (!existingItem) {
    wishlists[userId].push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      inStock: product.stock > 0
    });
  }
  
  return true;
};

// Remove from wishlist
export const removeFromWishlist = (userId, productId) => {
  if (!wishlists[userId]) return false;
  
  wishlists[userId] = wishlists[userId].filter(item => item.id !== productId);
  return true;
};

// Get user cart
export const getUserCart = (userId) => {
  return carts[userId] || [];
};

// Add to cart
export const addToCart = (userId, productId, quantity = 1) => {
  const product = getProductById(productId);
  if (!product) return false;
  
  if (!carts[userId]) {
    carts[userId] = [];
  }
  
  // Check if product is already in cart
  const existingItemIndex = carts[userId].findIndex(item => item.id === productId);
  
  if (existingItemIndex >= 0) {
    // Update quantity if item exists
    carts[userId][existingItemIndex].quantity += quantity;
  } else {
    // Add new item if it doesn't exist
    carts[userId].push({
      id: product.id,
      name: product.name,
      price: product.onSale ? product.salePrice : product.price,
      image: product.images[0],
      quantity: quantity
    });
  }
  
  return true;
};

// Update cart item
export const updateCartItem = (userId, productId, quantity) => {
  if (!carts[userId]) return false;
  
  const itemIndex = carts[userId].findIndex(item => item.id === productId);
  if (itemIndex < 0) return false;
  
  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    carts[userId] = carts[userId].filter(item => item.id !== productId);
  } else {
    // Update quantity
    carts[userId][itemIndex].quantity = quantity;
  }
  
  return true;
};

// Remove from cart
export const removeFromCart = (userId, productId) => {
  if (!carts[userId]) return false;
  
  carts[userId] = carts[userId].filter(item => item.id !== productId);
  return true;
};

// Clear cart
export const clearCart = (userId) => {
  carts[userId] = [];
  return true;
};

// Get all offers
export const getAllOffers = () => {
  return offers.filter(offer => offer.status === 'active');
};

// Get offer by ID
export const getOfferById = (id) => {
  return offers.find(offer => offer.id === id) || null;
};

// Get all categories
export const getAllCategories = () => {
  return categories;
};

// Get category by ID or slug
export const getCategoryById = (idOrSlug) => {
  return categories.find(cat => cat.id === idOrSlug || cat.slug === idOrSlug) || null;
};

// Get reviews by product ID
export const getReviewsByProductId = (productId) => {
  return reviews.filter(review => review.productId === productId);
};

// Add review
export const addReview = (review) => {
  const newReview = {
    id: `review-${reviews.length + 1}`,
    date: new Date().toISOString(),
    verified: true,
    ...review
  };
  
  reviews.push(newReview);
  return newReview;
};

// Create a mock API handler with delay to simulate network request
const createApiHandler = (handler) => {
  return (...args) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(handler(...args));
      }, 300); // 300ms delay to simulate network
    });
  };
};

// Export API functions with delay
export const api = {
  products: {
    getAll: createApiHandler(getAllProducts),
    getById: createApiHandler(getProductById),
    getByCategory: createApiHandler(getProductsByCategory),
    getFeatured: createApiHandler(getFeaturedProducts),
    getNewArrivals: createApiHandler(getNewArrivals),
    getOnSale: createApiHandler(getProductsOnSale),
    search: createApiHandler(searchProducts)
  },
  auth: {
    login: createApiHandler(loginUser),
    getUserProfile: createApiHandler(getUserProfile)
  },
  users: {
    getAddresses: createApiHandler(getUserAddresses),
    getOrders: createApiHandler(getUserOrders),
    getWishlist: createApiHandler(getUserWishlist),
    addToWishlist: createApiHandler(addToWishlist),
    removeFromWishlist: createApiHandler(removeFromWishlist)
  },
  cart: {
    get: createApiHandler(getUserCart),
    add: createApiHandler(addToCart),
    update: createApiHandler(updateCartItem),
    remove: createApiHandler(removeFromCart),
    clear: createApiHandler(clearCart)
  },
  orders: {
    getById: createApiHandler(getOrderById)
  },
  offers: {
    getAll: createApiHandler(getAllOffers),
    getById: createApiHandler(getOfferById)
  },
  categories: {
    getAll: createApiHandler(getAllCategories),
    getById: createApiHandler(getCategoryById)
  },
  reviews: {
    getByProductId: createApiHandler(getReviewsByProductId),
    add: createApiHandler(addReview)
  }
};

export default api;
