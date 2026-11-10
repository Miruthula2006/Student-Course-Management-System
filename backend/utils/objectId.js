const mongoose = require("mongoose");

function isObjectId(value) {
  return mongoose.isObjectIdOrHexString(value);
}

module.exports = isObjectId;
