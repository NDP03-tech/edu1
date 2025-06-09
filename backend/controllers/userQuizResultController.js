const UserQuizResult = require("../models/UserQuizResult");
const Quiz = require("../models/Quiz");
const Question = require("../models/Question");
const Class = require ("../models/Class");
const User = require ("../models/User");
const mongoose = require('mongoose');

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

    let totalEarnedScore = 0;
    let totalPossibleScore = 0;

    const gradedAnswers = answers.map((a) => {
      const question = questions.find(q => q._id.toString() === a.question);
      if (!question) return { ...a, isCorrect: false, score: 0 };

      let correctItems = 0;
      let totalItems = 0;
      let earnedScore = 0;

      const rawAnswer = a.answer || {};
      const userAnswerObj = rawAnswer || {};

      const gaps = question.gaps || [];
      const dropdowns = question.dropdowns || [];
      const gapCount = gaps.length;
      const dropdownCount = dropdowns.length;

      switch (question.question_type) {
        case 'blank-boxes':
        case 'drag-drop-matching':
        case 'generated-dropdowns': {
          totalItems = gapCount + dropdownCount;
          totalPossibleScore += totalItems * question.points;

          // Gaps
          for (let i = 0; i < gapCount; i++) {
            const rawUserInput = userAnswerObj[i];
            const correctAnswersLower = (gaps[i]?.correct_answers || []).map(ans => ans.trim().toLowerCase());

            if (Array.isArray(rawUserInput)) {
              const userInputsLower = rawUserInput.map(ans => ans.trim().toLowerCase());
              const matched = userInputsLower.some(ans => correctAnswersLower.includes(ans));
              if (matched) {
                correctItems++;
                earnedScore += question.points;
              }
            } else {
              const userInput = (rawUserInput || "").trim().toLowerCase();
              if (correctAnswersLower.includes(userInput)) {
                correctItems++;
                earnedScore += question.points;
              }
            }
          }

          // Dropdowns
          for (let i = 0; i < dropdownCount; i++) {
            const userInput = (userAnswerObj[gapCount + i] || "").trim().toLowerCase();
            const correctAnswer = (dropdowns[i]?.correct_answer || "").trim().toLowerCase();
            if (userInput === correctAnswer) {
              correctItems++;
              earnedScore += question.points;
            }
          }
          break;
        }

        case 'multiple-choice': {
          totalItems = 1;
          totalPossibleScore += question.points;

          const correctOption = question.options.find(o => o.isCorrect)?.text?.trim().toLowerCase();
          const userAnswer = (a.answer || "").trim().toLowerCase();
          if (userAnswer === correctOption) {
            correctItems = 1;
            earnedScore = question.points;
          }
          break;
        }

        case 'checkboxes': {
          const userAnswer = [...new Set((a.answer || []).map(x => Number(x)))];
          const correctIndexes = question.options
            .map((opt, idx) => opt.isCorrect ? idx : null)
            .filter(idx => idx !== null);

          totalItems = correctIndexes.length;
          totalPossibleScore += totalItems * question.points;

          correctIndexes.forEach(idx => {
            if (userAnswer.includes(idx)) {
              correctItems++;
              earnedScore += question.points;
            }
          });
          break;
        }

        case 'find-highlight': {
          const userHighlights = a.answer || [];
          const correctAnswers = (question.gaps || []).map(g => ({
            text: g.correct_answers?.[0]?.trim().toLowerCase(),
            start: g.position,
            end: g.position + g.length
          }));

          totalItems = correctAnswers.length;
          totalPossibleScore += totalItems * question.points;

          const usedIndexes = new Set();

          correctAnswers.forEach((correct) => {
            const match = userHighlights.find((h, idx) => {
              const userText = h.text?.trim().toLowerCase();
              const startClose = Math.abs(h.start - correct.start) <= 2;
              const endClose = Math.abs(h.end - correct.end) <= 2;

              return (
                !usedIndexes.has(idx) &&
                userText === correct.text &&
                startClose &&
                endClose
              );
            });

            if (match) {
              correctItems++;
              usedIndexes.add(userHighlights.indexOf(match));
              earnedScore += question.points;
            }
          });
          break;
        }

        case 'essay':
        case 'description':
        case 'reading':
        case 'speaking': {
          break;
        }

        default: {
          totalItems = 1;
          totalPossibleScore += question.points;
          if (JSON.stringify(a.answer) === JSON.stringify(question.correct_answer)) {
            correctItems = 1;
            earnedScore = question.points;
          }
          break;
        }
      }

      totalEarnedScore += earnedScore;

      return {
        ...a,
        isCorrect: correctItems === totalItems,
        score: Math.round(earnedScore * 100) / 100,
      };
    });

    const finalScore = totalPossibleScore === 0 ? 0 : Math.round((totalEarnedScore / totalPossibleScore) * 100);
    const passed = finalScore >= 90;

    console.log(`🎯 Final Score: ${finalScore}% (${totalEarnedScore}/${totalPossibleScore})`);
    console.log(`🎓 Passed: ${passed ? "YES" : "NO"}`);

    result.answers = gradedAnswers;
    result.score = finalScore;
    result.passed = passed;
    result.submittedAt = new Date();
    await result.save();

    const correctAnswers = questions.map((q) => {
      let correct = null;

      switch (q.question_type) {
        case 'blank-boxes':
        case 'drag-drop-matching':
        case 'generated-dropdowns': {
          const gapPart = (q.gaps || []).map(g => g.correct_answers?.[0] || "");
          const dropdownPart = (q.dropdowns || []).map(d => d.correct_answer || "");
          correct = [...gapPart, ...dropdownPart].reduce((acc, val, idx) => {
            acc[idx] = val;
            return acc;
          }, {});
          break;
        }

        case 'multiple-choice': {
          correct = q.options.find(o => o.isCorrect)?.text || null;
          break;
        }

        case 'checkboxes': {
          correct = q.options
            .map((o, idx) => o.isCorrect ? idx : null)
            .filter(idx => idx !== null);
          break;
        }

        case 'find-highlight': {
          correct = q.correct_answer || [];
          break;
        }

        default: {
          correct = q.correct_answer || null;
          break;
        }
      }

      return {
        question: q._id,
        answer: correct
      };
    });

    console.log("✅ correctAnswers to return:", JSON.stringify(correctAnswers, null, 2));

    res.json({
      message: "Submitted",
      result: {
        ...result.toObject(),
        correctAnswers
      }
    });
  } catch (err) {
    console.error("❌ Error during submitAttempt:", err);
    res.status(500).json({ error: "Submit failed", details: err.message });
  }
};



