const Cart = require('../models/Cart');
const Sweet = require('../models/Sweet');

// Add to cart (does not decrease stock)
exports.addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sweetId, quantity } = req.body;
    const qty = Number(quantity) || 1;
    if (!sweetId || qty <= 0) return res.status(400).json({ message: 'Invalid input' });
    const sweet = await Sweet.findById(sweetId);
    if (!sweet) return res.status(404).json({ message: 'Sweet not found' });
    if (sweet.quantity < qty) return res.status(400).json({ message: 'Insufficient stock' });
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });
    const item = cart.items.find(i => i.sweet.toString() === sweetId);
    if (item) {
      if (sweet.quantity < item.quantity + qty) return res.status(400).json({ message: 'Insufficient stock' });
      item.quantity += qty;
    } else {
      cart.items.push({ sweet: sweetId, quantity: qty });
    }
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error('Add to cart error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove from cart
exports.removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { sweetId } = req.body;
    let cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(i => i.sweet.toString() !== sweetId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    console.error('Remove from cart error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId }).populate('items.sweet');
    if (!cart) cart = await Cart.create({ user: userId, items: [] });
    res.json(cart);
  } catch (err) {
    console.error('Get cart error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Clear cart (after purchase)
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user._id;
    let cart = await Cart.findOne({ user: userId });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared' });
  } catch (err) {
    console.error('Clear cart error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
