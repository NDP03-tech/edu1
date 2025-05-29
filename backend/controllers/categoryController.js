const Category = require('/Users/nguyendacphuc/Downloads/edu/edu1/backend/models/Category.js');

// Lấy tất cả danh mục
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Tạo danh mục mới
exports.createCategory = async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ message: 'Category name is required.' });

  try {
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists.' });
    }

    const category = new Category({ name });
    await category.save();
    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
