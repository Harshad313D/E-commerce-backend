import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    imageUrl: { type: String },
    artisan: { type: String, required: true }, // <-- ADD THIS LINE
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", productSchema);
export default Product;
