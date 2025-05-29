const Event = require('../models/Event'); // Mô hình Event
const cloudinary = require('../utils/cloudinaryConfig'); // Cấu hình Cloudinary
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

// Tạo sự kiện mới
exports.createEvent = async (req, res) => {
    try {
        const eventData = req.body;

        // Kiểm tra xem có file ảnh không và upload nếu có
        if (req.file) {
            eventData.image = await uploadImageToCloudinary(req.file.buffer);
            if (!eventData.image) {
                return res.status(400).json({ message: 'Lỗi khi upload ảnh' });
            }
        } else if (!eventData.image) {
            return res.status(400).json({ message: 'Trường image là bắt buộc' });
        }

        // Tạo sự kiện mới
        const newEvent = new Event({
            id: Date.now(), // Hoặc một cách tạo id khác nếu cần
            title: eventData.title,
            content: eventData.content,
            date: eventData.date,
            startTime: eventData.startTime,
            category: eventData.category,
            location: eventData.location,
            cost: eventData.cost,
            host: eventData.host,
            image: eventData.image,
            bannerImg: eventData.bannerImg,
            phone: eventData.phone,
        });

        // Lưu sự kiện vào cơ sở dữ liệu
        await newEvent.save();
        res.status(201).json({ message: 'Sự kiện đã được tạo thành công', event: newEvent });
    } catch (error) {
        console.error('Lỗi khi tạo sự kiện:', error);
        res.status(400).json({ message: 'Lỗi khi tạo sự kiện', error: error.message });
    }
};

// Lấy sự kiện theo ID
exports.getEventById = async (req, res) => {
    const { id } = req.params;

    try {
        const event = await Event.findOne({ id: id }); // Tìm kiếm theo trường id
        if (!event) {
            return res.status(404).json({ message: 'Sự kiện không tồn tại' });
        }
        res.status(200).json(event);
    } catch (error) {
        console.error('Lỗi khi lấy sự kiện:', error);
        res.status(500).json({ message: 'Lỗi khi lấy sự kiện', error: error.message });
    }
};

// Lấy tất cả sự kiện
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json(events);
    } catch (error) {
        console.error('Lỗi khi lấy sự kiện:', error);
        res.status(500).json({ message: 'Lỗi khi lấy sự kiện', error: error.message });
    }
};

// Cập nhật sự kiện
exports.updateEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID có phải là ObjectId hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }

        let updatedData = req.body;

        if (req.file) {
            updatedData.image = await uploadImageToCloudinary(req.file.buffer);
        }

        // Tìm và cập nhật sự kiện
        const updatedEvent = await Event.findOneAndUpdate({ id: id }, updatedData, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ message: 'Sự kiện không tồn tại' });
        }
        res.status(200).json({ message: 'Sự kiện đã được cập nhật thành công', updatedEvent });
    } catch (error) {
        console.error('Lỗi khi cập nhật sự kiện:', error);
        res.status(400).json({ message: 'Lỗi khi cập nhật sự kiện', error: error.message });
    }
};

// Xóa sự kiện
exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;

        // Kiểm tra ID có phải là ObjectId hợp lệ không
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'ID không hợp lệ' });
        }

        // Sử dụng id để tìm và xóa sự kiện
        const deletedEvent = await Event.findOneAndDelete({ id: id });

        if (!deletedEvent) {
            return res.status(404).json({ message: 'Sự kiện không tồn tại' });
        }

        res.status(200).json({ message: 'Sự kiện đã được xóa thành công', deletedEvent });
    } catch (error) {
        console.error('Lỗi khi xóa sự kiện:', error);
        res.status(500).json({ message: 'Lỗi khi xóa sự kiện', error: error.message });
    }
};