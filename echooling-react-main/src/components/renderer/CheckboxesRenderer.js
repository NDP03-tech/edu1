import React, { useState, useEffect } from "react";
import parse from "html-react-parser";

const CheckboxesRenderer = ({
  question,
  initialAnswer = [],
  onAnswerChange = () => {},
}) => {
  const [userAnswers, setUserAnswers] = useState([]);
  const [options, setOptions] = useState(question.options || []);

  useEffect(() => {
    setOptions(question.options || []);
    setUserAnswers(Array.isArray(initialAnswer) ? initialAnswer : []);
  }, [question._id, initialAnswer, question.options]);

  const handleOptionChange = (index) => {
    const updatedAnswers = userAnswers.includes(index)
      ? userAnswers.filter(i => i !== index)
      : [...userAnswers, index];

    setUserAnswers(updatedAnswers);
    onAnswerChange(question._id, updatedAnswers);
  };

  return (
    <div>
      <div>{parse(question.question_text || "")}</div>

      <div className="mt-3">
        {options.map((option, index) => {
          const checked = userAnswers.includes(index);

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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CheckboxesRenderer;
