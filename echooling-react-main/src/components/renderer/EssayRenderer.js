import React, { useState, useEffect } from "react";

const EssayRenderer = ({ question, initialAnswer = "", onAnswerChange }) => {
  const [answer, setAnswer] = useState(initialAnswer || "");

  useEffect(() => {
    setAnswer(initialAnswer || "");
  }, [initialAnswer]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setAnswer(newValue);
    onAnswerChange && onAnswerChange(question._id, newValue);
  };

  return (
    <div className="essay-question">
      {/* Hiển thị nội dung đề bài */}
      {question.question_text ? (
        <div
          className="essay-content mb-3"
          dangerouslySetInnerHTML={{ __html: question.question_text }}
        />
      ) : (
        <div className="text-muted mb-3">No question content provided.</div>
      )}

      {/* Ô nhập bài viết */}
      <textarea
        className="form-control"
        rows="8"
        placeholder="Write your answer here..."
        value={answer}
        onChange={handleChange}
      />
    </div>
  );
};

export default EssayRenderer;
