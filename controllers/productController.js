
const prisma = require("../config/prismaClient");

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const { pname, price, quantity } = req.body;

    if (!pname || price === undefined || quantity === undefined) {
      return res.status(400).json({
        message: "Vui long nhap day du thong tin"
      });
    }

    const product = await prisma.product.create({
      data: { pname, price, quantity }
    });

    res.status(201).json({
      message: "Create product successful",
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    res.status(200).json({
      message: "Get products successful",
      products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);

    const product = await prisma.product.findUnique({
      where: { pid }
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    res.status(200).json({
      message: "Get product successful",
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// UPDATE PRODUCT
const updateProduct = async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);
    const { pname, price, quantity } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { pid }
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    const product = await prisma.product.update({
      where: { pid },
      data: { pname, price, quantity }
    });

    res.status(200).json({
      message: "Update product successful",
      product
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// DELETE PRODUCT
const deleteProduct = async (req, res) => {
  try {
    const pid = parseInt(req.params.pid);

    const existingProduct = await prisma.product.findUnique({
      where: { pid }
    });

    if (!existingProduct) {
      return res.status(404).json({
        message: "Product not found"
      });
    }

    await prisma.product.delete({
      where: { pid }
    });

    res.status(200).json({
      message: "Delete product successful"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct
};
