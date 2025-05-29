import React, { useEffect, useState } from "react";

const normalizeText = (text) =>
  text.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()\[\]"]/g, "").replace(/\s{2,}/g, " ").trim().toLowerCase();

const stripHtmlTags = (html) => {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
};

const splitTextIntoChunks = (text) => {
  const words = text.split(/(\s+)/);
  let position = 0;
  return words.map((word) => {
    const chunk = {
      text: word,
      start: position,
      end: position + word.length,
      isWhitespace: /^\s+$/.test(word),
    };
    position += word.length;
    return chunk;
  });
};

const FindHighlightRenderer = ({
  question,
  questionId,
  editable = true,
  initialAnswer = [],
  onAnswerChange,
}) => {
  const [chunks, setChunks] = useState([]);
  const [highlights, setHighlights] = useState(initialAnswer);
  const [result, setResult] = useState(null);
  const [selection, setSelection] = useState([]);

  // Log initialAnswer mỗi khi thay đổi (giúp kiểm tra xem data đã load đúng chưa)
  useEffect(() => {
  
    setHighlights(initialAnswer);
  }, [initialAnswer]);

  // Tách text thành chunks mỗi khi câu hỏi (question) thay đổi
  useEffect(() => {
    const rawHtml = question?.question_text || "";
    const stripped = stripHtmlTags(rawHtml.replace(/<a class="cloze" href="#">(.*?)<\/a>/g, "$1"));
    const newChunks = splitTextIntoChunks(stripped);
    setChunks(newChunks);
    
  }, [question]);

  // Log highlights khi thay đổi (giúp kiểm tra highlight đang có)
  useEffect(() => {
  }, [highlights]);

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
      if (!chunk || chunk.isWhitespace) return;

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
        return h.start === chunk.start && h.end === chunk.end;
      });
    });

 
    setHighlights(updated);
    onAnswerChange?.(questionId, updated);
    setSelection([]);
  };

  const checkAnswers = () => {
    const correctAnswers = question.gaps.map((g) => {
      const raw =
        typeof g.correct_answers === "string"
          ? g.correct_answers
          : Array.isArray(g.correct_answers)
          ? g.correct_answers[0]
          : "";
      return {
        text: normalizeText(raw),
        start: g.position,
        end: g.position + g.length,
      };
    });

    let matched = 0;

    correctAnswers.forEach((correct) => {
      const found = highlights.find(
        (h) =>
          h.text === correct.text &&
          Math.abs(h.start - correct.start) <= 2
      );
      if (found) matched += 1;
    });

    setResult({ correct: matched, total: correctAnswers.length });
  };

  return (
    <div>
      {editable && (
        <div className="d-flex gap-2 mb-2">
          <button onClick={highlightSelection} className="btn btn-sm btn-outline-primary">
            Highlight
          </button>
          <button onClick={removeHighlight} className="btn btn-sm btn-outline-danger">
            Remove Highlight
          </button>
          <button onClick={checkAnswers} className="btn btn-sm btn-success">
            ✅ Check Answer
          </button>
        </div>
      )}

      <div
        className="p-3 border rounded"
        onMouseUp={handleMouseUp}
        style={{ userSelect: "text", minHeight: 150, whiteSpace: "pre-wrap" }}
      >
        {chunks.map((chunk, index) => {
          const isHighlighted = highlights.some(
            (h) =>
              Math.abs(h.start - chunk.start) <= 2 &&
              Math.abs(h.end - chunk.end) <= 2
          );
          return (
            <span
              key={index}
              data-index={index}
              style={{
                backgroundColor: isHighlighted ? "yellow" : "transparent",
                whiteSpace: chunk.isWhitespace ? "pre-wrap" : "normal",
              }}
            >
              {chunk.text}
            </span>
          );
        })}
      </div>

      {result && (
        <div className="mt-3 alert alert-info">
          Bạn làm đúng {result.correct}/{result.total} ô trống.
        </div>
      )}
    </div>
  );
};

export default FindHighlightRenderer;