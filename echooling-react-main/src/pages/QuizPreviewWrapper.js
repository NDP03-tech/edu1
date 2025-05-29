import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../services/quizService";
import QuizStartScreen from "../components/QuizUI/QuizStartScreen";
import QuizRunner from "../components/QuizUI/QuizRunner";
import QuizSubmitScreen from "../components/QuizUI/QuizSubmitScreen";

const QuizPreviewWrapper = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      setQuiz(null);
      setQuestions([]);
      setAnswers({});
      setHasStarted(false);
      setHasSubmitted(false);
      setResult(null);
      setAttemptNumber(1);

      try {
        const [fetchedQuiz, fetchedQuestions] = await Promise.all([
          quizService.getQuizById(quizId),
          fetch(`http://localhost:5000/api/questions/by-quiz/${quizId}`).then(res => res.json())
        ]);

        if (!isMounted) return;

        setQuiz(fetchedQuiz);
        setQuestions(fetchedQuestions);

        const token = localStorage.getItem("token");

        const latestRes = await fetch(`http://localhost:5000/api/results/latest/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const latestData = await latestRes.json();
        console.log("✅ Latest result:", latestData);

        if (!isMounted) return;

        if (latestData?.completed) {
          console.log("📦 Đã từng nộp bài:", latestData);
          setResult(latestData.result);
          setAnswers(
            (latestData.result?.answers || []).reduce((acc, curr) => {
              acc[curr.question] = curr.answer;
              return acc;
            }, {})
          );
          setHasSubmitted(true);
          return;
        }

        if (latestData && !latestData.completed) {
          console.log("📍 Resume từ result chưa nộp:", latestData._id);
          setAnswers(latestData.answers?.reduce((acc, curr) => {
            acc[curr.question] = curr.answer;
            return acc;
          }, {}) || {});
          setResult(latestData);
          setAttemptNumber(latestData.attemptNumber || 1);
        } else {
          console.log("🚀 Gọi API /start để tạo result mới");
          const startRes = await fetch(`http://localhost:5000/api/results/start/${quizId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
          });

          const startData = await startRes.json();

          if (!isMounted) return;

          console.log("✅ Đã tạo mới result:", startData._id);
          setResult(startData);
          setAnswers({});
          setAttemptNumber(startData.attemptNumber || 1);
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải dữ liệu quiz:", err);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [quizId]);

  const handleStart = () => setHasStarted(true);

  const handleAnswerChange = (questionId, userAnswer) => {
    const newAnswers = { ...answers, [questionId]: userAnswer };
    setAnswers(newAnswers);

    const validQuestionIds = questions.map(q => q._id);
    const answersArray = Object.entries(newAnswers)
      .filter(([qid]) => validQuestionIds.includes(qid))
      .map(([qid, ans]) => ({
        question: qid,
        answer: ans,
        type: questions.find(q => q._id === qid)?.question_type || "unknown"
      }));

    if (!result?._id || result.completed) return;

    fetch(`http://localhost:5000/api/results/temp/${result._id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`
      },
      body: JSON.stringify({ answers: answersArray })
    })
      .then(() => console.log("💾 Đã lưu tạm câu trả lời"))
      .catch(err => console.error("❌ Lỗi khi lưu tạm:", err));
  };

  const handleSubmit = async () => {
    const validQuestionIds = questions.map(q => q._id);
    const answersArray = Object.entries(answers)
      .filter(([qid]) => validQuestionIds.includes(qid))
      .map(([qid, ans]) => ({
        question: qid,
        answer: ans,
        type: questions.find(q => q._id === qid)?.question_type || "unknown"
      }));

    if (!result?._id || result.completed) return;
    console.log("📤 Submit answers:", answersArray);

    try {
      const res = await fetch(`http://localhost:5000/api/results/submit/${result._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ answers: answersArray })
      });

      const resultData = await res.json();
      console.log("🎯 Đã nộp bài và nhận kết quả:", resultData);
      setResult(resultData.result);
      setHasSubmitted(true);

      if (resultData.result?.passed) {
        navigate("/user");
      }
    } catch (err) {
      console.error("❌ Lỗi khi nộp bài:", err);
    }
  };

  if (!quiz) return <div className="text-center mt-10">⏳ Đang tải quiz...</div>;

  const ui = quiz.uiSettings || {};
  const showInstructions = ui.showInstructionInput && ui.instructionText;

  if (showInstructions && !hasStarted && !hasSubmitted) {
    return (
      <QuizStartScreen
        instruction={ui.instructionText}
        onStart={handleStart}
        timeLimit={ui.timeLimit}
      />
    );
  }

  if (hasSubmitted) {
    return (
      <QuizSubmitScreen
        message={
          result?.passed
            ? ui.quizCompleteMessage || "🎉 Bạn đã hoàn thành và vượt qua bài quiz!"
            : "🚫 Bạn chưa đạt yêu cầu. Hãy thử lại!"
        }
        score={ui.displayScore ? result?.score : null}
        answers={answers}
        correctAnswers={(result?.result || result)?.correctAnswers || []}
      />
    );
  }

  return (
    <QuizRunner
      key={quizId}
      questions={questions}
      headerText={ui.headerText || quiz.title}
      onePerPage={ui.oneQuestionPerPage}
      onAnswerChange={handleAnswerChange}
      onSubmit={handleSubmit}
      timeLimit={ui.timeLimit || 0}
      initialAnswers={answers}
    />
  );
};

export default QuizPreviewWrapper;