import React, { useState, useEffect } from "react";
import parse from "html-react-parser";

const CheckboxesRenderer = ({
  question,
  initialAnswer = [],
  onAnswerChange = () => {},
  correctAnswer = [],
  showCorrectAnswer = false,
  answerStatus = {} // 👈 truyền vào
}) => {
  const [userAnswers, setUserAnswers] = useState([]);
  const [options, setOptions] = useState(question.options || []);

  useEffect(() => {
    setOptions(question.options || []);
    const normalized = Array.isArray(initialAnswer)
      ? initialAnswer.map((val) => Number(val))
      : [];
    setUserAnswers(normalized);
  }, [question._id, initialAnswer, question.options]);

  const handleOptionChange = (index) => {
    const updated = userAnswers.includes(index)
      ? userAnswers.filter((i) => i !== index)
      : [...userAnswers, index];

    setUserAnswers(updated);
    onAnswerChange(question._id, updated.map((i) => Number(i)));
  };

  return (
    <div>
      <div>{parse(question.question_text || "")}</div>
      <div className="mt-3">
        {options.map((option, index) => {
          const checked = userAnswers.includes(index);
          let icon = null;

          if (showCorrectAnswer && Array.isArray(answerStatus?.selected)) {
            const userSelected = answerStatus.selected.includes(index);
            const isCorrect = correctAnswer.includes(index);

            if (userSelected && isCorrect) {
              icon = <span style={{ color: "green", marginLeft: "8px" }}>✓</span>;
            } else if (userSelected && !isCorrect) {
              icon = <span style={{ color: "red", marginLeft: "8px" }}>✗</span>;
            }
          }

          return (
            <div key={index} className="d-flex align-items-start mb-3">
              <input
                type="checkbox"
                style={{ width: "25px", height: "20px" }}
                checked={checked}
                onChange={() => handleOptionChange(index)}
                className="me-2 mt-1"
              />
              <div style={{ flex: 1 }}>
                <strong>{String.fromCharCode(97 + index)}.</strong>{" "}
                <span>{parse(option.text || "")}</span>
                {icon}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


export default CheckboxesRenderer;
