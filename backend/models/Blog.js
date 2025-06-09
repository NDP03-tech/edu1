const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    // ❌ id: { type: Number, required: true }, → xóa dòng này
    title: { type: String, required: true },
    image: { type: String, required: true },
    bannerImg: { type: String, required: true },
    author: { type: String, required: true },
    authorImg: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Post', postSchema);
