const User = require('../models/User'); // Adjust the path as needed

exports.getProfile = async (req, res) => {
  try {
    // Use the ID from the decoded token to find the full user details
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });

    if(user.role=="admin"){
      res.redirect('admin/dashboard');
    }

    // Send the full user data as response
    // res.json(user);
    res.render('user/profile', { user: user,page:'profile'});
  } catch (error) {
    console.error('Error fetching profile:', error.message);
    res.status(500).json({ error: 'Error fetching profile' });
  }
};
