import React, { useState, useEffect } from "react";

const MultipleChoiceRenderer = ({
  question,
  initialAnswer = "",
  frozenAnswer = "",
  showCorrectAnswer = false,
  onAnswerChange,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(initialAnswer);

  useEffect(() => {
    setSelectedAnswer(initialAnswer);
  }, [initialAnswer]);

  const handleChange = (optionText) => {
    setSelectedAnswer(optionText);
    onAnswerChange?.(question._id, optionText);
  };

  const renderIconAndStyle = (option) => {
    const optionText = option.text?.trim();
    const wasSubmittedAnswer = frozenAnswer?.trim?.() === optionText;

    if (!showCorrectAnswer || !frozenAnswer || !wasSubmittedAnswer) return {};

    const isCorrect = option.isCorrect;
    return {
      icon: (
        <span style={{ marginLeft: 8, color: isCorrect ? "green" : "red" }}>
          {isCorrect ? "✓" : "✗"}
        </span>
      ),
      style: {
        backgroundColor: isCorrect ? "#e6ffed" : "#ffe6e6",
      },
    };
  };

  return (
    <div>
      {question?.question_text && (
        <div
          className="mb-3"
          dangerouslySetInnerHTML={{ __html: question.question_text }}
        />
      )}

      <div className="mt-3">
        {question?.options?.map((option, index) => {
          const optionText = option.text?.trim();
          const isSelected = selectedAnswer?.trim() === optionText;
          const { icon, style } = renderIconAndStyle(option);

          return (
            <div
              key={option._id || option.id || index}
              className="d-flex align-items-start mb-3 p-2 rounded"
              style={style}
            >
              <input
                type="radio"
                name={`question-${question._id}`}
                checked={isSelected}
                onChange={() => handleChange(optionText)}
                className="me-2 mt-1"
                style={{ width: 20, height: 20 }}
              />
              <div style={{ flex: 1 }}>
                <strong>{String.fromCharCode(97 + index)}.</strong>{" "}
                <span dangerouslySetInnerHTML={{ __html: option.text }} />
                {icon}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleChoiceRenderer;
