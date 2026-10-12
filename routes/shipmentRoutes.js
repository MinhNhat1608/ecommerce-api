const express = require("express");
const prisma = require("../prismaClient");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// CREATE SHIPMENT
// POST /api/shipments
router.post("/", authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { oid, status } = req.body;

    if (!oid || !status) {
      return res.status(400).json({
        message: "Vui long nhap oid va status"
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        oid: Number(oid),
        uid: uid
      }
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    const shipment = await prisma.shipment.create({
      data: {
        oid: Number(oid),
        status: status
      }
    });

    res.status(201).json({
      message: "Create shipment successful",
      shipment
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
});

// GET ALL SHIPMENTS
// GET /api/shipments
router.get("/", authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;

    const shipments = await prisma.shipment.findMany({
      where: {
        order: {
          uid: uid
        }
      },
      include: {
        order: true
      }
    });

    res.status(200).json({
      message: "Get shipments successful",
      shipments
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
});

// GET SHIPMENT BY ID
// GET /api/shipments/:shipid
router.get("/:shipid", authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const shipid = Number(req.params.shipid);

    const shipment = await prisma.shipment.findFirst({
      where: {
        shipid: shipid,
        order: {
          uid: uid
        }
      },
      include: {
        order: true
      }
    });

    if (!shipment) {
      return res.status(404).json({
        message: "Shipment not found"
      });
    }

    res.status(200).json({
      message: "Get shipment successful",
      shipment
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
});

// UPDATE SHIPMENT STATUS
// PUT /api/shipments/:shipid
router.put("/:shipid", authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const shipid = Number(req.params.shipid);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Vui long nhap status"
      });
    }

    const existingShipment = await prisma.shipment.findFirst({
      where: {
        shipid: shipid,
        order: {
          uid: uid
        }
      }
    });

    if (!existingShipment) {
      return res.status(404).json({
        message: "Shipment not found"
      });
    }

    const shipment = await prisma.shipment.update({
      where: {
        shipid: shipid
      },
      data: {
        status: status
      }
    });

    res.status(200).json({
      message: "Update shipment successful",
      shipment
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
});

// DELETE SHIPMENT
// DELETE /api/shipments/:shipid
router.delete("/:shipid", authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const shipid = Number(req.params.shipid);

    const existingShipment = await prisma.shipment.findFirst({
      where: {
        shipid: shipid,
        order: {
          uid: uid
        }
      }
    });

    if (!existingShipment) {
      return res.status(404).json({
        message: "Shipment not found"
      });
    }

    await prisma.shipment.delete({
      where: {
        shipid: shipid
      }
    });

    res.status(200).json({
      message: "Delete shipment successful"
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
});

module.exports = router;