const UserQuizResult = require("../models/UserQuizResult");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");

exports.startAttempt = async (req, res) => {
  try {
    console.log("📥 req.user in startAttempt:", req.user);
    const { quizId } = req.params;
    const userId = req.user.id;

    const previousAttempts = await UserQuizResult.find({ user: userId, quiz: quizId });
    const attemptNumber = previousAttempts.length + 1;

    const newResult = await UserQuizResult.create({
      user: req.user.id,
      quiz: quizId,
      answers: [],
      attemptNumber,
    });

    console.log("🟢 New quiz attempt started");
    console.log(`👤 User: ${userId}`);
    console.log(`📘 Quiz: ${quizId}`);
    console.log(`🔢 Attempt number: ${attemptNumber}`);
    console.log(`🆔 Result ID: ${newResult._id}`);

    res.json(newResult);
  } catch (err) {
    console.error("❌ Error in startAttempt:", err);
    res.status(500).json({ error: "Failed to start attempt" });
  }
};

exports.tempSave = async (req, res) => {
  try {
    const { resultId } = req.params;
    const { answers } = req.body;

    await UserQuizResult.findByIdAndUpdate(resultId, { answers });
    console.log(`💾 Temporary answers saved for resultId: ${resultId}`);
    res.json({ message: "Temporary save successful" });
  } catch (err) {
    console.error("❌ Error in tempSave:", err);
    res.status(500).json({ error: "Temporary save failed" });
  }
};

exports.submitAttempt = async (req, res) => {
  try {
    const userId = req.user.id;
    const { resultId } = req.params;
    const { answers } = req.body;

    console.log("📥 SUBMIT ATTEMPT");
    console.log(`🆔 Result ID: ${resultId}`);
    console.log("📨 Received answers:", JSON.stringify(answers, null, 2));

    const result = await UserQuizResult.findById(resultId).populate("quiz");
    if (!result) {
      console.error("❌ Result not found");
      return res.status(404).json({ error: "Result not found" });
    }

    const questions = await Question.find({ quiz_id: result.quiz._id });
    console.log(`📄 Loaded ${questions.length} questions for quiz ${result.quiz._id}`);

    let correctCount = 0;
    const gradedAnswers = answers.map((a, index) => {
      const question = questions.find(q => q._id.toString() === a.question);
      if (!question) {
        console.warn(`⚠️ Question not found for answer at index ${index}:`, a);
        return { ...a, isCorrect: false };
      }

      const correctAnswer = question.correct_answer;
      const isCorrect = JSON.stringify(a.answer) === JSON.stringify(correctAnswer);

      if (isCorrect) correctCount++;

      console.log(`🔍 Q${index + 1} - ${question._id}`);
      console.log(`  ✔️ Correct Answer:`, correctAnswer);
      console.log(`  📝 User Answer   :`, a.answer);
      console.log(`  ✅ Is Correct?   :`, isCorrect);

      return {
        ...a,
        isCorrect,
        correctAnswer, // optional: return to frontend for showing
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const passed = score >= 90;

    console.log(`🎯 Final Score: ${score}% (${correctCount}/${questions.length})`);
    console.log(`🎓 Passed: ${passed ? "YES" : "NO"}`);

    result.answers = gradedAnswers;
    result.score = score;
    result.passed = passed;
    result.submittedAt = new Date();
    await result.save();

    res.json({ message: "Submitted", result });
  } catch (err) {
    console.error("❌ Error during submitAttempt:", err);
    res.status(500).json({ error: "Submit failed", details: err.message });
  }
};

exports.getLatestResult = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const latest = await UserQuizResult.findOne({ user: userId, quiz: quizId })
      .sort({ attemptNumber: -1 });

    res.json(latest);
  } catch (err) {
    console.error("❌ Error in getLatestResult:", err);
    res.status(500).json({ error: "Get latest result failed" });
  }
};

exports.getAllAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user._id;

    const attempts = await UserQuizResult.find({ user: userId, quiz: quizId })
      .sort({ attemptNumber: -1 });

    res.json(attempts);
  } catch (err) {
    console.error("❌ Error in getAllAttempts:", err);
    res.status(500).json({ error: "Get attempts failed" });
  }
};
