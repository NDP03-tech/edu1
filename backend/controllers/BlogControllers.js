const Post = require('../models/Blog');
const mongoose = require('mongoose');

// Tạo bài viết mới
exports.createPost = async (req, res) => {
    try {
        const { title, content, author, authorImg, image, bannerImg } = req.body;

        // Kiểm tra các trường bắt buộc
        if (!title || !content || !author || !authorImg || !image || !bannerImg) {
            return res.status(400).json({ message: 'Vui lòng điền đầy đủ thông tin' });
        }

        const newPost = new Post({
            title,
            content,
            author,
            authorImg,
            image,
            bannerImg
        });

        await newPost.save();
        res.status(201).json({ message: 'Bài viết đã được tạo thành công', post: newPost });
    } catch (error) {
        console.error('Lỗi khi tạo bài viết:', error);
        res.status(500).json({ message: 'Lỗi khi tạo bài viết', error: error.message });
    }
};

// Lấy bài viết theo ID
exports.getPostById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('Lỗi khi lấy bài viết:', error);
        res.status(500).json({ message: 'Lỗi khi lấy bài viết', error: error.message });
    }
};

// Lấy tất cả bài viết
exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        console.error('Lỗi khi lấy bài viết:', error);
        res.status(500).json({ message: 'Lỗi khi lấy bài viết', error: error.message });
    }
};

// Cập nhật bài viết
exports.updatePost = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    try {
        const updatedPost = await Post.findByIdAndUpdate(id, req.body, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }
        res.status(200).json({ message: 'Bài viết đã được cập nhật thành công', updatedPost });
    } catch (error) {
        console.error('Lỗi khi cập nhật bài viết:', error);
        res.status(400).json({ message: 'Lỗi khi cập nhật bài viết', error: error.message });
    }
};

// Xóa bài viết
exports.deletePost = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'ID không hợp lệ' });
    }

    try {
        const deletedPost = await Post.findByIdAndDelete(id);
        if (!deletedPost) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }
        res.status(200).json({ message: 'Bài viết đã được xóa thành công', deletedPost });
    } catch (error) {
        console.error('Lỗi khi xóa bài viết:', error);
        res.status(500).json({ message: 'Lỗi khi xóa bài viết', error: error.message });
    }
};
