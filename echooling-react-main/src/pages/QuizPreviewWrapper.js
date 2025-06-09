import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import quizService from "../services/quizService";
import QuizStartScreen from "../components/QuizUI/QuizStartScreen";
import QuizRunner from "../components/QuizUI/QuizRunner";
import QuizSubmitScreen from "../components/QuizUI/QuizSubmitScreen";

const QuizPreviewWrapper = () => {
  const { quizId } = useParams();
  const [scoreAfterSubmit, setScoreAfterSubmit] = useState(null);

  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [attemptNumber, setAttemptNumber] = useState(1);

  useEffect(() => {
    console.log("📦 initialAnswers truyền xuống QuizRunner:", answers);

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

        if (latestData?.submittedAt) {
          console.log("📦 Đã từng nộp bài:", latestData);
        
          const startRes = await fetch(`http://localhost:5000/api/results/start/${quizId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` }
          });
        
          const startData = await startRes.json();
          if (!isMounted) return;
        
          const oldAnswers = latestData.answers?.reduce((acc, curr) => {
            acc[curr.question] = curr.answer;
            return acc;
          }, {}) || {};
        
          setResult(startData);
          setAnswers(oldAnswers);
          setAttemptNumber(startData.attemptNumber || 1);
          setHasSubmitted(false);
        
          return; // ✅ STOP tại đây để không gọi tạo result lần nữa
        }
        
        
        

        if (latestData && !latestData.submittedAt) {
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

      if (!result?._id || result?.submittedAt) return;

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
    console.log("🔔 handleSubmit called!");
    console.log("🧪 Attempt số:", attemptNumber);
  
    const maxAttempts = quiz?.uiSettings?.maxAttempts;
  
    if (maxAttempts !== "unlimited" && typeof maxAttempts === "number") {
      if (attemptNumber >= maxAttempts) {
        alert("❌ Bạn đã vượt quá số lần làm bài cho phép.");
        return;
      }
    }
  
    const validQuestionIds = questions.map(q => q._id);
    const answersArray = Object.entries(answers)
      .filter(([qid]) => validQuestionIds.includes(qid))
      .map(([qid, ans]) => ({
        question: qid,
        answer: ans,
        type: questions.find(q => q._id === qid)?.question_type || "unknown"
      }));
  
    const token = localStorage.getItem("token");
  
    if (!result?._id) {
      console.warn("⚠️ Không thể submit: result._id không tồn tại.");
      return;
    }
  
    try {
      let submitUrl = `http://localhost:5000/api/results/submit/${result._id}`;
      let resultToUse = result;
  
      // Nếu đã nộp rồi => tạo result mới
      if (result.submittedAt) {
        console.log("🔁 Đã nộp rồi, tạo mới result và submit lại");
  
        const startRes = await fetch(`http://localhost:5000/api/results/start/${quiz._id}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
  
        const newResult = await startRes.json();
        console.log("🆕 New result created:", newResult._id);
  
        setResult(newResult);
        setAttemptNumber(newResult.attemptNumber);
  
        resultToUse = newResult;
        submitUrl = `http://localhost:5000/api/results/submit/${newResult._id}`;
      }
  
      console.log("📤 Submitting answers to:", submitUrl);
      const submitRes = await fetch(submitUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: answersArray })
      });
  
      const submitData = await submitRes.json();
      console.log("🎯 Đã nộp bài và nhận kết quả:", submitData);
  
      setAnswers(answers); // optional
      setHasSubmitted(true);
      setScoreAfterSubmit(submitData.result?.score || 0);
      setResult(submitData.result);
  
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

  if ( hasSubmitted && ui.showCompletionInput) {
    return (
      <QuizSubmitScreen
        message={ui.quizCompleteMessage 
        }
        hasSubmitted={hasSubmitted}
        score={ui.displayScore ? result?.score : null}
        answers={answers}
        scoreAfterSubmit={scoreAfterSubmit}
        correctAnswers={(result?.result || result)?.correctAnswers || []}
      />
    );
  }
  

  return (
    <QuizRunner
      key={quizId + "_" + result?._id}
      questions={questions}
      headerText={ui.headerText || quiz.title}
      onePerPage={ui.oneQuestionPerPage}
      onAnswerChange={handleAnswerChange}
      onSubmit={handleSubmit}
      timeLimit={ui.timeLimit || 0}
      hasSubmitted={hasSubmitted}
      showCorrectAnswer={hasSubmitted} 
      initialAnswers={answers}
      uiSettings={ui} 
      scoreAfterSubmit={scoreAfterSubmit}
      correctAnswers={(result?.result || result)?.correctAnswers || []}
    />
  );
};

export default QuizPreviewWrapper;