import React, { useEffect, useState } from 'react';
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
  const [answers, setAnswers] = useState(initialAnswer || {});

  useEffect(() => {
    setAnswers(initialAnswer || {});
  }, [initialAnswer]);

  const handleChange = (index, value) => {
    const updated = { ...answers, [index]: value };
    setAnswers(updated);
    onAnswerChange?.(question._id, updated);
  };

  const getStyle = (index) => {
    if (!showCorrectAnswer) return {};
    if (answerStatus[index] === true) {
      return { backgroundColor: '#d4edda', borderColor: '#28a745' };
    } else if (answerStatus[index] === false) {
      return { backgroundColor: '#f8d7da', borderColor: '#dc3545' };
    }
    return {};
  };

  const parseQuestionText = () => {
    const container = document.createElement('div');
    container.innerHTML = question.question_text;
    let gapIndex = 0;

    const walkNodes = (node) => {
      const children = [];

      node.childNodes.forEach((child, i) => {
        if (child.nodeType === Node.TEXT_NODE && child.textContent.trim()) {
          children.push(child.textContent);
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const el = child;
          const tagName = el.tagName.toLowerCase();
          const isVoidTag = ['br', 'img', 'hr', 'input', 'meta', 'link'].includes(tagName);
          const style = Object.fromEntries([...el.style].map(k => [k, el.style[k]]));

          if (el.classList.contains('cloze')) {
            const index = gapIndex++;
            const correct = question?.gaps?.correct_answers?.[index];
            const currentValue = showCorrectAnswer && frozenAnswers?.[index] !== undefined
              ? frozenAnswers[index]
              : answers?.[index] ?? '';

            const isIncorrect = showCorrectAnswer && answerStatus[index] === false;

            if (el.classList.contains('dropdown')) {
              let options = [];
              try {
                options = JSON.parse(el.dataset.options || '[]');
              } catch (e) {
                console.error('Invalid dropdown options JSON:', el.dataset.options);
              }

              children.push(
                <span key={`dropdown-${index}`} style={{ display: 'inline-block' }}>
                  <select
                    className="form-select d-inline-block gap-dropdown"
                    style={{
                      margin: '0 4px',
                      padding: '4px 8px',
                      fontSize: 14,
                      ...getStyle(index),
                    }}
                    disabled={!editable}
                    value={currentValue}
                    onChange={(e) => handleChange(index, e.target.value)}
                  >
                    <option value="" disabled hidden>
                      -- Chọn --
                    </option>
                    {options.map((opt, idx) => (
                      <option key={idx} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {isIncorrect && correct && (
                    <span className="text-muted small ms-1">({correct})</span>
                  )}
                </span>
              );
            } else {
              children.push(
                <span key={`input-${index}`} style={{ display: 'inline-block' }}>
                  <input
                    type="text"
                    className="form-control d-inline-block gap-input"
                    style={{
                      width: 'auto',
                      minWidth: 30,
                      margin: '0 4px',
                      padding: '4px 8px',
                      fontSize: 14,
                      ...getStyle(index),
                    }}
                    disabled={!editable}
                    value={currentValue}
                    onChange={(e) => handleChange(index, e.target.value)}
                  />
                  {isIncorrect && correct && (
                    <span className="text-muted small ms-1">({correct})</span>
                  )}
                </span>
              );
            }
          } else if (isVoidTag) {
            children.push(
              React.createElement(tagName, {
                key: `${tagName}-${i}-${gapIndex}`,
                style,
              })
            );
          } else {
            children.push(
              React.createElement(
                tagName,
                { key: `${tagName}-${i}-${gapIndex}`, style },
                walkNodes(el)
              )
            );
          }
        }
      });

      return children;
    };

    return walkNodes(container);
  };

  return (
    <div style={{ padding: '1px', maxWidth: '1800px', margin: '0 auto' }}>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th className="reading-table-header" style={{ width: '60%' }}></th>
            <th className="reading-table-header" style={{ width: '40%' }}></th>
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
                <div className="rendered-question">{parseQuestionText()}</div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

// Helper to compare student answers with correct ones
export const evaluateAnswers = (answers = {}, correctAnswers = {}) => {
  const result = {};
  for (const index in correctAnswers) {
    result[index] =
      (answers[index]?.trim?.() || '') === (correctAnswers[index]?.trim?.() || '');
  }
  return result;
};

export default ReadingRenderer;
