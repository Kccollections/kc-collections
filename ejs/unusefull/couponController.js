exports.applyCoupon = async (req, res) => {
    const { code } = req.body;
    try {
      const coupon = await Coupon.findOne({ code, isActive: true, expirationDate: { $gte: new Date() } });
      if (!coupon) return res.status(400).json({ error: 'Invalid or expired coupon code' });
  
      res.json({ discountAmount: coupon.discountAmount });
    } catch (error) {
      res.status(500).json({ error: 'Error applying coupon' });
    }
  };
  