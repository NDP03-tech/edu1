const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const Quiz = require('../models/Quiz');

// GET tất cả danh mục
router.get('/', categoryController.getAllCategories);

// POST tạo danh mục mới
router.post('/', categoryController.createCategory);

// GET tất cả quiz thuộc một danh mục
router.get('/:category/quizzes', async (req, res) => {
  try {
    const { category } = req.params;
    const quizzes = await Quiz.find({ category });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
