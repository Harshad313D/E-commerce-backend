import Product from "../Models/product.js"; // Make sure the path matches your Product model

// Add a new product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock, imageUrl } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      imageUrl,
    });

    await product.save();

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to create product", error: error.message });
  }
};

// Get all products (Admin view - might include filtering later)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 }); // Newest first

    res.status(200).json({
      message: "Products fetched successfully",
      count: products.length,
      products,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: error.message });
  }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product fetched successfully",
      product,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch product", error: error.message });
  }
};

// Update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // { new: true } returns the updated document rather than the old one
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to update product", error: error.message });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(id);

    res.status(200).json({
      message: "Product deleted successfully",
      deletedProductId: id,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: error.message });
  }
};

// Get Low Stock Products (Great for admin dashboards)
export const getLowStockProducts = async (req, res) => {
  try {
    // Let's assume any stock below 10 is considered "low stock"
    const lowStockThreshold = 10;

    const lowStockProducts = await Product.find({
      stock: { $lt: lowStockThreshold },
    });

    res.status(200).json({
      message: "Low stock products fetched successfully",
      count: lowStockProducts.length,
      products: lowStockProducts,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch stock data", error: error.message });
  }
};
