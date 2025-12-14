const Sweet = require('../models/Sweet');
const mongoose = require('mongoose');

exports.createSweet = async (req, res) => {
  try {
    const { name, category, price, quantity } = req.body;
    if (!name || !category || typeof price === 'undefined' || typeof quantity === 'undefined') {
      return res.status(400).json({ message: 'name, category, price and quantity are required' });
    }
    const exists = await Sweet.findOne({ name });
    if (exists) return res.status(400).json({ message: 'Sweet with that name already exists' });
    const sweet = await Sweet.create({ name, category, price, quantity });
    res.status(201).json(sweet);
  } catch (err) {
    console.error('Create sweet error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSweets = async (req, res) => {
  try {
    const sweets = await Sweet.find({});
    res.json(sweets);
  } catch (err) {
    console.error('List sweets error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSweetById = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: 'Sweet not found' });
    res.json(sweet);
  } catch (err) {
    console.error('Get sweet error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateSweet = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: 'Sweet not found' });
    const { name, category, price, quantity } = req.body;
    if (name && name !== sweet.name) {
      // ensure unique
      const exists = await Sweet.findOne({ name });
      if (exists) return res.status(400).json({ message: 'Sweet with that name already exists' });
      sweet.name = name;
    }
    sweet.category = category ?? sweet.category;
    sweet.price = price ?? sweet.price;
    sweet.quantity = typeof quantity === 'number' ? quantity : sweet.quantity;
    await sweet.save();
    res.json(sweet);
  } catch (err) {
    console.error('Update sweet error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

const { removeSweetFromAllCarts } = require('./cartAdmin');
exports.deleteSweet = async (req, res) => {
  try {
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: 'Sweet not found' });
    await Sweet.deleteOne({ _id: req.params.id });
    await removeSweetFromAllCarts(req.params.id);
    res.json({ message: 'Sweet deleted' });
  } catch (err) {
    console.error('Delete sweet error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search sweets by name, category or price range (minPrice, maxPrice)
exports.searchSweets = async (req, res) => {
  try {
    const { name, category, minPrice, maxPrice } = req.query;
    const filters = {};
    if (name) filters.name = { $regex: new RegExp(name, 'i') };
    if (category) filters.category = category;
    if (typeof minPrice !== 'undefined' || typeof maxPrice !== 'undefined') {
      filters.price = {};
      if (typeof minPrice !== 'undefined') filters.price.$gte = Number(minPrice);
      if (typeof maxPrice !== 'undefined') filters.price.$lte = Number(maxPrice);
    }
    const sweets = await Sweet.find(filters);
    res.json(sweets);
  } catch (err) {
    console.error('Search sweets error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Purchase: decrease quantity by 1 (or quantity in body)
exports.purchaseSweet = async (req, res) => {
  try {
    const qty = Number((req.body?.quantity) ?? 1);
    if (!Number.isInteger(qty) || qty <= 0) return res.status(400).json({ message: 'Invalid quantity' });
    const id = req.params.id;
    // Atomically decrease quantity if enough stock
    const sweet = await Sweet.findOneAndUpdate(
      { _id: id, quantity: { $gte: qty } },
      { $inc: { quantity: -qty } },
      { new: true }
    );
    if (!sweet) {
      // Could be not found or insufficient stock
      const exists = await Sweet.exists({ _id: id });
      if (!exists) return res.status(404).json({ message: 'Sweet not found' });
      return res.status(400).json({ message: 'Insufficient quantity' });
    }
    res.json({ message: 'Purchase successful', sweet });
  } catch (err) {
    console.error('Purchase sweet error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Restock: admin only, increase quantity by body.quantity
exports.restockSweet = async (req, res) => {
  try {
    const qty = Number((req.body?.quantity) ?? 0);
    if (!Number.isInteger(qty) || qty <= 0) return res.status(400).json({ message: 'Invalid quantity' });
    const sweet = await Sweet.findById(req.params.id);
    if (!sweet) return res.status(404).json({ message: 'Sweet not found' });
    sweet.quantity += qty;
    await sweet.save();
    res.json({ message: 'Restock successful', sweet });
  } catch (err) {
    console.error('Restock sweet error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
