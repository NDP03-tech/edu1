const Question = require ('/Users/nguyendacphuc/Downloads/edu/edu1/backend/models/Question.js')
// Shuffle utility
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Create Question
// Create Question
exports.createQuestion = async (req, res) => {
  try {
    const {
      quiz_id,
      questionText,
      questionType,
      points,
      explanation,
      gaps,
      options,
      dropdowns,
      hintWords,
      readingContent,
    } = req.body;

    // Map camelCase fields to snake_case schema fields
    const question = new Question({
      quiz_id,
      question_text: questionText,
      points,
      explanation,
      gaps,
      options,
      dropdowns,
      hintWords,
      question_type: questionType,
    });

    await question.save();

    const shuffledOptions = shuffleArray([...question.options]);
    res.status(201).json({ ...question.toObject(), options: shuffledOptions });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Update Question
exports.updateQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const question = await Question.findById(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Hỗ trợ cả camelCase và snake_case
    question.question_text = req.body.question_text ?? req.body.questionText ?? question.question_text;
    question.question_type = req.body.question_type ?? req.body.questionType ?? question.question_type;
    question.points = req.body.points ?? question.points;
    question.explanation = req.body.explanation ?? question.explanation;
    question.gaps = req.body.gaps ?? question.gaps;
    question.options = req.body.options ?? question.options;
    question.dropdowns = req.body.dropdowns ?? question.dropdowns;
    question.hintWords = req.body.hintWords ?? req.body.hint_words ?? question.hintWords;
    question.quiz_id = req.body.quiz_id ?? question.quiz_id;
    question.readingContent = req.body.readingContent ?? question.readingContent;

    await question.save();

    const shuffledOptions = shuffleArray([...question.options]);
    res.status(200).json({ ...question.toObject(), options: shuffledOptions });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// Delete Question
exports.deleteQuestion = async (req, res) => {
  const { id } = req.params;
  try {
    const question = await Question.findByIdAndDelete(id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get All Questions
exports.getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.find();
    res.status(200).json(questions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get Question by ID
exports.getQuestionById = async (req, res) => {
  const { id } = req.params;
  try {
    const question = await Question.findById(id);
    console.log("📤 Đang gửi về question_text:", question.question_text);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.status(200).json(question);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// Get Questions by Quiz ID
exports.getQuestionsByQuizId = async (req, res) => {
  const { quizId } = req.params;
  try {
    const questions = await Question.find({ quiz_id: quizId });
    res.status(200).json(questions);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
