const mongoose = require('mongoose');

const actionLogSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true
  },
  action: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  }, 
  desc: { type: String },
  time: {
    type: Date,
    default: Date.now
  },
});

module.exports = mongoose.model('ActionLog', actionLogSchema); 