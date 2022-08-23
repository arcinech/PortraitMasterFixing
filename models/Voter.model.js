const mongoose = require('mongoose');

const voterSchema = new mongoose.Schema({
  voter: { type: 'string', required: true },
  votes: [{ type: 'String', required: true }], // array of photo ids
});

module.exports = mongoose.model('Voter', voterSchema);
