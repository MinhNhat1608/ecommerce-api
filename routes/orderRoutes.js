
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const orderController = require("../controllers/orderController");

// CREATE ORDER
router.post("/", authMiddleware, orderController.createOrder);

// GET ALL ORDERS
router.get("/", authMiddleware, orderController.getAllOrders);

// GET ORDER BY ID
router.get("/:oid", authMiddleware, orderController.getOrderById);

module.exports = router;
