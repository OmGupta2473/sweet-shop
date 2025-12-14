const express = require('express');
const router = express.Router();
const { createSweet, getSweets, getSweetById, updateSweet, deleteSweet, searchSweets, purchaseSweet, restockSweet } = require('../controllers/sweetController');
const auth = require('../middleware/authMiddleware');
const admin = require('../middleware/adminMiddleware');

router.get('/', auth, getSweets);
router.get('/search', auth, searchSweets);
router.get('/:id', auth, getSweetById);
router.post('/', auth, admin, createSweet);
router.put('/:id', auth, admin, updateSweet);
router.delete('/:id', auth, admin, deleteSweet);

// Inventory: purchase and restock
router.post('/:id/purchase', auth, purchaseSweet);
router.post('/:id/restock', auth, admin, restockSweet);

module.exports = router;
