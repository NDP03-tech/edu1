import React, { useEffect, useState } from "react";

const normalizeText = (text) =>
  text
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]"]/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .toLowerCase();

const stripHtmlTags = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

// ✅ Mỗi chunk là 1 từ kèm theo khoảng trắng sau (nếu có)
const splitTextIntoChunks = (text) => {
  const regex = /[^\s]+[\s]?/g;
  let match;
  let position = 0;
  const chunks = [];

  while ((match = regex.exec(text)) !== null) {
    const word = match[0];
    chunks.push({
      text: word,
      start: position,
      end: position + word.length,
    });
    position += word.length;
  }

  return chunks;
};

const FindHighlightRenderer = ({
  question,
  questionId,
  editable = true,
  initialAnswer = [],
  onAnswerChange,
}) => {
  const [chunks, setChunks] = useState([]);
  const [highlights, setHighlights] = useState(initialAnswer || []);
  const [selection, setSelection] = useState([]);

  useEffect(() => {
    setHighlights(initialAnswer || []);
  }, [initialAnswer]);

  useEffect(() => {
    const rawHtml = question?.question_text || "";

    // ✅ Replace all cloze-related <a> tags with their text content + space
    const unwrapped = rawHtml.replace(
      /<a\s+[^>]*class="[^"]*cloze[^"]*"[^>]*>(.*?)<\/a>/g,
      "$1 "
    );

    // ✅ Remove all remaining HTML tags
    const stripped = stripHtmlTags(unwrapped).replace(/\s+/g, " ").trim();

    const newChunks = splitTextIntoChunks(stripped);
    setChunks(newChunks);
  }, [question]);

  const handleMouseUp = () => {
    if (!editable) return;
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) {
      setSelection([]);
      return;
    }

    const selectedSpanIds = [];
    const allSpans = document.querySelectorAll("[data-index]");
    const range = selection.getRangeAt(0);

    allSpans.forEach((span) => {
      if (range.intersectsNode(span)) {
        selectedSpanIds.push(parseInt(span.dataset.index, 10));
      }
    });

    setSelection(selectedSpanIds);
  };

  const highlightSelection = () => {
    if (!editable || selection.length === 0) return;
    const newHighlights = [...highlights];
    selection.forEach((index) => {
      const chunk = chunks[index];
      if (!chunk) return;
      const exists = newHighlights.find(
        (h) => h.start === chunk.start && h.end === chunk.end
      );
      if (!exists) {
        newHighlights.push({
          text: normalizeText(chunk.text),
          start: chunk.start,
          end: chunk.end,
        });
      }
    });

    setHighlights(newHighlights);
    onAnswerChange?.(questionId, newHighlights);
    setSelection([]);
  };

  const removeHighlight = () => {
    if (!editable || selection.length === 0) return;

    const updated = highlights.filter((h) => {
      return !selection.some((index) => {
        const chunk = chunks[index];
        return h?.start === chunk?.start && h?.end === chunk?.end;
      });
    });

    setHighlights(updated);
    onAnswerChange?.(questionId, updated);
    setSelection([]);
  };

  return (
    <div>
      {editable && (
        <div className="d-flex gap-2 mb-2">
          <button
            onClick={highlightSelection}
            className="btn btn-sm btn-outline-primary"
          >
            Highlight
          </button>
          <button
            onClick={removeHighlight}
            className="btn btn-sm btn-outline-danger"
          >
            Remove Highlight
          </button>
        </div>
      )}

      <div
        className="p-3 border rounded"
        onMouseUp={handleMouseUp}
        style={{
          userSelect: "text",
          minHeight: 150,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
          width: "100%",
        }}
      >
        {chunks.map((chunk, index) => {
          const isHighlighted = highlights.some(
            (h) =>
              Math.abs(h.start - chunk.start) <= 1 &&
              Math.abs(h.end - chunk.end) <= 1
          );
          return (
            <span
              key={index}
              data-index={index}
              style={{
                backgroundColor: isHighlighted ? "yellow" : "transparent",
                display: "inline-block",
              }}
            >
              {chunk.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default FindHighlightRenderer;
