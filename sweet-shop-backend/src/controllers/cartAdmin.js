const Cart = require('../models/Cart');

// Remove a sweet from all carts (used after sweet deletion)
exports.removeSweetFromAllCarts = async (sweetId) => {
  try {
    await Cart.updateMany({}, { $pull: { items: { sweet: sweetId } } });
  } catch (err) {
    console.error('Remove sweet from all carts error', err);
  }
};
