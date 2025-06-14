import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { wishlistApi } from '../../services/realApi';
import WishlistItem from '../../components/wishlist/WishlistItem';
import WishlistEmpty from '../../components/wishlist/WishlistEmpty';
import WishlistSkeleton from '../../components/wishlist/WishlistSkeleton';

const WishlistPage = () => {
  const { user } = useAuth();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  
  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch wishlist data from API
        const response = await wishlistApi.get();
        
        // Transform the data to the format required by WishlistItem component
        const formattedWishlist = response.items ? response.items.map(item => {
          const product = item.productId;
          return {
            id: product._id,
            name: product.name,
            price: product.price,
            // Use first image from images array if available
            image: product.images && product.images.length > 0 ? product.images[0] : null,
            quantity: 1,
            description: product.description
          };
        }) : [];
        
        setWishlist(formattedWishlist);
      } catch (error) {
        console.error('Error fetching wishlist:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, [user]);
  
  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: { pathname: '/user/wishlist' } }} replace />;
  }

  const handleAddToCart = async (item) => {
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1
    });
    await removeFromWishlist(item.id);
  };

  const removeFromWishlist = async (productId) => {
    try {
      if (user) {
        // Call the API function to remove item
        await wishlistApi.remove(productId);
        // Update local state
        setWishlist(wishlist.filter(item => item.id !== productId));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const clearWishlist = async () => {
    try {
      if (user) {
        // Remove each item one by one from the wishlist
        for (const item of wishlist) {
          await wishlistApi.remove(item.id);
        }
        // Clear local state
        setWishlist([]);
      }
    } catch (error) {
      console.error('Error clearing wishlist:', error);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Your Wishlist</h1>

        {loading ? (
          <WishlistSkeleton />
        ) : wishlist.length === 0 ? (
          <WishlistEmpty />
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {wishlist.map((item) => (
                  <WishlistItem
                    key={item.id}
                    item={item}
                    onAddToCart={handleAddToCart}
                    onRemove={removeFromWishlist}
                  />
                ))}
              </ul>
            </div>
            
            <div className="mt-6 flex justify-between items-center">
              <Button as={Link} to="/shop" variant="outline">
                Continue Shopping
              </Button>
              
              <Button onClick={clearWishlist} variant="secondary">
                Clear Wishlist
              </Button>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default WishlistPage;