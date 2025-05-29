const mongoose = require('mongoose');

// Gộp trực tiếp UI Settings
const uiSettingsSchema = new mongoose.Schema({
  oneQuestionPerPage: { type: Boolean, default: false },
  showQuestionNumbers: { type: Boolean, default: true },
  shuffle: {
    type: String,
    enum: ['none', 'questions', 'answers', 'both'],
    default: 'none',
  },
  timeLimit: { type: Number, default: 0 },
  maxAttempts: { type: String, default: 'Unlimited' },
  showFeedback: { type: Boolean, default: true },
  displayScore: { type: Boolean, default: true },
  specialChars: { type: String, default: '' },
  headerText: { type: String, default: '' },
  instructionText: { type: String, default: '' },
  quizCompleteMessage: { type: String, default: '' },
  showHeaderInput: { type: Boolean, default: false },
  showCompletionInput: { type: Boolean, default: false },
  showInstructionInput: { type: Boolean, default: false }
}, { _id: false });

const quizSchema = new mongoose.Schema({
  title: { type: String },
  category: { type: String },
  classes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Class' }],
  uiSettings: uiSettingsSchema,
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Quiz', quizSchema);
