const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cors = require("cors");
const connectDB = require("./config/db");

dotenv.config({ path: path.resolve(__dirname, "../../.env") }); // load repo root .env (two levels up from src)
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Root endpoint removed to match API contract (only specified endpoints implemented).

// Mount API routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/sweets', require('./routes/sweetRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));

const PORT = process.env.PORT || 5000;

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
