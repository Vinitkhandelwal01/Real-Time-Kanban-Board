const express = require("express");
const router = express.Router();
const User = require("../models/User"); // your Mongoose User model
const authMiddleware = require("../middleware/auth"); // if needed

router.get("/", authMiddleware, async (req, res) => {
  try {
    const users = await User.find({}, "_id userName"); // fetch id and name only
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

module.exports = router;