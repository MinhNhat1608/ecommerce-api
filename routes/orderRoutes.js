const express = require("express");
const prisma = require("../prismaClient");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ==============================
// CREATE ORDER
// POST /api/orders
// ==============================
router.post("/", authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;
    const { pid, qty } = req.body;

    if (!pid || !qty || qty <= 0) {
      return res.status(400).json({
        message: "Vui long nhap pid va qty hop le"
      });
    }

    const product = await prisma.product.findUnique({
      where: {
        pid: Number(pid)
      }
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    if (product.quantity < Number(qty)) {
      return res.status(400).json({
        message: "Khong du so luong san pham"
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          uid: uid,
          createat: new Date()
        }
      });

      const orderDetail = await tx.orderDetail.create({
        data: {
          oid: order.oid,
          pid: product.pid,
          qty: Number(qty),
          unit_price: product.price
        }
      });

      await tx.product.update({
        where: {
          pid: product.pid
        },
        data: {
          quantity: {
            decrement: Number(qty)
          }
        }
      });

      return {
        order,
        orderDetail
      };
    });

    res.status(201).json({
      message: "Create order successful",
      order: result.order,
      orderDetail: result.orderDetail
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
});

// ==============================
// GET ALL ORDERS OF CURRENT USER
// GET /api/orders
// ==============================
router.get("/", authMiddleware, async (req, res) => {
  try {
    const uid = req.user.uid;

    const orders = await prisma.order.findMany({
      where: {
        uid: uid
      },
      include: {
        orderDetails: {
          include: {
            product: true
          }
        }
      }
    });

    res.status(200).json({
      message: "Get orders successful",
      orders
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
});

// ==============================
// GET ORDER BY ID
// GET /api/orders/:oid
// ==============================
router.get("/:oid", authMiddleware, async (req, res) => {
  try {
    const oid = Number(req.params.oid);
    const uid = req.user.uid;

    const order = await prisma.order.findFirst({
      where: {
        oid: oid,
        uid: uid
      },
      include: {
        orderDetails: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    res.status(200).json({
      message: "Get order successful",
      order
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Internal Server Error"
    });
  }
});

module.exports = router;