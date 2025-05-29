import React, { useState, useEffect } from "react";
import QuestionRenderer from "../QuestionRenderer";

const QuizRunner = ({
  questions,
  headerText,
  onePerPage,
  onAnswerChange,
  onSubmit,
  timeLimit,
  initialAnswers = {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(timeLimit ? timeLimit * 60 : 0);

  // ⏱ Reset lại khi quiz thay đổi
  useEffect(() => {
    setCurrentIndex(0);
    setSecondsLeft(timeLimit ? timeLimit * 60 : 0);
  }, [questions, timeLimit]);

  // ⏱ Đếm ngược thời gian và tự động nộp bài khi hết giờ
  useEffect(() => {
    if (!timeLimit) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onSubmit(); // Tự động nộp bài
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLimit, onSubmit]);

  const formatTime = (secs) => {
    const m = String(Math.floor(secs / 60)).padStart(2, "0");
    const s = String(secs % 60).padStart(2, "0");
    return `${m}:${s}`;
  };

  const normalizedAnswers = React.useMemo(() => {
    if (Array.isArray(initialAnswers)) {
      return initialAnswers.reduce((acc, curr) => {
        acc[curr.question] = curr.answer;
        return acc;
      }, {});
    }
    return initialAnswers;
  }, [initialAnswers]);
  

  const shouldShowOnePerPage = onePerPage && questions.length > 1;

  const getInitialAnswerForQuestion = (question) => {
    const answer = normalizedAnswers[question._id];
  const type = question.questionType || question.question_type;

    switch (type) {
      case "checkboxes":
        if (Array.isArray(answer)) return answer;               // [0, 1]
      if (typeof answer === "string") {
        try {
          const parsed = JSON.parse(answer);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return []; // fallback nếu null/undefined
      case "find-highlight":
        return Array.isArray(answer) ? answer : [];

      case "blank-boxes":
      case "generated-dropdowns":
        return typeof answer === "object" && answer !== null ? answer : {};


      case "drag-drop-matching":
        return typeof answer === "object" && answer !== null ? answer : {};

      case "multiple-choice":
      case "essay":
      case "reading":
      case "speaking":
        return typeof answer === "string" ? answer : "";

      default:
        return answer;
    }
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      {headerText && (
        <div className="mb-6" dangerouslySetInnerHTML={{ __html: headerText }} />
      )}

      {timeLimit > 0 && (
        <div className="text-right mb-4 text-red-600 font-bold">
          ⏱ Time left: {formatTime(secondsLeft)}
        </div>
      )}

      {shouldShowOnePerPage ? (
        <div>
          <QuestionRenderer
            key={questions[currentIndex]._id}
            question={questions[currentIndex]}
            initialAnswer={getInitialAnswerForQuestion(questions[currentIndex])}
            onAnswerChange={(questionId, answer) =>
              onAnswerChange(questionId, answer)
            }
          />

          <div className="mt-4 flex justify-between">
            {currentIndex > 0 && (
              <button
                onClick={() => setCurrentIndex(currentIndex - 1)}
                className="px-4 py-2 bg-gray-200 rounded"
              >
                Back
              </button>
            )}
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="px-4 py-2 bg-blue-500 text-white rounded"
              >
                Next
              </button>
            ) : (
              <button
                onClick={onSubmit}
                className="px-4 py-2 bg-green-600 text-white rounded"
              >
                Submit
              </button>
            )}
          </div>
        </div>
      ) : (
        <div>
          {questions.map((q) => (
            <div key={q._id} className="mb-6">
              <QuestionRenderer
                question={q}
                initialAnswer={getInitialAnswerForQuestion(q)}
                onAnswerChange={(questionId, answer) =>
                  onAnswerChange(questionId, answer)
                }
              />
            </div>
          ))}
          <button
            onClick={onSubmit}
            className="px-4 py-2 bg-green-600 text-white rounded mt-4"
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
};

export default QuizRunner;
