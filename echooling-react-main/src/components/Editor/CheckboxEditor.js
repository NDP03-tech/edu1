import React, { useState } from "react";
import { Editor } from "@tinymce/tinymce-react";

const CheckboxesEditor = ({ options = [], setOptions }) => {
  const [editingIndex, setEditingIndex] = useState(null); // Chỉ số đang chỉnh sửa bằng TinyMCE

  const handleOptionChange = (index) => {
    const updated = options.map((opt, i) =>
      i === index ? { ...opt, isCorrect: !opt.isCorrect } : opt
    );
    setOptions(updated);
  };

  const handleTextChange = (index, text) => {
    const updated = options.map((opt, i) =>
      i === index ? { ...opt, text } : opt
    );
    setOptions(updated);
  };

  const handleEditorChange = (content, index) => {
    const updated = options.map((opt, i) =>
      i === index ? { ...opt, text: content } : opt
    );
    setOptions(updated);
  };

  const handleRemoveOption = (index) => {
    const updated = options.filter((_, i) => i !== index);
    setOptions(updated);
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleAddOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  return (
    <div className="mt-3">
      <h5>🗹 Checkbox Options</h5>
      {Array.isArray(options) &&
        options.map((option, index) => (
          <div key={option._id || index} className="mb-3 border p-2 rounded">
            <div className="d-flex align-items-start mb-2 flex-wrap gap-2">
              <input
                type="checkbox"
                style={{ width: "20px", height: "20px" }}
                checked={option.isCorrect}
                onChange={() => handleOptionChange(index)}
                className="form-check-input mt-1"
              />

              {editingIndex === index ? (
                <div className="flex-grow-1" style={{ minWidth: "300px" }}>
                  <Editor
                    apiKey="no-api-key" // Dùng key thật nếu deploy
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
                  className="form-control"
                  placeholder={`Option ${index + 1}`}
                  style={{ minWidth: "300px", maxWidth: "500px" }}
                />
              )}

              <div className="btn-group mt-1">
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() =>
                    setEditingIndex(editingIndex === index ? null : index)
                  }
                >
                  {editingIndex === index ? "Close" : "Edit"}
                </button>
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => handleRemoveOption(index)}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        ))}

      <button className="btn btn-secondary mt-2" onClick={handleAddOption}>
        ➕ Add Option
      </button>
    </div>
  );
};

export default CheckboxesEditor;
