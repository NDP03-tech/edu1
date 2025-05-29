import React from 'react';
import RichTextEditor from './RichTextEditor'; // Đường dẫn tới file RichTextEditor của bạn

const ReadingTaskEditor = ({
  readingContent,
  setReadingContent,
  questionText,
  setQuestionText,
  onCreateGap,
  onCreateMultipleGap,
  onDeleteGap,
  onAddHint,
  onCreateDropdown
}) => {
  return (
    <div className="container-fluid">
      <div className="row g-4">
        {/* Cột trên: bài đọc */}
        <div className="col-12">
          <label className="form-label fw-bold">📘 Bài đọc</label>
          <RichTextEditor
            value={readingContent}
            onChange={setReadingContent}
            // Không truyền các callback tạo gap để ẩn các nút này trong toolbar
          />
        </div>

        {/* Cột dưới: câu hỏi */}
        <div className="col-12">
          <label className="form-label fw-bold">📝 Câu hỏi</label>
          <RichTextEditor
            value={questionText}
            onChange={setQuestionText}
            onCreateGap={onCreateGap}
            onCreateMultipleGap={onCreateMultipleGap}
            onDeleteGap={onDeleteGap}
            onAddHint={onAddHint}
            onCreateDropdown={onCreateDropdown}
          />
        </div>
      </div>
    </div>
  );
};

export default ReadingTaskEditor;
