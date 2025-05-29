import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

const MultipleChoiceEditor = ({ options, setOptions }) => {
  const [editingIndex, setEditingIndex] = useState(null);

  const handleOptionChange = (index) => {
    // Chỉ cho phép 1 đáp án đúng
    const newOptions = options.map((option, i) => ({
      ...option,
      isCorrect: i === index,
    }));
    setOptions(newOptions);
  };

  const handleTextChange = (index, text) => {
    const newOptions = options.map((option, i) =>
      i === index ? { ...option, text } : option
    );
    setOptions(newOptions);
  };

  const handleEditorChange = (content, index) => {
    const newOptions = options.map((option, i) =>
      i === index ? { ...option, text: content } : option
    );
    setOptions(newOptions);
  };

  const handleRemoveOption = (index) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleAddOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  return (
    <div className="mt-3">
      <h5>🧠 Các lựa chọn đáp án</h5>
      {options.map((option, index) => (
        <div key={index} className="mb-3 border p-2 rounded">
          <div className="d-flex align-items-start mb-2">
            <input
              type="radio"
              name="multiple-choice"
              checked={option.isCorrect}
              onChange={() => handleOptionChange(index)}
              className="me-2 mt-1"
            />
            <span className="me-2 mt-1 fw-bold">
              {String.fromCharCode(65 + index)}.
            </span>

            {editingIndex === index ? (
              <div className="w-100">
                <Editor
                  apiKey="no-api-key"
                  value={option.text}
                  init={{
                    height: 200,
                    menubar: false,
                    plugins: "link image code lists",
                    toolbar:
                      "undo redo | bold italic underline | bullist numlist | link image | code",
                  }}
                  onEditorChange={(content) =>
                    handleEditorChange(content, index)
                  }
                />
              </div>
            ) : (
              <input
                type="text"
                value={option.text}
                onChange={(e) => handleTextChange(index, e.target.value)}
                className="form-control me-2"
                placeholder={`Option ${index + 1}`}
                style={{ maxWidth: "400px" }}
              />
            )}

            <button
              className="btn btn-outline-primary btn-sm ms-2"
              onClick={() =>
                setEditingIndex(editingIndex === index ? null : index)
              }
            >
              {editingIndex === index ? "Close" : "Edit"}
            </button>
            <button
              className="btn btn-outline-danger btn-sm ms-2"
              onClick={() => handleRemoveOption(index)}
            >
              ✕
            </button>
          </div>
        </div>
      ))}

      <button className="btn btn-secondary" onClick={handleAddOption}>
        Add Option
      </button>
    </div>
  );
};

export default MultipleChoiceEditor;
