const express = require('express');
const router = express.Router();
const userQuizResultController = require('../controllers/userQuizResultController');
const authenticateToken = require('../middleware/authenticateToken');
router.use(authenticateToken);

router.post("/start/:quizId", authenticateToken,userQuizResultController.startAttempt);

// Lưu tạm thời (nếu muốn dùng)
router.post("/temp/:resultId",authenticateToken, userQuizResultController.tempSave);

// Nộp bài
router.post("/submit/:resultId", authenticateToken,userQuizResultController.submitAttempt);

// Lấy attempt gần nhất
router.get("/latest/:quizId", authenticateToken,userQuizResultController.getLatestResult);

// Lấy toàn bộ attempt của user với quiz
router.get("/attempts/:quizId",authenticateToken, userQuizResultController.getAllAttempts);

// routes/userQuizResultRoutes.js
router.get('/user-summary/:userId', authenticateToken, userQuizResultController.getUserQuizSummaryByUserId);
router.get('/best-attempts/:quizId', authenticateToken, userQuizResultController.getBestAttemptsByQuiz);
router.get('/quiz/:quizId/best-attempts', userQuizResultController.getUsersBestAttemptsByQuiz);
router.get('/user/results-stats', authenticateToken, userQuizResultController.getUserResultsStats);
module.exports = router;
