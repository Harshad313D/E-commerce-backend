import Cart from "../../Models/cart.js";
import Product from "../../Models/product.js";

// Get user's cart
export const getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    // .populate() pulls in the actual product details, not just the ID
    const cart = await Cart.findOne({ userId })
    .populate(
      "items.productId",
      "name price imageUrl stock",
    );

    if (!cart) {
      return res.status(200).json({ message: "Cart is empty", items: [] });
    }

    res.status(200).json(cart);

  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch cart", error: error.message });
  }
};

// Add item to cart or update quantity
export const addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    // Check if product exists and has stock
    const product = await Product.findById(productId);

    if (!product) return res.status(404).json({ message: "Product not found" });
    
    if (product.stock < quantity)
      return res.status(400).json({ message: "Not enough stock" });

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart if user doesn't have one

      cart = new Cart({
        userId,
        items: [{ productId, quantity }],
      });

    } else {
      // Check if product already exists in cart
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId,
      );

      if (itemIndex > -1) {
        // Update quantity if it exists
        cart.items[itemIndex].quantity += quantity;
      } else {
        // Add new item
        cart.items.push({ productId, quantity });
      }
    }

    await cart.save();

    // Return populated cart
    const updatedCart = await Cart.findById(cart._id).populate(
      "items.productId",
      "name price imageUrl",
    );
    res.status(200).json({ message: "Added to cart", cart: updatedCart });
    
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to add to cart", error: error.message });
  }
};

// Remove item from cart
export const removeFromCart = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart });
    
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to remove item", error: error.message });
  }
};

// Increase or Decrease item quantity
export const updateCartItemQuantity = async (req, res) => {
  try {
    const { userId, productId, action } = req.body;

    // 1. Find the cart
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: "Cart not found" });

    // 2. Find the item in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // 3. Handle the "increase" or "decrease" action
    if (action === "increase") {
      // Check stock before increasing
      const product = await Product.findById(productId);
      if (!product) return res.status(404).json({ message: "Product not found" });
      
      if (cart.items[itemIndex].quantity + 1 > product.stock) {
        return res.status(400).json({ message: "Not enough stock" });
      }
      
      cart.items[itemIndex].quantity += 1;

    } else if (action === "decrease") {
      // Decrease quantity, but if it hits 0, remove the item entirely
      if (cart.items[itemIndex].quantity > 1) {
        cart.items[itemIndex].quantity -= 1;
      } else {
        cart.items.splice(itemIndex, 1); // Removes the item from the array
      }
    } else {
      return res.status(400).json({ message: "Invalid action. Use 'increase' or 'decrease'." });
    }


    // 4. Save and return updated cart
    await cart.save();

    const updatedCart = await Cart.findById(cart._id).populate(
      "items.productId",
      "name price imageUrl stock"
    );

    res.status(200).json({ message: `Quantity ${action}d`, cart: updatedCart });
  } catch (error) {
    res.status(500).json({ message: "Failed to update quantity", error: error.message });
  }
};