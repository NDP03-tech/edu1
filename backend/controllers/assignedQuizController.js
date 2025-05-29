const Class = require('../models/Class');
const Quiz = require('../models/Quiz');

// Lấy các quiz được giao cho user đang đăng nhập
exports.getAssignedQuizzesForUser = async (req, res) => {
  const userId = req.user._id; // hoặc req.user.id tùy theo bạn set trong middleware

  try {
    // Tìm tất cả các lớp mà user này là học sinh
    const classes = await Class.find({ students: userId });

    const quizIds = new Set(); // Dùng Set để tránh trùng

    classes.forEach(cls => {
      cls.quizzes.forEach(qz => quizIds.add(qz.toString()));
    });

    const quizzes = await Quiz.find({ _id: { $in: Array.from(quizIds) } });

    res.status(200).json(quizzes);
  } catch (err) {
    console.error('Error fetching assigned quizzes:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
