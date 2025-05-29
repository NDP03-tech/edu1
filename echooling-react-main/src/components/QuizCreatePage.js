import React from "react";
import { useNavigate } from "react-router-dom";

const QuizCreatePage = () => {
  const navigate = useNavigate();

  const handleCreateQuiz = async () => {
    try {
      const token = localStorage.getItem("token"); // ✅ Lấy token từ localStorage

      const res = await fetch("http://localhost:5000/api/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`, // ✅ Gửi token
        },
        body: JSON.stringify({
          title: "Untitled Quiz",
          description: "",
          category: "general",
        }),
      });

      if (!res.ok) {
        const error = await res.json();
        console.error("❌ Server trả về lỗi:", error);
        throw new Error("Tạo quiz thất bại");
      }

      const data = await res.json();
      const createdQuizId = data._id;

      navigate(`/admin/quiz-builder/${createdQuizId}`); // ✅ Điều hướng đúng
    } catch (err) {
      console.error("❌ Lỗi khi tạo quiz:", err);
      alert("Không thể tạo quiz. Vui lòng thử lại.");
    }
  };

  return (
    <div className="container my-5">
      <h2>Tạo Quiz Mới</h2>
      <button className="btn btn-primary" onClick={handleCreateQuiz}>
        ➕ Create Quiz
      </button>
    </div>
  );
};

export default QuizCreatePage;