exports.getLatestResult = async (req, res) => {
  try {
    const { quizId } = req.params;
    const userId = req.user.id;

    const latest = await UserQuizResult.findOne({
      user: userId,
      quiz: quizId,
      submittedAt: { $ne: null } // chỉ lấy bài đã nộp
    })
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

exports.getUserQuizSummaryByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;

    const results = await UserQuizResult.find({ user: userId })
      .populate('quiz', 'title')
      .lean();

    const summaryMap = {};

    for (const result of results) {
      // ✅ Bỏ qua nếu quiz không tồn tại (bị xóa khỏi DB)
      if (!result.quiz) continue;

      const quizId = result.quiz._id.toString();

      if (!summaryMap[quizId]) {
        summaryMap[quizId] = {
          quizId,
          quizTitle: result.quiz.title,
          bestScore: result.score,
          attempts: 1,
          totalDuration: result.submittedAt && result.startedAt
            ? (result.submittedAt - result.startedAt) / 1000
            : 0,
          durationCount: result.submittedAt && result.startedAt ? 1 : 0,
          lastAttempt: result.submittedAt || result.createdAt,
        };
      } else {
        const item = summaryMap[quizId];
        item.attempts += 1;
        item.bestScore = Math.max(item.bestScore, result.score);

        const duration = result.submittedAt && result.startedAt
          ? (result.submittedAt - result.startedAt) / 1000
          : 0;

        if (duration > 0) {
          item.totalDuration += duration;
          item.durationCount += 1;
        }

        if (result.submittedAt && result.submittedAt > item.lastAttempt) {
          item.lastAttempt = result.submittedAt;
        }
      }
    }

    const summary = Object.values(summaryMap).map(item => ({
      quizId: item.quizId,
      quizTitle: item.quizTitle,
      bestScore: item.bestScore,
      attempts: item.attempts,
      avgDuration: item.durationCount > 0
        ? Math.round(item.totalDuration / item.durationCount)
        : null,
      lastAttempt: item.lastAttempt,
    }));

    res.json(summary);
  } catch (err) {
    console.error('❌ Error in getUserQuizSummaryByUserId:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};



exports.getBestAttemptsByQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    if (!quizId) {
      return res.status(400).json({ message: 'Quiz ID is required' });
    }

    const quizObjectId = new mongoose.Types.ObjectId(quizId);

    // 1. Lấy tất cả bài đã nộp của quiz này
    const submittedResults = await UserQuizResult.find({
      quiz: quizObjectId,
      submittedAt: { $ne: null }
    })
      .sort({ user: 1, score: -1, submittedAt: 1 })
      .populate('user', 'firstName lastName email')
      .populate('answers.question');

    console.log(`📦 Found ${submittedResults.length} submitted attempts`);

    // 2. Chọn bài có điểm cao nhất cho mỗi user
    const bestAttemptsMap = new Map();
    submittedResults.forEach(result => {
      const userId = result.user?._id?.toString();
      if (!userId) {
        console.warn(`⚠️ Skipping result ${result._id} due to missing user`);
        return;
      }
      if (!bestAttemptsMap.has(userId)) {
        bestAttemptsMap.set(userId, result);
      }
    });

    const bestAttempts = Array.from(bestAttemptsMap.values());
    console.log(`🎯 Best attempts selected: ${bestAttempts.length}`);

    // 3. Tìm tất cả class chứa quiz này
    const classes = await Class.find({ quizzes: quizObjectId }).lean();

    // 4. Tạo map userId => class (nếu user là học sinh của class chứa quiz)
    const userIdToClassMap = new Map();
    classes.forEach(cls => {
      cls.students?.forEach(userId => {
        userIdToClassMap.set(userId.toString(), cls);
      });
    });

    // 5. Gắn class vào từng result
    const enrichedResults = bestAttempts.map(result => {
      const resultObj = result.toObject();
      const userId = result.user?._id?.toString();
      resultObj.class = userIdToClassMap.get(userId) || null;
      return resultObj;
    });

    // 6. Lấy toàn bộ câu hỏi và tạo correctAnswersMap
    const questions = await Question.find({ quiz_id: quizObjectId }).lean();

    const correctAnswersMap = {};
    questions.forEach(q => {
      correctAnswersMap[q._id.toString()] = {
        question_type: q.question_type,
        correctAnswers: {
          gaps: q.gaps?.map(g => g.correct_answers) || [],
          dropdowns: q.dropdowns?.map(d => d.correct_answer) || [],
          options: q.options || [],
        }
      };
    });

    // 7. Trả kết quả
    return res.json({
      quizId,
      results: enrichedResults,
      correctAnswersMap,
    });

  } catch (err) {
    console.error('❌ Error in getBestAttemptsByQuiz:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


exports.getUsersBestAttemptsByQuiz = async (req, res) => {
  const { quizId } = req.params;

  try {
    // 1. Lấy các kết quả tốt nhất của mỗi user
    const bestResults = await UserQuizResult.aggregate([
      { $match: { quiz: new mongoose.Types.ObjectId(quizId) } },
      { $sort: { score: -1, submittedAt: -1 } },
      {
        $group: {
          _id: "$user",
          bestAttempt: { $first: "$$ROOT" }
        }
      },
      { $replaceRoot: { newRoot: "$bestAttempt" } },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user"
        }
      },
      { $unwind: "$user" },
      {
        $project: {
          _id: 1,
          user: { _id: "$user._id", name: "$user.name", email: "$user.email" },
          score: 1,
          passed: 1,
          submittedAt: 1,
          attemptNumber: 1,
          answers: 1
        }
      }
    ]);

    // 2. Lấy tất cả câu hỏi của quiz và extract đáp án đúng
    const quiz = await Quiz.findById(quizId).populate({
      path: "questions",
      model: "Question"
    });

    const questionParts = [];       // ["Q1_0", "Q1_1", ...]
    const correctAnswersRow = [];   // ["answer", "answer", ...]

    quiz.questions.forEach((question, qIndex) => {
      // Gaps (blank-boxes / generated-dropdowns)
      if (question.gaps?.length > 0) {
        question.gaps.forEach((gap, i) => {
          questionParts.push(`Q${qIndex + 1}_${i}`);
          correctAnswersRow.push(gap.correct_answers?.[0] || "");
        });
      }

      // Dropdowns
      if (question.dropdowns?.length > 0) {
        question.dropdowns.forEach((dropdown, i) => {
          questionParts.push(`Q${qIndex + 1}_D${i}`);
          correctAnswersRow.push(dropdown.correct_answer || "");
        });
      }

      // Multiple-choice / Checkboxes
      if (["multiple-choice", "checkboxes"].includes(question.question_type)) {
        question.options.forEach((option, i) => {
          questionParts.push(`Q${qIndex + 1}_O${i}`);
          correctAnswersRow.push(option.isCorrect ? option.text : "");
        });
      }

      // Drag-drop matching
      if (question.question_type === "drag-drop-matching") {
        questionParts.push(`Q${qIndex + 1}_DDM`);
        correctAnswersRow.push("matched (dynamic)");
      }

      // Essay / Speaking
      if (["essay", "speaking"].includes(question.question_type)) {
        questionParts.push(`Q${qIndex + 1}_ES`);
        correctAnswersRow.push("(manual grading)");
      }
    });

    res.json({
      results: bestResults,
      questionParts,
      correctAnswersRow
    });

  } catch (error) {
    console.error("Error fetching best attempts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};





