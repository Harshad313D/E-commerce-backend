import mongoose from "mongoose";

// Sub-schema to track every individual payment attempt
const paymentAttemptSchema = new mongoose.Schema({
  idempotencyKey: { type: String, required: true },
  razorpayPaymentId: { type: String },
  status: { type: String, enum: ["SUCCESS", "FAILED"], required: true },
  failureReason: { type: String },
  attemptedAt: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // Price locked in at time of purchase
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: { type: String, required: true },

    // NEW FIELDS FOR RAZORPAY & RETRIES
    razorpayOrderId: { type: String, required: true },
    retryCount: { type: Number, default: 0 },
    maxRetries: { type: Number, default: 2 }, // Maximum 2 retries (3 total attempts)
    paymentAttempts: [paymentAttemptSchema],

    orderStatus: {
      type: String,
      enum: ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Exhausted_Retries"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
