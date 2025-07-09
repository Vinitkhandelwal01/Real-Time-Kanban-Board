const express = require('express');
const auth = require('../middleware/auth');
const { logAction, getActions } = require('../controllers/actionController');

const router = express.Router();

router.post('/', auth, logAction);
router.get('/', auth, getActions);

module.exports = router; 