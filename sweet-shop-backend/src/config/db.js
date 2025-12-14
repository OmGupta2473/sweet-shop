const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("MONGO_URI not set. Please provide MONGO_URI in a .env file at the repository root or as an environment variable.");
      process.exit(1);
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB Connection Failed", error);
    process.exit(1);
  }
};

module.exports = connectDB;
