import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import RichTextEditor from '../Editor/RichTextEditor';
import ReadingTaskEditor from '../Editor/ReadingTaskEditor';
import ExplanationEditor from '../Explanation/ExplanationEditor';
import QuestionType from '../QuestionType';
import CheckboxesEditor from '../Editor/CheckboxEditor';
import MultipleChoiceEditor from '../Editor/MultipleChoiceEditor';
import 'bootstrap/dist/css/bootstrap.min.css';
import './QuestionForm.css';

const QuestionFormTest = ({
  questionIndex = 0,
  questionData = {},
  onAddQuestion,
  quizId,
  onDelete,
  onFinishEdit,
  onFocusQuestion,
}) => {
  const [questionType, setQuestionType] = useState('');
  const [gaps, setGaps] = useState([]);
  const [dropdowns, setDropdowns] = useState([]);
  const [options, setOptions] = useState([]);
  const [questionText, setQuestionText] = useState('');
  const [readingContent, setReadingContent] = useState('');
  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState(0);
  const [hintWords, setHintWords] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const [questionId, setQuestionId] = useState('');

  useEffect(() => {
    const fetchQuestion = async () => {
      if (questionData._id && (!questionData.questionText || !questionData.questionType)) {
        try {
          const res = await Axios.get(`http://localhost:5000/api/questions/${questionData._id}`);
          setFromData(res.data);
        } catch (err) {
          console.error('❌ Lỗi khi fetch câu hỏi:', err);
        }
      } else {
        setFromData(questionData);
      }
    };
    fetchQuestion();
  }, [questionData]);

  const setFromData = (data) => {
    setQuestionId(data._id || '');
    setQuestionType(data.questionType || data.question_type || '');
    setGaps(data.gaps || []);
    setDropdowns(data.dropdowns || []);
    setOptions(data.options || []);
    setQuestionText(data.questionText || data.question_text || '');
    setReadingContent(data.readingContent || data.reading_content || '');
    setExplanation(data.explanation || '');
    setPoints(data.points || 0);
    setHintWords(data.hintWords || data.hint_words || []);
  };
  

  const handleFocus = () => {
    if (points === 0) setPoints('');
    setIsFocused(true);
  };

  const handleBlur = () => {
    if (points === '') setPoints(0);
    setIsFocused(false);
  };

  const handleEditorFocus = () => {
    onFocusQuestion?.(questionId);
  };

  const handleCreateGap = (selectedText, startPosition) => {
    const newGap = {
      correct_answers: [selectedText],
      position: startPosition,
      length: selectedText.length,
    };
    setGaps((prev) => [...prev, newGap]);
  };
  const handleDeleteGap = (deletedText) => {
    setGaps((prevGaps) => {
      const newGaps = prevGaps.filter(
        (gap) => !gap.correct_answers.includes(deletedText)
      );
      console.log("🔁 Gaps sau khi xoá:", newGaps);
      return newGaps;
    });
  };
  
  const handleAddHint = (word, hint) => {
    // Nếu muốn kiểm tra trùng, có thể dùng logic thêm ở đây
    setHintWords(prev => [...prev, { word, hint }]);
  };

  const handleCreateDropdown = (dropdownData) => {
    setDropdowns(prev => [...prev, dropdownData]);  // thêm dropdown mới vào danh sách
  };

 

  const handleCreateQuestion = async () => {
    const newQuestion = {
      questionType,
      readingContent,
      questionText,
      explanation,
      points,
      gaps,
      dropdowns,
      hintWords,
      quiz_id: quizId,
      ...(questionType === 'checkboxes' || questionType === 'multiple-choice' ? { options } : {}),
    };

    try {
      const response = await Axios.post('http://localhost:5000/api/questions', newQuestion);
      alert('✅ Câu hỏi đã được thêm');
      setQuestionId(response.data._id);
    } catch (error) {
      console.error('❌ Lỗi khi tạo câu hỏi:', error);
      alert('❌ Tạo câu hỏi thất bại.');
    }
  };

  const handleCreateMultipleGap = (selectedText, startPosition) => {
    const answers = selectedText
      .split('#')
      .map(ans => ans.trim())
      .filter(Boolean);
  
    if (answers.length < 2) {
      alert("Multiple gap phải có ít nhất 2 đáp án, ngăn cách bằng dấu #");
      return;
    }
  
    const newGap = {
      correct_answers: answers,
      position: startPosition,
      length: selectedText.length,
      // hiển thị đáp án đầu tiên
    };
    setGaps((prev) => [...prev, newGap]);
  };
  

  const handleUpdateQuestion = async () => {
    const updatedData = {
      questionType,
      readingContent,
      questionText,
      explanation,
      points,
      gaps,
      dropdowns,
      hintWords,
      quiz_id: quizId,
      ...(questionType === 'checkboxes' || questionType === 'multiple-choice' ? { options } : {}),
    };
    console.log("📤 Updating question with:", updatedData); // ✅ CHÈN Ở ĐÂY

    try {
      await Axios.put(`http://localhost:5000/api/questions/${questionId}`, updatedData);
      alert('✅ Cập nhật câu hỏi thành công');
      onFinishEdit?.({ ...updatedData, _id: questionId });
    } catch (error) {
      console.error('❌ Lỗi khi cập nhật câu hỏi:', error);
      alert('❌ Cập nhật thất bại.');
    }
  };

  return (
    <div className="container my-4">
      <div className="border p-4 rounded bg-light position-relative">
        <button
          type="button"
          className="btn-close position-absolute top-0 end-0 m-2"
          aria-label="Close"
          onClick={() => {
            if (window.confirm('Bạn có chắc muốn xoá câu hỏi này?')) {
              onDelete?.(questionIndex, questionId);
            }
          }}
        ></button>

        <h5 className="mb-3">Câu {questionIndex + 1}</h5>

        <div className="d-flex align-items-end justify-content-between mb-3 flex-wrap gap-3">
          <div>
            <QuestionType questionType={questionType} setQuestionType={setQuestionType} />
          </div>

          <div className="d-flex align-items-center gap-2">
            <label htmlFor="points" className="form-label mb-0 fw-bold">
              Points per gap:
            </label>
            <input
              type="number"
              id="points"
              className="form-control"
              style={{ width: '80px' }}
              value={isFocused ? points : points === 0 ? '' : points}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onChange={(e) => setPoints(Number(e.target.value))}
            />
          </div>
        </div>

        {questionType === 'reading' ? (
  <ReadingTaskEditor
    readingContent={readingContent}
    setReadingContent={setReadingContent}
    questionText={questionText}
    setQuestionText={setQuestionText}
    onCreateGap={handleCreateGap}
    onCreateDropdown={handleCreateDropdown}
    onFocus={handleEditorFocus}
  />
) : (
  <>
    <div>
      <label className="form-label fw-bold">📝 Câu hỏi</label>
      <RichTextEditor
        key={questionData?._id || 'new'}
        value={questionText}
        onChange={setQuestionText}
        onDeleteGap={handleDeleteGap}
        onCreateMultipleGap={handleCreateMultipleGap}
        onCreateGap={handleCreateGap}
        onAddHint={handleAddHint}
        onCreateDropdown={handleCreateDropdown}
        onFocus={handleEditorFocus}
      />
    </div>

    {/* Hiển thị phần tùy chọn cho multiple-choice */}
    {questionType === 'multiple-choice' && (
      <MultipleChoiceEditor
      questionText={questionText}
       setQuestionText={setQuestionText}
        options={options}
        setOptions={setOptions}
      />
    )}

    {/* Nếu có loại checkbox */}
    {questionType === 'checkboxes' && (
      <CheckboxesEditor
        options={options}
        setOptions={setOptions}
      />
    )}
  </>
)}


        <div className="mt-4">
          <label className="form-label">🧠 Giải thích:</label>
          <ExplanationEditor value={explanation} onChange={setExplanation} />
        </div>

        <div className="d-flex gap-2 mt-3">
          {!questionId && (
            <button onClick={handleCreateQuestion} className="btn btn-success">
              ✅ Lưu câu hỏi
            </button>
          )}
          {questionId && (
            <button onClick={handleUpdateQuestion} className="btn btn-warning">
              🔄 Cập nhật câu hỏi
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionFormTest;
