const mongoose = require('mongoose');

// Sub-schema cho một gap
const gapSchema = new mongoose.Schema({
  correct_answers: { type: [String], required: true },
  position: { type: Number, required: true },
  length: { type: Number, required: true },
});

// Sub-schema cho một tùy chọn (option)
const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

// Sub-schema cho một dropdown
const dropdownSchema = new mongoose.Schema({
  options: { type: [String], required: true },  
  correct_answer: { type: String, required: true },
  position: { type: Number, required: true },
  length: { type: Number, required: true },
});

// Sub-schema cho một hint word
const hintWordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  hint: { type: String, required: true },
});

const questionSchema = new mongoose.Schema({
  quiz_id: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Quiz' },
  question_text: { type: String, required: true },
  readingContent: { type: String },
  points: { type: Number, default: 0 },
  explanation: { type: String },
  question_type: {
    type: String,
    required: true,
    enum: [
      'blank-boxes',
      'generated-dropdowns',
      'drag-drop-matching',
      'find-highlight',
      'multiple-choice',
      'checkboxes',
      'essay',
      'description',
      'reading',
      'speaking'
    ],
  },
  gaps: [gapSchema],
  dropdowns: [dropdownSchema],
  hintWords: [hintWordSchema],
  options: [optionSchema],
}, { timestamps: true });

module.exports = mongoose.model('Question', questionSchema);
