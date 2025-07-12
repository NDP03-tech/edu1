const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
    image: { type: String, required: true },
    bannerImg: { type: String, required: false },
    name: { type: String, required: true },
    author: { type: String, required: true },
    authorImg: { type: String, required: false },
    lesson: { type: String, required: true },
    price: { type: String, required: true },
    duration: { type: String, required: true },
    type: { type: String, required: true },
    language: { type: String, required: true },
    content: { type: String, required: true },
    title: { type: String, required: true },
    dis: { type: String, required: true },
    schedule: { type: [String], required: true }, // Mảng các ngày
    createdAt: { type: Date, default: Date.now }  // Thêm trường ngày tạo
});

module.exports = mongoose.model('Course', courseSchema);