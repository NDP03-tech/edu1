import React, { useEffect, useRef } from 'react';
import './ReadingRenderer.css';

const ReadingRenderer = ({
  question,
  initialAnswer = {},
  onAnswerChange,
  frozenAnswers = {},
  answerStatus = {},
  showCorrectAnswer = false,
  editable = true,
}) => {
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const clozes = container.querySelectorAll('a.cloze');
    let gapIdx = 0;
    let dropdownIdx = 0;

    clozes.forEach((el) => {
      const isDropdown = el.classList.contains('dropdown');
      const index = isDropdown ? dropdownIdx : gapIdx;
      const value = showCorrectAnswer
        ? frozenAnswers?.[index] ?? ''
        : initialAnswer?.[index] ?? '';

      const style = {};
      if (showCorrectAnswer) {
        if (answerStatus[index] === true) {
          style.backgroundColor = '#d4edda';
          style.border = '1px solid #28a745';
        } else if (answerStatus[index] === false) {
          style.backgroundColor = '#f8d7da';
          style.border = '1px solid #dc3545';
        }
      }

      const onChange = (e) => {
        const newVal = e.target.value;
        onAnswerChange?.(question._id, {
          ...(initialAnswer || {}),
          [index]: newVal,
        });
      };

      let inputEl;
      if (isDropdown) {
        const options = question.dropdowns?.[dropdownIdx]?.options || [];
        inputEl = document.createElement('select');
        inputEl.className = 'form-select d-inline-block gap-dropdown';
        inputEl.style.padding = '4px 8px';
        inputEl.disabled = !editable;

        const defaultOption = document.createElement('option');
        defaultOption.text = '-- Select --';
        defaultOption.disabled = true;
        defaultOption.hidden = true;
        defaultOption.value = '';
        inputEl.appendChild(defaultOption);

        options.forEach((opt) => {
          const option = document.createElement('option');
          option.value = opt;
          option.text = opt;
          inputEl.appendChild(option);
        });

        inputEl.value = value;
        inputEl.onchange = onChange;
        dropdownIdx++;
      } else {
        inputEl = document.createElement('input');
        inputEl.type = 'text';
        inputEl.className = 'form-control d-inline-block gap-input';
        inputEl.style.minWidth = '30px';
        inputEl.style.padding = '4px 8px';
        inputEl.disabled = !editable;
        inputEl.value = value;
        inputEl.oninput = onChange;
        gapIdx++;
      }

      Object.assign(inputEl.style, style);
      el.replaceWith(inputEl);
    });
  }, [
    question?._id,
    question.question_text,
    question.dropdowns,
    initialAnswer,
    frozenAnswers,
    answerStatus,
    showCorrectAnswer,
    editable,
    onAnswerChange,
  ]);

  return (
    <div style={{ padding: '1px', maxWidth: '1800px', margin: '0 auto' }}>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th className="reading-table-header" style={{ width: '60%' }}>
            
            </th>
            <th className="reading-table-header" style={{ width: '40%' }}>
             
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <div
                className="scrollable-left"
                dangerouslySetInnerHTML={{ __html: question.readingContent }}
              />
            </td>
            <td>
              <div className="scrollable-right">
                <div
                  ref={containerRef}
                  className="rendered-question"
                  dangerouslySetInnerHTML={{ __html: question.question_text }}
                />
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ReadingRenderer;
