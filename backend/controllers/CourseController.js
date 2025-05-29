const Course = require('../models/Course');
const cloudinary = require('../utils/cloudinaryConfig');
const mongoose = require('mongoose');

// Hàm upload ảnh lên Cloudinary
const uploadImageToCloudinary = (fileBuffer) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
        });
        uploadStream.end(fileBuffer);
    });
};

// Tạo khóa học (có upload ảnh)
exports.createCourse = async (req, res) => {
    try {
        const courseData = req.body;
        let imageUrl = '';

        // Upload ảnh lên Cloudinary nếu có file
        if (req.file) {
            imageUrl = await uploadImageToCloudinary(req.file.buffer);
        }

        // Thêm URL ảnh vào courseData
        const newCourse = new Course({
            ...courseData,
            image: imageUrl,
        });

        await newCourse.save();
        res.status(201).json({ message: 'Course created successfully', course: newCourse });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(400).json({ message: 'Error creating course', error });
    }
};

// Lấy khóa học theo ID
exports.getCourseById = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID có hợp lệ không trước khi truy vấn
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID không hợp lệ" });
        }

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Error fetching course', error });
    }
};

// Lấy tất cả khóa học
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json(courses);
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Error fetching courses', error });
    }
};

// Cập nhật khóa học (có upload ảnh mới nếu cần)
exports.updateCourse = async (req, res) => {
    try {
        const { id } = req.params;
        let updatedData = req.body;

        // Upload ảnh mới nếu có
        if (req.file) {
            updatedData.image = await uploadImageToCloudinary(req.file.buffer);
        }

        const updatedCourse = await Course.findByIdAndUpdate(id, updatedData, { new: true });
        if (!updatedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course updated successfully', updatedCourse });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(400).json({ message: 'Error updating course', error });
    }
};

// Xóa khóa học
exports.deleteCourse = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCourse = await Course.findByIdAndDelete(id);
        if (!deletedCourse) {
            return res.status(404).json({ message: 'Course not found' });
        }
        res.status(200).json({ message: 'Course deleted successfully', deletedCourse });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Error deleting course', error });
    }
};