const express = require('express');
const router = express.Router();
const classController = require('../controllers/classController');

// Tạo lớp mới
router.post('/', classController.createClass);
router.get('/', classController.getAllClasses);
router.get('/:classId', classController.getClassById);

// Gán user vào lớp
router.post('/:classId/add-user', classController.addUserToClass);

// Gán quiz vào lớp
router.post('/:classId/add-quiz', classController.addQuizToClass);

// Lấy danh sách quiz của lớp
router.delete('/:classId', classController.deleteClass);
router.get('/:classId/quizzes', classController.getQuizzesOfClass);
// Lấy danh sách học sinh của lớp
router.get('/:classId/students', classController.getStudentsOfClass);
router.post('/:classId/students', classController.addStudentsToClass);
router.post('/move-students', classController.moveStudents);

module.exports = router;
