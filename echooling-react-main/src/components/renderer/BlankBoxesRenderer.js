import React, { useEffect, useRef } from "react";

const BlankBoxesRenderer = ({
  question,
  initialAnswer = {},
  onAnswerChange,
  answerStatus = {},
  showCorrectAnswer = false,
  editable = true,
}) => {
  const containerRef = useRef();
  const answersRef = useRef({});

  const decodeHtmlEntities = (str) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  };

  const shuffleArray = (arr) => {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  useEffect(() => {
    answersRef.current = initialAnswer || {};
    renderInputs();
  }, [question?._id]);

  useEffect(() => {
    applyAnswerStatus();
  }, [answerStatus, showCorrectAnswer]);

  const handleChange = (index, value) => {
    answersRef.current[index] = value;
    onAnswerChange?.(question._id, { ...answersRef.current });
  };

  const renderInputs = () => {
    const container = containerRef.current;
    if (!container) return;

    const gapElements = container.querySelectorAll(".cloze");

    gapElements.forEach((el, idx) => {
      if (el.tagName === "A") {
        el.addEventListener("click", (e) => e.preventDefault());
      }

      const index = idx.toString();
      const isDropdown = el.classList.contains("dropdown");
      el.innerHTML = "";

      let field;
      if (isDropdown) {
        let options = [];
        try {
          const raw = el.dataset.options || "[]";
          const decoded = decodeHtmlEntities(raw);
          options = JSON.parse(decoded);
        } catch (err) {
          console.error("❌ Dropdown parse error:", err, el.dataset.options);
        }

        if (editable) options = shuffleArray(options);

        field = document.createElement("select");
        field.className = "form-select d-inline-block gap-dropdown";
        field.style = `
          width: auto;
          margin: 0 4px;
          padding: 4px 30px 4px 8px;
          font-size: 14px;
        `;
        if (!editable) field.disabled = true;

        const defaultOption = document.createElement("option");
        defaultOption.value = "";
        defaultOption.textContent = "--Select--";
        defaultOption.disabled = true;
        defaultOption.hidden = true;
        field.appendChild(defaultOption);

        options.forEach((opt) => {
          const optEl = document.createElement("option");
          optEl.value = opt;
          optEl.textContent = opt;
          field.appendChild(optEl);
        });

        field.value = answersRef.current[index] ?? "";
        field.onchange = (e) => handleChange(index, e.target.value);
      } else {
        field = document.createElement("input");
        field.type = "text";
        field.className = "form-control d-inline-block gap-input";
        field.style = `
          width: auto;
          min-width: 30px;
          margin: 0 4px;
          padding: 4px 8px;
          font-size: 14px;
          border-radius: 4px;
          border: 1px solid #ccc;
        `;
        if (!editable) field.disabled = true;

        field.value = answersRef.current[index] ?? "";
        field.oninput = (e) => handleChange(index, e.target.value);
      }

      field.dataset.index = index;
      el.appendChild(field);
    });

    applyAnswerStatus();
    cleanUpAfterRender(container);
  };

  const applyAnswerStatus = () => {
    const container = containerRef.current;
    if (!container || !showCorrectAnswer) return;

    const gapElements = container.querySelectorAll(".cloze");
    gapElements.forEach((el, idx) => {
      const index = idx.toString();
      const input = el.querySelector("input, select");
      const correct = question?.gaps?.correct_answers?.[index];

      if (input) {
        input.style.backgroundColor = "";
        input.style.borderColor = "#ccc";
      }

      el.querySelectorAll(".correct-answer").forEach((n) => n.remove());

      if (input && answerStatus[index] === true) {
        input.style.backgroundColor = "#d4edda";
        input.style.borderColor = "#28a745";
      } else if (input && answerStatus[index] === false) {
        input.style.backgroundColor = "#f8d7da";
        input.style.borderColor = "#dc3545";

        if (correct) {
          const span = document.createElement("span");
          span.className = "correct-answer text-muted small ms-1";
          span.textContent = `(${correct})`;
          el.appendChild(span);
        }
      }
    });
  };

  const cleanUpAfterRender = (container) => {
    const wrappers = container.querySelectorAll(".hint-wrapper");
    wrappers.forEach((wrapper) => {
      const next = wrapper.nextSibling;
      if (next?.nodeType === 3 && next.nodeValue.includes("\u00A0")) {
        next.nodeValue = next.nodeValue.replace(/\u00A0+/g, ""); // Xoá all &nbsp;
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className="rendered-question"
      dangerouslySetInnerHTML={{ __html: question?.question_text || "" }}
    />
  );
};

export default BlankBoxesRenderer;
