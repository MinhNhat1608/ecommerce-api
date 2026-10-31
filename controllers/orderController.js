
const prisma = require("../config/prismaClient");

// CREATE ORDER - MULTIPLE PRODUCTS
const createOrder = async (req, res) => {
  try {
    const uid = req.user.uid;
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Danh sach san pham khong hop le"
      });
    }

    const quantities = new Map();

    for (const item of items) {
      const pid = Number(item?.pid);
      const qty = Number(item?.qty);

      if (
        !Number.isSafeInteger(pid) || pid <= 0 ||
        !Number.isSafeInteger(qty) || qty <= 0
      ) {
        return res.status(400).json({
          message: "pid hoac qty khong hop le"
        });
      }

      quantities.set(pid, (quantities.get(pid) || 0) + qty);
    }

    const result = await prisma.$transaction(async (tx) => {
      const products = [];

      for (const [pid, qty] of quantities) {
        const product = await tx.product.findUnique({
          where: { pid }
        });

        if (!product) {
          throw new Error(`Khong tim thay san pham ${pid}`);
        }

        const updated = await tx.product.updateMany({
          where: {
            pid,
            quantity: { gte: qty }
          },
          data: {
            quantity: { decrement: qty }
          }
        });

        if (updated.count !== 1) {
          throw new Error(`Khong du ton kho san pham ${pid}`);
        }

        products.push({ product, qty });
      }

      // Tao mot don hang
      const order = await tx.order.create({
        data: {
          uid,
          createat: new Date()
        }
      });

      // Tao nhieu chi tiet don hang
      const orderDetails = [];

      for (const { product, qty } of products) {
        const detail = await tx.orderDetail.create({
          data: {
            oid: order.oid,
            pid: product.pid,
            qty,
            unit_price: product.price
          }
        });

        orderDetails.push(detail);
      }

      // Tao shipment
      const shipment = await tx.shipment.create({
        data: {
          oid: order.oid,
          status: "PENDING"
        }
      });

      return { order, orderDetails, shipment };
    });

    return res.status(201).json({
      message: "Create order successful",
      ...result
    });

  } catch (error) {
    console.error(error);

    if (
      error.message.startsWith("Khong tim thay") ||
      error.message.startsWith("Khong du ton")
    ) {
      return res.status(400).json({
        message: error.message
      });
    }

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// GET ALL ORDERS OF CURRENT USER
const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { uid: req.user.uid },
      include: {
        orderDetails: {
          include: { product: true }
        }
      }
    });

    return res.status(200).json({
      message: "Get orders successful",
      orders
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

// GET ORDER BY ID
const getOrderById = async (req, res) => {
  try {
    const oid = Number(req.params.oid);

    if (!Number.isSafeInteger(oid) || oid <= 0) {
      return res.status(400).json({
        message: "Order ID khong hop le"
      });
    }

    const order = await prisma.order.findFirst({
      where: {
        oid,
        uid: req.user.uid
      },
      include: {
        orderDetails: {
          include: { product: true }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    return res.status(200).json({
      message: "Get order successful",
      order
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById
};
