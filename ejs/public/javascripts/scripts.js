// Add to Cart Button
document.addEventListener('DOMContentLoaded', () => {
    const addToCartForms = document.querySelectorAll('.add-to-cart-form');
    addToCartForms.forEach(form => {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = form.querySelector('input[name="productId"]').value;
        const quantity = form.querySelector('input[name="quantity"]').value || 1;
        
        try {
          const res = await fetch('/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId, quantity }),
          });
          const data = await res.json();
          if (res.ok) {
            showNotification(data.message, 'success');
          } else {
            showNotification(data.error, 'error');
          }
        } catch (error) {
          showNotification('An error occurred while adding to cart.', 'error');
        }
      });
    });
  });
  
  // Show Notification
  function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerText = message;
  
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
  }
  
  // Confirm Delete for Admin Actions
  function confirmDelete(event) {
    if (!confirm('Are you sure you want to delete this item?')) {
      event.preventDefault();
    }
  }
  
  