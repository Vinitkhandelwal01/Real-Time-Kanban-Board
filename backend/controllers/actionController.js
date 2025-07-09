const ActionLog = require('../models/ActionLog');

exports.logAction = async (req, res) => {
  try {
    const { action, target, desc } = req.body;
    const user = req.user.username;
    const log = await ActionLog.create({ user, action, target, desc });
    req.app.get('io').emit('actionLogged', log);
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.getActions = async (req, res) => {
  try {
    const logs = await ActionLog.find().sort({ time: -1 }).limit(20);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: 'Server error.' });
  }
}; 