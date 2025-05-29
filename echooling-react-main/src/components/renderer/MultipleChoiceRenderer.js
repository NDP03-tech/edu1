import React, { useEffect, useState } from "react";

const MultipleChoiceRenderer = ({
  question,
  editable = false,
  initialAnswer = null,
  onAnswerChange,
}) => {
  const [selectedOptionId, setSelectedOptionId] = useState(initialAnswer);

  useEffect(() => {
    setSelectedOptionId(initialAnswer);
  }, [initialAnswer]);

  const handleOptionChange = (optionId) => {
    if (!editable) return;

    setSelectedOptionId(optionId);
    if (onAnswerChange) {
      onAnswerChange(question._id,optionId); // Gửi option._id đã chọn ra ngoài
    }
  };

  return (
    <div>
      {/* Hiển thị nội dung câu hỏi */}
      {question?.question_text && (
        <div
          className="mb-3"
          dangerouslySetInnerHTML={{ __html: question.question_text }}
        />
      )}

      {/* Danh sách các lựa chọn */}
      <div className="mt-3">
      {question?.options?.map((option, index) => {
  console.log("Option:", option); // ✅

  const optionId = option._id || option.id; // để an toàn nếu _id không có

  return (
    <div key={optionId} className="d-flex align-items-start mb-3">
      <input
        type="radio"
        name={`question-${question._id || "default"}`}
        checked={selectedOptionId === optionId}
        onChange={() => handleOptionChange(optionId)}
        className="me-2 mt-1"
        style={{ width: "20px", height: "20px" }}
        disabled={!editable}
      />
      <div style={{ flex: 1 }}>
        <strong>{String.fromCharCode(97 + index)}.</strong>{" "}
        <span dangerouslySetInnerHTML={{ __html: option.text }} />
      </div>
    </div>
  );
})}

      </div>
    </div>
  );
};

export default MultipleChoiceRenderer;
