
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const shipmentController = require("../controllers/shipmentController");

// CREATE SHIPMENT
router.post("/", authMiddleware, shipmentController.createShipment);

// GET ALL SHIPMENTS
router.get("/", authMiddleware, shipmentController.getAllShipments);

// GET SHIPMENT BY ID
router.get("/:shipid", authMiddleware, shipmentController.getShipmentById);

// UPDATE SHIPMENT
router.put("/:shipid", authMiddleware, shipmentController.updateShipment);

// DELETE SHIPMENT
router.delete("/:shipid", authMiddleware, shipmentController.deleteShipment);

module.exports = router;
