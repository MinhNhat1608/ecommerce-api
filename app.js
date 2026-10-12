const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const shipmentRoutes = require("./routes/shipmentRoutes");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

// ROOT
app.get("/", (req, res) => {
  res.json({
    message: "E-commerce API is running"
  });
});

// HEALTH CHECK
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK"
  });
});

// AUTH
app.use("/api/auth", authRoutes);

// PRODUCT
app.use("/api/products", productRoutes);

// ORDER
app.use("/api/orders", orderRoutes);

// SHIPMENT
app.use("/api/shipments", shipmentRoutes);

// PROTECTED PROFILE
app.get("/api/profile", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "Protected route accessed",
    user: req.user
  });
});

module.exports = app;