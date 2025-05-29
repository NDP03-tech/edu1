import React, { useEffect, useMemo, useRef, useState } from "react";

const DragDropRichRenderer = ({
  question,
  editable = false,
  initialAnswer = {},
  questionId,
  onAnswerChange,
}) => {
  const containerRef = useRef(null);
  const hasInitialized = useRef(false);

  // Tính correctAnswers một lần duy nhất
  const correctAnswers = useMemo(() => {
    return question.gaps.map((gap) => {
      const answers =
        gap.correct_answers || gap.correctAnswers || gap.correct_answer;
      return Array.isArray(answers) ? answers[0] : answers;
    });
  }, [question.gaps]);

  // Trạng thái các đáp án đã được thả vào chỗ trống
  const [droppedAnswers, setDroppedAnswers] = useState({});
  const [availableAnswers, setAvailableAnswers] = useState([]);

  // Chỉ khởi tạo dropped/available một lần duy nhất dựa trên initialAnswer
  useEffect(() => {
    const used = Object.values(initialAnswer || {});
    const newAvailable = [...new Set(correctAnswers)].filter(
      (a) => typeof a === "string" && a.trim() !== "" && !used.includes(a)
    );
  
    setDroppedAnswers(initialAnswer || {});
    setAvailableAnswers(newAvailable);
  }, [correctAnswers, initialAnswer]);
  

  // Gán nội dung vào container và cập nhật các cloze
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = question.question_text;
    const clozes = container.querySelectorAll("a.cloze");

    clozes.forEach((cloze, index) => {
      cloze.textContent = droppedAnswers[index] || "\u00A0";

      cloze.style.border = "1px dashed #aaa";
      cloze.style.minWidth = "80px";
      cloze.style.display = "inline-block";
      cloze.style.padding = "4px 8px";
      cloze.style.textAlign = "center";
      cloze.style.cursor = editable ? "not-allowed" : "pointer";
      cloze.style.userSelect = "none";
      cloze.style.backgroundColor = droppedAnswers[index]
        ? "#e9f5ff"
        : "transparent";

      if (!editable) {
        cloze.ondragover = (e) => e.preventDefault();
        cloze.ondrop = (e) => handleDrop(e, index);
        cloze.ondblclick = (e) => {
          e.preventDefault();
          handleDoubleClick(index);
        };
        cloze.onclick = (e) => e.preventDefault();
      }
    });
  }, [question.question_text, droppedAnswers, editable]);

  const handleDrop = (e, index) => {
    if (editable) return;

    e.preventDefault();
    const answer = e.dataTransfer.getData("text");

    if (droppedAnswers[index] || !availableAnswers.includes(answer)) return;

    const updated = { ...droppedAnswers, [index]: answer };
    setDroppedAnswers(updated);
    setAvailableAnswers((prev) => prev.filter((a) => a !== answer));
    onAnswerChange(questionId, updated);

  };

  const handleDoubleClick = (index) => {
    if (editable) return;

    const removed = droppedAnswers[index];
    if (!removed) return;

    const updated = { ...droppedAnswers };
    delete updated[index];

    setDroppedAnswers(updated);
    setAvailableAnswers((prev) => [...prev, removed]);
    onAnswerChange(questionId, updated);

  };

  const handleDragStart = (e, text) => {
    if (editable) return;
    e.dataTransfer.setData("text", text);
  };

  return (
    <div>
      {/* Các đáp án kéo được */}
      {!editable && (
        <div className="mb-3 d-flex gap-2 flex-wrap">
          {availableAnswers.map((ans, idx) => (
            <div
              key={idx}
              className="btn btn-outline-primary fw-bold"
              draggable
              onDragStart={(e) => handleDragStart(e, ans)}
            >
              {ans}
            </div>
          ))}
        </div>
      )}

      {/* Nội dung văn bản có chứa <a class="cloze"> */}
      <div ref={containerRef} className="border rounded p-3" />
    </div>
  );
};

export default DragDropRichRenderer;
