import React, { useEffect, useRef } from 'react';
import './ReadingRenderer.css';

const ReadingRenderer = ({ question, editable = true, initialAnswer = {}, onAnswerChange }) => {
  const containerRef = useRef(null);

  // Parse và render nội dung câu hỏi với các ô điền/cloze
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const div = document.createElement('div');
    div.innerHTML = question.question_text || '';

    const clozes = div.querySelectorAll('a.cloze');

    clozes.forEach((el, index) => {
      const isDropdown = el.classList.contains('dropdown');
      const answerKey = index.toString();
      const userValue = initialAnswer?.[answerKey] || '';

      if (isDropdown) {
        const correctAnswer = el.dataset.answer;
        const options = JSON.parse(el.dataset.options || '[]');

        const select = document.createElement('select');
        select.className = 'form-select d-inline-block gap-dropdown';
        select.style.width = 'auto';
        select.style.margin = '0 4px';
        select.style.padding = '4px 8px';
        select.style.fontSize = '14px';

        const placeholder = document.createElement('option');
        placeholder.textContent = '-- Chọn --';
        placeholder.disabled = true;
        placeholder.hidden = true;
        placeholder.value = '';
        select.appendChild(placeholder);

        options.forEach((opt) => {
          const option = document.createElement('option');
          option.value = opt;
          option.textContent = opt;
          select.appendChild(option);
        });

        select.value = userValue || '';
        select.disabled = !editable;

        // Lưu thay đổi khi chọn
        select.onchange = (e) => {
          const updated = { ...initialAnswer, [answerKey]: e.target.value };
          onAnswerChange && onAnswerChange(updated);
        };

        el.replaceWith(select);
      } else {
        const input = document.createElement('input');
        input.type = 'text';
        input.setAttribute('data-answer', el.textContent.trim());
        input.className = 'form-control d-inline-block gap-input';
        input.placeholder = '';
        input.style.width = 'auto';
        input.style.minWidth = '30px';
        input.style.margin = '0 4px';
        input.style.padding = '4px 8px';
        input.style.fontSize = '14px';
        input.style.display = 'inline-block';
        input.value = userValue || '';
        input.disabled = !editable;

        input.oninput = (e) => {
          const updated = { ...initialAnswer, [answerKey]: e.target.value };
          onAnswerChange && onAnswerChange(updated);
        };

        el.replaceWith(input);
      }
    });

    container.innerHTML = '';
    container.appendChild(div);
  }, [question.question_text, initialAnswer, editable, onAnswerChange]);

  return (
    <div className="container my-4">
      <h5 className="mb-3">🧠 Reading Task</h5>
      <table className="table table-bordered">
        <thead>
          <tr className="table-light">
            <th style={{ width: '50%' }}>📘 Reading Passage</th>
            <th style={{ width: '50%' }}>📝 Question</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              dangerouslySetInnerHTML={{ __html: question.readingContent || '' }}
              className="scrollable-content"
            />
            <td ref={containerRef} className="scrollable-content" />
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ReadingRenderer;
