const Quiz = require('/Users/nguyendacphuc/Downloads/edu/edu1/backend/models/Quiz.js')
const Question = require ('../models/Question');

// Tạo quiz mới
// Tạo quiz mới (chỉ lưu thông tin quiz, không chứa câu hỏi)
exports.createQuiz = async (req, res) => {
    try {
        const quizData = req.body;

        const newQuiz = new Quiz({
            ...quizData,
            createdAt: Date.now(),
            questions: [], // Mặc định rỗng, sẽ thêm sau
        });

        await newQuiz.save();

        res.status(201).json(newQuiz);
    } catch (error) {
        console.error("Lỗi khi tạo quiz:", error);
        res.status(400).json({ message: error.message });
    }
};


// Lấy danh sách quiz
exports.getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate('questions');
        res.status(200).json(quizzes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Lấy quiz theo ID
exports.getQuizById = async (req, res) => {
    const { id } = req.params;

    try {
        const quiz = await Quiz.findById(id).populate('questions');
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.status(200).json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật quiz
exports.updateQuiz = async (req, res) => {
    const { id } = req.params;
    const { questions, ...quizData } = req.body;

    try {
        const quiz = await Quiz.findById(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Cập nhật thông tin cơ bản
        Object.assign(quiz, quizData);

        if (questions && questions.length > 0) {
            // Xóa toàn bộ câu hỏi cũ
            await Question.deleteMany({ quiz_id: quiz._id });

            // Tạo lại câu hỏi mới
            const questionPromises = questions.map(async (question) => {
                const newQuestion = new Question({
                    quiz_id: quiz._id,
                    ...question
                });
                await newQuestion.save();
                return newQuestion._id;
            });

            const questionIds = await Promise.all(questionPromises);
            quiz.questions = questionIds;
        }

        await quiz.save();
        await quiz.populate('questions'); // 🔥 Quan trọng để trả về dữ liệu đầy đủ

        res.status(200).json(quiz);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};


// Xoá quiz
exports.deleteQuiz = async (req, res) => {
    const { id } = req.params;

    try {
        const quiz = await Quiz.findByIdAndDelete(id);
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }

        // Xoá tất cả câu hỏi liên quan
        await Question.deleteMany({ quiz_id: id });

        res.status(200).json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};



// Lấy danh sách quiz theo category
exports.getQuizzesByCategory = async (req, res) => {
  const categoryName = req.params.category;

  try {
    const quizzes = await Quiz.find({ category: categoryName });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
