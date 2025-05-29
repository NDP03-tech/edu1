import React, { useEffect, useState } from "react";
import parse from "html-react-parser";

const BlankBoxesRenderer = ({ question, initialAnswer = {}, onAnswerChange }) => {
  const [answers, setAnswers] = useState({});

  // Parse question_text thành mảng gồm các đoạn text xen kẽ gap input hoặc dropdown
  // Mảng dạng: [{type:"text", content:string} hoặc {type:"input"/"dropdown", index:number, options?}]
  const parseQuestionText = () => {
    if (!question || !question.question_text) return [];

    const div = document.createElement("div");
    div.innerHTML = question.question_text;

    let gapIndex = 0;
    const result = [];

    const walkNodes = (parent) => {
      parent.childNodes.forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent.trim() !== "") {
            result.push({ type: "text", content: node.textContent });
          }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node;
          if (el.classList.contains("cloze")) {
            const isDropdown = el.classList.contains("dropdown");
            if (isDropdown) {
              const options = JSON.parse(el.dataset.options || "[]");
              result.push({ type: "dropdown", options, index: gapIndex });
            } else {
              result.push({ type: "input", index: gapIndex });
            }
            gapIndex++;
          } else {
            // Đệ quy xử lý các node con
            walkNodes(el);
          }
        }
      });
    };

    walkNodes(div);

    return result;
  };

  useEffect(() => {
    setAnswers(initialAnswer);
  }, [question?._id, initialAnswer]);

  const onChange = (index, value) => {
    const newAnswers = { ...answers, [index]: value };
    setAnswers(newAnswers);
    if (onAnswerChange) {
      onAnswerChange(question._id, newAnswers);
    }
  };

  if (!question || !question.question_text) return null;

  const parsed = parseQuestionText();

  return (
    <div className="rendered-question">
      {/* Render phần text xen kẽ input và dropdown */}
      {parsed.map((item, idx) => {
        if (item.type === "text") {
          return <span key={idx}>{item.content}</span>;
        }
        if (item.type === "input") {
          return (
            <input
              key={idx}
              type="text"
              className="form-control d-inline-block gap-input"
              style={{
                width: "auto",
                minWidth: 30,
                margin: "0 4px",
                padding: "4px 8px",
                fontSize: 14,
                display: "inline-block",
              }}
              value={answers[item.index] || ""}
              onChange={(e) => onChange(item.index, e.target.value)}
            />
          );
        }
        if (item.type === "dropdown") {
          return (
            <select
              key={idx}
              className="form-select d-inline-block gap-dropdown"
              style={{
                width: "auto",
                margin: "0 4px",
                padding: "4px 8px",
                fontSize: 14,
              }}
              value={answers[item.index] || ""}
              onChange={(e) => onChange(item.index, e.target.value)}
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
          );
        }
        return null;
      })}

      {/* Render toàn bộ question_text bằng html-react-parser */}
      <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #ccc" }}>
        {parse(question.question_text)}
      </div>
    </div>
  );
};

export default BlankBoxesRenderer;
