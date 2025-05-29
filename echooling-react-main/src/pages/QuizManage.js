import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const QuizManage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [quizzesPerPage] = useState(5);
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000/api/quizzes";

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setQuizzes(res.data);
    } catch (err) {
      console.error("❌ Error fetching quizzes", err);
    } finally {
      setLoading(false);
    } 
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data.map(c => c.name));
    } catch (err) {
      console.error("❌ Error fetching categories", err);
    }
  };

  const handleEdit = (quizId) => {
    navigate(`/admin/quiz-builder/${quizId}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn chắc chắn muốn xoá quiz này?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/quizzes/${id}`);
      fetchQuizzes();
    } catch (err) {
      console.error("❌ Error deleting quiz", err);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedQuizzes.length === 0 || !window.confirm("Bạn chắc chắn muốn xoá các quiz đã chọn?")) return;

    try {
      await Promise.all(selectedQuizzes.map((id) => axios.delete(`${API_BASE}/${id}`)));
      fetchQuizzes();
      setSelectedQuizzes([]); // Reset danh sách đã chọn
    } catch (err) {
      console.error("❌ Error deleting selected quizzes", err);
    }
  };

  const handleCheckboxChange = (quizId) => {
    setSelectedQuizzes((prev) =>
      prev.includes(quizId) ? prev.filter(id => id !== quizId) : [...prev, quizId]
    );
  };

  useEffect(() => {
    fetchQuizzes();
    fetchCategories();
  }, []);

  const filteredQuizzes = selectedCategory === "all" 
    ? quizzes 
    : quizzes.filter(quiz => quiz.category === selectedCategory);

  // Tính toán các chỉ số phân trang
  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);
  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);

  return (
    <div className="container mt-4">
      <h3 className="mb-3">📋 Quản lý Quiz</h3>

      <div className="mb-4">
        <label>Chọn Danh Mục:</label>
        <select
          className="form-control"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Tất cả</option>
          {categories.map((cat, index) => (
            <option key={index} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <button
        className="btn btn-danger mb-3"
        onClick={handleBulkDelete}
      >
        🗑️ Xoá các quiz đã chọn
      </button>

      {loading ? (
        <div>⏳ Đang tải danh sách...</div>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  onChange={(e) => setSelectedQuizzes(e.target.checked ? filteredQuizzes.map(q => q._id) : [])}
                  checked={selectedQuizzes.length === filteredQuizzes.length}
                />
              </th>
              <th>Tiêu đề</th>
              <th>Danh mục</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {currentQuizzes.map((quiz) => (
              <tr key={quiz._id}>
                <td>
                  <input
                    type="checkbox"
                    checked={selectedQuizzes.includes(quiz._id)}
                    onChange={() => handleCheckboxChange(quiz._id)}
                  />
                </td>
                <td>{quiz.title}</td>
                <td>{quiz.category}</td>
                <td>
                  <button
                    className="btn btn-sm btn-warning me-2"
                    onClick={() => handleEdit(quiz._id)}
                  >
                    ✏️ Sửa
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(quiz._id)}
                  >
                    🗑️ Xoá
                  </button>
                </td>
              </tr>
            ))}
            {filteredQuizzes.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center">
                  Không có quiz nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Phân trang */}
      <div className="pagination">
        <button
          className="btn btn-secondary me-2"
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          &laquo; Trước
        </button>
        <span>Trang {currentPage} / {totalPages}</span>
        <button
          className="btn btn-secondary ms-2"
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
        >
          Tiếp &raquo;
        </button>
      </div>
    </div>
  );
};

export default QuizManage;