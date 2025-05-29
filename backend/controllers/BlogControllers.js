const Post = require('../models/Blog');
const cloudinary = require('../utils/cloudinaryConfig');
const mongoose = require('mongoose');

const uploadImageToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
        });
        uploadStream.end(fileBuffer);
    });
};

exports.createPost = async (req, res) => {
    try {
        const postData = req.body;

        // Kiểm tra xem có file ảnh không và upload nếu có
        if (req.file) {
            postData.image = await uploadImageToCloudinary(req.file.buffer);
            if (!postData.image) {
                return res.status(400).json({ message: 'Lỗi khi upload ảnh' });
            }
        } else if (!postData.image) {
            return res.status(400).json({ message: 'Trường image là bắt buộc' });
        }

        // Tạo bài viết mới
        const newPost = new Post({
            id: Date.now(), // Hoặc một cách tạo id khác nếu cần
            title: postData.title,
            content: postData.content,
            author: postData.author,
            authorImg: postData.authorImg,
            image: postData.image,
            bannerImg: postData.bannerImg,
        });

        // Lưu bài viết vào cơ sở dữ liệu
        await newPost.save();
        res.status(201).json({ message: 'Bài viết đã được tạo thành công', post: newPost });
    } catch (error) {
        console.error('Lỗi khi tạo bài viết:', error);
        res.status(400).json({ message: 'Lỗi khi tạo bài viết', error: error.message });
    }
};
exports.getPostById = async (req, res) => {
    const { id } = req.params;

    // Kiểm tra ID có phải là ObjectId hợp lệ không (nếu cần)
    // Nếu bạn chỉ muốn kiểm tra định dạng của id, có thể bỏ qua kiểm tra ObjectId
    // if (!mongoose.Types.ObjectId.isValid(id)) {
    //     return res.status(400).json({ message: 'ID không hợp lệ' });
    // }

    try {
        const post = await Post.findOne({ id: id }); // Tìm kiếm theo trường id
        if (!post) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }
        res.status(200).json(post);
    } catch (error) {
        console.error('Lỗi khi lấy bài viết:', error);
        res.status(500).json({ message: 'Lỗi khi lấy bài viết', error: error.message });
    }
};

exports.getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find();
        res.status(200).json(posts);
    } catch (error) {
        console.error('Lỗi khi lấy bài viết:', error);
        res.status(500).json({ message: 'Lỗi khi lấy bài viết', error: error.message });
    }
};

exports.updatePost = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID có phải là ObjectId hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }

        let updatedData = req.body;

        if (req.file) {
            updatedData.image = await uploadImageToCloudinary(req.file.buffer);
        }

        // Tìm và cập nhật bài viết
        const updatedPost = await Post.findOneAndUpdate({ _id: id }, updatedData, { new: true });
        if (!updatedPost) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }
        res.status(200).json({ message: 'Bài viết đã được cập nhật thành công', updatedPost });
    } catch (error) {
        console.error('Lỗi khi cập nhật bài viết:', error);
        res.status(400).json({ message: 'Lỗi khi cập nhật bài viết', error: error.message });
    }
};
exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID có phải là ObjectId hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }

        // Sử dụng _id để tìm và xóa bài viết
        const deletedPost = await Post.findOneAndDelete({ _id: id });

        if (!deletedPost) {
            return res.status(404).json({ message: 'Bài viết không tồn tại' });
        }

        res.status(200).json({ message: 'Bài viết đã được xóa thành công', deletedPost });
    } catch (error) {
        console.error('Lỗi khi xóa bài viết:', error);
        res.status(500).json({ message: 'Lỗi khi xóa bài viết', error: error.message });
    }
};