
const mongoose = require("mongoose");

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI ||
    (process.env.NODE_ENV === "production" ? "" : "mongodb://127.0.0.1:27017/scms");
  if (!mongoUri) {
    throw new Error("MONGO_URI is not configured");
  }

  await mongoose.connect(mongoUri);
  console.log("MongoDB connected successfully!");
};

module.exports = connectDB;
