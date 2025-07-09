const express = require('express');
const { registerUser, loginUser } = require('../controllers/authController');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// GET /api/users - return all users (protected)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find({}, '_id userName email');
    // Map userName to name for frontend compatibility
    const mapped = users.map(u => ({
      _id: u._id,
      name: u.userName,
      email: u.email
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router; 