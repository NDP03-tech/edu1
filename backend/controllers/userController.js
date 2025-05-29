const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Class = require('../models/Class'); // ❗️BẠN QUÊN DÒNG NÀY
const Quiz = require('../models/Quiz');
const UserQuizResult = require('../models/UserQuizResult');

// Đăng nhập
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '4h' });

        res.json({ token, user: { email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Đăng ký
const register = async (req, res) => {
    const { email, password, role } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already exists' });

        const user = new User({ email, password, role });
        await user.save();
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Lấy tất cả người dùng
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Thêm người dùng
const addUser = async (req, res) => {
    const {
        email,
        password,
        role,
        firstName,
        lastName,
        studentPhone,
        guardianPhone,
        studentEmail,
        guardianEmail,
        address
    } = req.body;

    try {
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already exists' });

        const user = new User({
            email,
            password,
            plainPassword: password,
            role,
            firstName,
            lastName,
            studentPhone,
            guardianPhone,
            studentEmail,
            guardianEmail,
            address
        });

        await user.save();
        res.status(201).json({ message: 'User added successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Cập nhật người dùng
const bcrypt = require('bcrypt');

const updateUser = async (req, res) => {
    const { id } = req.params;
    let updatedData = { ...req.body };

    try {
        // Nếu có password, hash nó trước
        if (updatedData.password) {
            const salt = await bcrypt.genSalt(10);
            updatedData.password = await bcrypt.hash(updatedData.password, salt);
        }

        const user = await User.findByIdAndUpdate(id, updatedData, {
            new: true,
            runValidators: true,
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


// Xóa người dùng
const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await User.findByIdAndDelete(id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Tạo tài khoản admin
const createAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const adminUser = new User({ email, password, role: 'admin' });
        await adminUser.save();
        res.status(201).json({ message: 'Admin created', user: adminUser });
    } catch (error) {
        res.status(400).json({ message: 'Error creating admin' });
    }
};
const getQuizzesForUser = async (req, res) => {
    try {
      const { userId } = req.params;
  
      // Tìm tất cả lớp học có học sinh này
      const classes = await Class.find({ students: userId }).select('_id');
      const classIds = classes.map(cls => cls._id);
  
      // Tìm quiz thuộc các lớp đó
      const quizzes = await Quiz.find({ classes: { $in: classIds } });
  
      // Với mỗi quiz, kiểm tra kết quả cao nhất của học sinh
      const results = await UserQuizResult.find({
        user: userId,
        quiz: { $in: quizzes.map(q => q._id) },
        completed: true
      });
  
      const resultMap = {};
      results.forEach(result => {
        resultMap[result.quiz.toString()] = result.passed;
      });
  
      const quizzesWithStatus = quizzes.map(q => ({
        ...q.toObject(),
        passed: resultMap[q._id.toString()] || false
      }));
  
      res.json(quizzesWithStatus);
    } catch (error) {
      console.error('Error fetching quizzes for user:', error);
      res.status(500).json({ message: 'Lỗi khi lấy quiz cho học sinh', error });
    }
  };
  
  


module.exports = {
    login,
    register,
    createAdmin,
    getUsers,
    addUser,
    updateUser,
    deleteUser,
    getQuizzesForUser,
};

