import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import QuizInfo from "./QuizInfo/QuizInfo";
import QuestionFormTest from "./QuestionForm/QuestionFormTest";

const QuizBuilder = () => {
  const { quizId } = useParams();
  const navigate = useNavigate();

  const [quizInfo, setQuizInfo] = useState({});
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [focusedQuestionId, setFocusedQuestionId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const quizRes = await fetch(`http://localhost:5000/api/quizzes/${quizId}`);
        if (!quizRes.ok) throw new Error("Quiz not found.");
        const quizData = await quizRes.json();
        console.log("✅ Quiz Info:", quizData);
        setQuizInfo(quizData);

        const questionRes = await fetch(`http://localhost:5000/api/questions/by-quiz/${quizId}`);
        if (!questionRes.ok) throw new Error("Failed to fetch questions.");
        const questionsData = await questionRes.json();
        console.log("✅ Questions Fetched:", questionsData);
        setQuestions(questionsData);
      } catch (err) {
        console.error("❌ Error fetching data:", err);
        alert("Failed to load quiz data.");
        navigate("/quiz-manage");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId, navigate]);

  const handleSaveQuizInfo = async () => {
    try {
      const quizRes = await fetch(`http://localhost:5000/api/quizzes/${quizId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quizInfo),
      });

      if (!quizRes.ok) throw new Error("Failed to update quiz.");
      const updatedQuiz = await quizRes.json();
      setQuizInfo(updatedQuiz);
      console.log("✅ Quiz updated!");

      const updatedQuestions = await Promise.all(
        questions.map(async (q) => {
          const questionData = {
            ...q,
            quiz_id: quizId,
          };

          if (q._id) {
            const res = await fetch(`http://localhost:5000/api/questions/${q._id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(questionData),
            });
            if (!res.ok) throw new Error("Failed to update question.");
            return await res.json();
          } else {
            const res = await fetch(`http://localhost:5000/api/questions`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(questionData),
            });
            if (!res.ok) throw new Error("Failed to create question.");
            return await res.json();
          }
        })
      );

      setQuestions(updatedQuestions);
      alert("🎉 Quiz and questions saved successfully.");
    } catch (err) {
      console.error("❌ Error saving quiz and questions:", err);
      alert("Failed to save quiz and questions.");
    }
  };

  const handleAddQuestion = (newQuestion) => {
    if (Object.keys(newQuestion).length === 0) {
      setQuestions((prev) => [...prev, { quiz_id: quizId }]);
    } else {
      setQuestions((prev) => [...prev, newQuestion]);
    }
  };

  const handleDeleteQuestion = async (index, questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;

    try {
      if (questionId) {
        const res = await fetch(`http://localhost:5000/api/questions/${questionId}`, {
          method: "DELETE",
        });

        if (!res.ok) throw new Error("Failed to delete question.");
      }

      const updated = [...questions];
      updated.splice(index, 1);
      setQuestions(updated);
    } catch (err) {
      console.error("❌ Error deleting question:", err);
      alert("Failed to delete question.");
    }
  };

  const handleFinishEdit = (updatedQuestion) => {
    setQuestions((prev) => {
      const index = prev.findIndex((q) => q._id === updatedQuestion._id);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = updatedQuestion;
        return updated;
      }

      const emptyIndex = prev.findIndex((q) => !q._id);
      if (emptyIndex !== -1) {
        const updated = [...prev];
        updated[emptyIndex] = updatedQuestion;
        return updated;
      }

      return [...prev, updatedQuestion];
    });
  };

  const handleFocusQuestion = (questionId) => {
    setFocusedQuestionId(questionId);
  };

  return (
    <div className="container mt-4">
      {loading ? (
        <p>⏳ Loading data...</p>
      ) : (
        <>
          <QuizInfo
            quizId={quizId}
            quizInfo={quizInfo}
            onQuizInfoChange={setQuizInfo}
          />
          <hr />
          {questions.map((question, index) => (
            <div
              key={question._id || index}
              className="mb-4"
              style={{
                border: focusedQuestionId === question._id ? '2px solid #007bff' : 'none',
                borderRadius: '8px',
                padding: '4px'
              }}
            >
              <QuestionFormTest
                questionIndex={index}
                questionData={question}
                quizId={quizId}
                onAddQuestion={handleAddQuestion}
                onDelete={handleDeleteQuestion}
                onFinishEdit={handleFinishEdit}
                onFocusQuestion={handleFocusQuestion}
              />
            </div>
          ))}
          <button className="btn btn-primary mt-4" onClick={() => handleAddQuestion({})}>
            ➕ Add New Question
          </button>
          <div className="text-end mt-4">
            <button className="btn btn-success me-2" onClick={handleSaveQuizInfo}>
               Save Quiz
            </button>
            <button className="btn btn-info" onClick={() => navigate(`/user/do-quiz/${quizId}`)}>
             Preview Quiz
            </button> 
          </div>
        </>
      )}
    </div>
  );
};

export default QuizBuilder;
