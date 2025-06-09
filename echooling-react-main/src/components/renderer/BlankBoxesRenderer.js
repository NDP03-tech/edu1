import React, { useEffect, useState } from "react";

const BlankBoxesRenderer = ({
  question,
  initialAnswer = {},
  onAnswerChange,
  answerStatus = {}, // ✅ truyền từ hệ thống sau khi submit
  showCorrectAnswer = false,
  editable = true,
}) => {
  const [answers, setAnswers] = useState({});
  const normalize = (str) => (str || "").trim().toLowerCase();


  useEffect(() => {
    setAnswers(initialAnswer || {});
  }, [question?._id, initialAnswer]);

  const onChange = (index, value) => {
    const newAnswers = { ...answers, [index]: value };
    setAnswers(newAnswers);
    onAnswerChange && onAnswerChange(question._id, newAnswers);
  };

  if (!question || !question.question_text) return null;

  const parseQuestionText = () => {
    const div = document.createElement("div");
    div.innerHTML = question.question_text;

    let gapIndex = 0;
    const result = [];

    const walkNodes = (parent) => {
      parent.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() !== "") {
          result.push({ type: "text", content: node.textContent });
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node;
          if (el.classList.contains("cloze")) {
            const isDropdown = el.classList.contains("dropdown");
            const index = gapIndex++;
            if (isDropdown) {
              const options = JSON.parse(el.dataset.options || "[]");
              result.push({ type: "dropdown", options, index });
            } else {
              result.push({ type: "input", index });
            }
          } else {
            walkNodes(el);
          }
        }
      });
    };

    walkNodes(div);
    return result;
  };

  const parsed = parseQuestionText();

  const getStyle = (index) => {
    if (!showCorrectAnswer) return {};
    if (answerStatus[index] === true) {
      return { backgroundColor: "#d4edda", borderColor: "#28a745" }; // Green
    } else if (answerStatus[index] === false) {
      return { backgroundColor: "#f8d7da", borderColor: "#dc3545" }; // Red
    }
    return {};
  };
  

  return (
    <div className="rendered-question">
      {parsed.map((item, idx) => {
        const correct = question?.gaps?.correct_answers?.[item.index];
        const isIncorrect = showCorrectAnswer && answerStatus[item.index] === false;

        if (item.type === "text") return <span key={idx}>{item.content}</span>;

        if (item.type === "input") {
          return (
            <span key={idx} style={{ display: "inline-block" }}>
              <input
                type="text"
                className="form-control d-inline-block gap-input"
                style={{
                  width: "auto",
                  minWidth: 30,
                  margin: "0 4px",
                  padding: "4px 8px",
                  fontSize: 14,
                  ...getStyle(item.index),
                }}
                value={answers[item.index] ?? ""}
                onChange={(e) => onChange(item.index, e.target.value)}
                disabled={!editable}
              />
              {isIncorrect && correct && (
                <span className="text-muted small ms-1">
                  ({correct})
                </span>
              )}
            </span>
          );
        }

        if (item.type === "dropdown") {
          return (
            <span key={idx} style={{ display: "inline-block" }}>
              <select
                className="form-select d-inline-block gap-dropdown"
                style={{
                  width: "auto",
                  margin: "0 4px",
                  padding: "4px 8px",
                  fontSize: 14,
                  ...getStyle(item.index),
                }}
                value={answers[item.index] ?? ""}
                onChange={(e) => onChange(item.index, e.target.value)}
                disabled={!editable}
              >
                <option value="" disabled hidden>
                  -- Chọn --
                </option>
                {item.options.map((opt, i) => (
                  <option key={i} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              {isIncorrect && correct && (
                <span className="text-muted small ms-1">
                  ({correct})
                </span>
              )}
            </span>
          );
        }

        return null;
      })}
    </div>
  );
};

export default BlankBoxesRenderer;
