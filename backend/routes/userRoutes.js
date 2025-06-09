const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const userController = require('../controllers/userController');
const authenticateToken = require('../middleware/authenticateToken');

const router = express.Router();

// Endpoint đăng nhập
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    console.log('Đang cố gắng đăng nhập với email:', email);

    const user = await User.findOne({ email });
    if (!user) {
        console.log('Không tìm thấy người dùng với email:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Kết quả so sánh:', isMatch);

    if (!isMatch) {
        console.log('Mật khẩu không chính xác cho email:', email);
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '4h' });

    // ✅ Đã thêm _id vào user trả về
    res.json({
        token,
        user: {
            _id: user._id,
            email: user.email,
            role: user.role
        }
    });
});

// Endpoint đăng ký người dùng
router.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
    }

    const user = new User({ email, password, role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
});

// Các route khác (chỉ Admin)
router.get('/users', authenticateToken, userController.getUsers);
router.post('/users', authenticateToken, userController.addUser);
router.put('/users/:id', authenticateToken, userController.updateUser);
router.delete('/users/:id',  userController.deleteUser);

// Tạo tài khoản admin
router.post('/create-admin', async (req, res) => {
    const { email, password } = req.body;

    console.log('Dữ liệu nhận được khi tạo admin:', req.body);

    try {
        const adminUser = new User({ email, password, role: 'admin' });
        await adminUser.save();

        res.status(201).json({ message: 'Admin user created successfully', user: adminUser });
    } catch (err) {
        console.error('Lỗi khi tạo admin:', err);
        res.status(400).json({ error: 'Có lỗi xảy ra khi tạo admin.' });
    }
});

// Lấy quiz cho người dùng cụ thể
router.get('/:userId/quizzes', userController.getQuizzesForUser);

module.exports = router;
