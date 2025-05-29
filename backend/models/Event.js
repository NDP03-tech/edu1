const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    image: { type: String, required: true },
    bannerImg: { type: String, required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    category: { type: String, required: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    cost: { type: String, required: true },
    host: { type: String, required: true },
    content: { type: String, required: true },
    phone: { type: String, required: true },
});

module.exports = mongoose.model('Event', eventSchema);