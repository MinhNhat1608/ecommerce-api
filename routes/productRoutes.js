
const express = require("express");
const router = express.Router();

const productController = require("../controllers/productController");

router.post("/", productController.createProduct);

router.get("/", productController.getAllProducts);

router.get("/:pid", productController.getProductById);

router.put("/:pid", productController.updateProduct);

router.delete("/:pid", productController.deleteProduct);

module.exports = router;
