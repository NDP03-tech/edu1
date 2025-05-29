const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    firstName: { type: String }, // Tên
    lastName: { type: String }, // Họ
    studentPhone: { type: String}, // Số điện thoại học sinh
    guardianPhone: { type: String }, // Số điện thoại phụ huynh
    studentEmail: { type: String}, // Email của học sinh
    guardianEmail: { type: String }, // Email của phụ huynh
    address: { type: String } // Địa chỉ nhà
});

// Mã hóa mật khẩu trước khi lưu
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// So sánh mật khẩu
UserSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);