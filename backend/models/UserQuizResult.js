const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  question: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
  type: { type: String, required: true }, // e.g. 'gap-fill', 'dropdown', etc.

  // Dữ liệu người dùng nhập/chọn
  answer: Schema.Types.Mixed,             // VD: ["think", "miracles", "make"] hoặc "C" hoặc object

  // Snapshot đáp án đúng tại thời điểm làm bài
  correctAnswer: Schema.Types.Mixed,      // VD: ["think", "miracles", "make"]

  // So sánh chi tiết giữa answer và correctAnswer
  comparisonResult: Schema.Types.Mixed,   // VD: [true, false, true] hoặc object

  isCorrect: { type: Boolean },           // Câu này đúng toàn bộ?
  pointsAwarded: { type: Number },        // Điểm câu này
});

const userQuizResultSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  answers: [answerSchema], // Danh sách câu trả lời

  score: { type: Number, default: 0 },        // Tổng điểm
  passed: { type: Boolean, default: false },  // ≥ 90% thì true
  startedAt: { type: Date, default: Date.now },
  submittedAt: { type: Date },

  attemptNumber: { type: Number, default: 1 }, // Lần làm thứ mấy
}, { timestamps: true });

// Index để truy vấn kết quả cao nhất nhanh
userQuizResultSchema.index({ user: 1, quiz: 1, score: -1 });

module.exports = mongoose.model('UserQuizResult', userQuizResultSchema);
