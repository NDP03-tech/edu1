const Class = require ('../models/Class');
const Question = require('../models/Question');
const Quiz = require('../models/Quiz');
const mongoose = require('mongoose');

// Tạo lớp mới
exports.deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.findByIdAndDelete(req.params.classId);
    if (!deletedClass) {
      return res.status(404).json({ message: 'Class not found' });
    }
    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (err) {
    console.error('Error deleting class:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


exports.getAllClasses = async (req, res) => {
  try {
    const classes = await Class.find();
    res.json(classes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch classes' });
  }
};
exports.getClassById = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }
    res.json(classData);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.createClass = async (req, res) => {
  try {
    const newClass = new Class(req.body);
    await newClass.save();
    res.status(201).json(newClass);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Gán user vào lớp
exports.addUserToClass = async (req, res) => {
  const { classId } = req.params;
  const { userId } = req.body;

  try {
    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ error: 'Class not found' });

    if (!classDoc.students.includes(userId)) {
      classDoc.students.push(userId);
      await classDoc.save();
    }

    res.json({ message: 'User added to class', class: classDoc });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Gán quiz vào lớp
exports.addQuizToClass = async (req, res) => {
  const { classId } = req.params;
  const { quizId } = req.body;

  try {
    const classDoc = await Class.findById(classId);
    if (!classDoc) return res.status(404).json({ error: 'Class not found' });

    if (!classDoc.quizzes.includes(quizId)) {
      classDoc.quizzes.push(quizId);
      await classDoc.save();
    }

    res.json({ message: 'Quiz added to class', class: classDoc });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Lấy danh sách quiz của lớp

exports.getQuizzesOfClass = async (req, res) => {
  const { classId } = req.params;

  // Kiểm tra hợp lệ trước khi convert sang ObjectId
  if (!mongoose.Types.ObjectId.isValid(classId)) {
    return res.status(400).json({ error: 'Invalid class ID format' });
  }

  try {
    const objectId = new mongoose.Types.ObjectId(classId);
    const quizzes = await Quiz.find({ classes: objectId });
    console.log("Fetching quizzes for class:", classId);
    console.log("Found quizzes:", quizzes);

    res.json(quizzes);
  } catch (err) {
    console.error("Error fetching quizzes:", err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


// Lấy danh sách học sinh của lớp
exports.getStudentsOfClass = async (req, res) => {
  const { classId } = req.params;

  try {
    const classDoc = await Class.findById(classId).populate('students');
    if (!classDoc) return res.status(404).json({ message: 'Class not found' });

    res.json(classDoc.students);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addStudentsToClass = async (req, res) => {
  const { classId } = req.params;
  const { studentIds } = req.body; // mảng các ID sinh viên

  try {
    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      return res.status(404).json({ message: 'Class not found' });
    }

    // Dùng $addToSet để đảm bảo không thêm trùng sinh viên
    await Class.findByIdAndUpdate(classId, {
      $addToSet: { students: { $each: studentIds } }
    });

    res.status(200).json({ message: 'Students added successfully' });
  } catch (err) {
    console.error('Error adding students to class:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.moveStudents = async (req, res) => {
  const { studentIds, fromClassId, toClassId } = req.body;

  try {
    // Bỏ học sinh khỏi lớp cũ
    await Class.findByIdAndUpdate(fromClassId, {
      $pull: { students: { $in: studentIds } },
    });

    // Thêm học sinh vào lớp mới
    await Class.findByIdAndUpdate(toClassId, {
      $addToSet: { students: { $each: studentIds } },
    });

    res.status(200).json({ message: 'Students moved successfully' });
  } catch (err) {
    console.error('Error moving students:', err);
    res.status(500).json({ message: 'Error moving students' });
  }
};
