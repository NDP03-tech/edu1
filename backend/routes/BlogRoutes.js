const express = require('express');
const router = express.Router();
const PostController = require('../controllers/BlogControllers');
const multer = require('multer');
const authenticateToken = require('../middleware/authenticateToken');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Route để tạo bài viết (kèm upload ảnh chính)
router.post('/create', authenticateToken, upload.single('image'), PostController.createPost);

// Route để lấy tất cả bài viết
router.get('/', PostController.getAllPosts);

// Route để cập nhật bài viết (kèm upload ảnh mới nếu cần)
router.put('/:id', authenticateToken, upload.single('image'), PostController.updatePost);

// Route để xóa bài viết
router.delete('/:id', authenticateToken, PostController.deletePost);

// Route để lấy chi tiết bài viết theo ID
router.get('/:id', PostController.getPostById);

module.exports = router;