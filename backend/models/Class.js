const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ClassSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  teacher: { type: Schema.Types.ObjectId, ref: 'User' },
  students: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  quizzes: [{ type: Schema.Types.ObjectId, ref: 'Quiz' }] // Gắn danh sách Quiz
}, { timestamps: true });

module.exports = mongoose.model('Class', ClassSchema);
