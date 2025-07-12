import React, { useEffect, useMemo, useRef, useState } from "react";

const DragDropRichRenderer = ({
  question,
  editable = false,
  initialAnswer = {},
  questionId,
  onAnswerChange,
  answerStatus = {},
  showCorrectAnswer = false,
}) => {
  const containerRef = useRef(null);
  const [droppedAnswers, setDroppedAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});
  const [availableAnswers, setAvailableAnswers] = useState([]);
  const hasSavedSubmission = useRef(false);

  // ✅ Xáo trộn options 1 lần duy nhất khi khởi tạo
  const parsedGaps = useMemo(() => {
    const div = document.createElement("div");
    div.innerHTML = question.question_text;
    const result = [];

    const walkNodes = (parent) => {
      parent.childNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node;
          if (el.classList.contains("cloze")) {
            const isDropdown = el.classList.contains("dropdown");
            if (isDropdown) {
              let options = JSON.parse(el.dataset.options || "[]");
              options = [...options].sort(() => Math.random() - 0.5);
              result.push({ type: "dropdown", options });
            } else {
              result.push({ type: "input" });
            }
          } else {
            walkNodes(el);
          }
        }
      });
    };

    walkNodes(div);
    return result;
  }, [question.question_text]);

  useEffect(() => {
    if (showCorrectAnswer && !hasSavedSubmission.current) {
      setSubmittedAnswers({ ...droppedAnswers });
      hasSavedSubmission.current = true;
    }
    if (!showCorrectAnswer) {
      hasSavedSubmission.current = false;
    }
  }, [showCorrectAnswer, droppedAnswers]);

  useEffect(() => {
    const used = Object.values(initialAnswer || {});
    const allAnswers =
      question.gaps?.flatMap((gap) => gap.correct_answers || []) || [];
    const uniqueAnswers = [...new Set(allAnswers)].filter(
      (a) => typeof a === "string" && a.trim() !== "" && !used.includes(a)
    );

    setDroppedAnswers(initialAnswer || {});
    setAvailableAnswers(uniqueAnswers);
  }, [initialAnswer, question.gaps]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = question.question_text;
    const clozes = container.querySelectorAll("a.cloze");

    clozes.forEach((cloze, index) => {
      const gapInfo = parsedGaps[index];
      const gapType = gapInfo?.type;

      const currentAnswer = droppedAnswers[index];
      const answerForGrading = showCorrectAnswer
        ? submittedAnswers[index]
        : currentAnswer;
      const isCorrect = showCorrectAnswer && answerStatus?.[index] === true;

      if (gapType === "dropdown") {
        const select = document.createElement("select");
        select.className = "form-select d-inline-block gap-dropdown";
        select.style.margin = "0 4px";
        select.style.padding = "4px 8px";
        select.style.fontSize = "14px";
        select.style.maxWidth = "150px";

        if (showCorrectAnswer) {
          select.style.backgroundColor = isCorrect ? "#d4edda" : "#f8d7da";
          select.style.borderColor = isCorrect ? "#28a745" : "#dc3545";
        }

        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = "-- Select --";
        placeholder.disabled = true;
        placeholder.hidden = true;
        if (!answerForGrading) {
          placeholder.selected = true;
        }
        select.appendChild(placeholder);

        // ✅ KHÔNG xáo trộn lại, dùng options đã shuffle sẵn trong parsedGaps
        (gapInfo.options || []).forEach((opt) => {
          const option = document.createElement("option");
          option.value = opt;
          option.textContent = opt;
          if (opt === answerForGrading) {
            option.selected = true;
          }
          select.appendChild(option);
        });

        select.disabled = editable || showCorrectAnswer;

        select.onchange = (e) => {
          const value = e.target.value;
          const updated = { ...droppedAnswers, [index]: value };
          setDroppedAnswers(updated);
          onAnswerChange(questionId, updated);
        };

        cloze.replaceWith(select);
        return;
      }

      // Drag-Drop Input
      cloze.textContent = answerForGrading || "\u00A0";
      cloze.style.border = "1px dashed #aaa";
      cloze.style.minWidth = "80px";
      cloze.style.display = "inline-block";
      cloze.style.padding = "4px 8px";
      cloze.style.textAlign = "center";
      cloze.style.userSelect = "none";
      cloze.style.margin = "0 4px";
      cloze.style.cursor = editable ? "not-allowed" : "pointer";

      if (showCorrectAnswer) {
        cloze.style.backgroundColor = isCorrect ? "#d4edda" : "#f8d7da";
        cloze.style.borderColor = isCorrect ? "#28a745" : "#dc3545";
      } else {
        cloze.style.backgroundColor = currentAnswer ? "#e9f5ff" : "transparent";
      }

      if (!editable) {
        cloze.ondragover = (e) => e.preventDefault();
        cloze.ondrop = (e) => handleDrop(e, index);
        cloze.ondblclick = () => handleDoubleClick(index);
        cloze.onclick = (e) => e.preventDefault();
      }
    });
  }, [
    question.question_text,
    droppedAnswers,
    submittedAnswers,
    editable,
    parsedGaps,
    showCorrectAnswer,
    answerStatus,
  ]);

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
      <div ref={containerRef} className="border rounded p-3" />
    </div>
  );
};

export default DragDropRichRenderer;
