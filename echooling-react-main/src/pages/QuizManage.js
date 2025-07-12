import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Table,
  Button,
  Select,
  Spin,
  Modal,
  Checkbox,
  Pagination,
  Typography,
  Space,
  message
} from "antd";

const { Option } = Select;
const { Title } = Typography;

const QuizManage = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const quizzesPerPage = 5;
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000/api/quizzes";

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setQuizzes(res.data);
    } catch (err) {
      console.error("❌ Error fetching quizzes", err);
      message.error("Lỗi khi tải danh sách quiz");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data.map((c) => c.name));
    } catch (err) {
      console.error("❌ Error fetching categories", err);
      message.error("Lỗi khi tải danh mục");
    }
  };

  const handleEdit = (quizId) => {
    navigate(`/admin/quiz-builder/${quizId}`);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: "Xác nhận xoá quiz",
      content: "Bạn chắc chắn muốn xoá quiz này?",
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE}/${id}`);
          message.success("Đã xoá quiz thành công");
          fetchQuizzes();
        } catch (err) {
          console.error("❌ Error deleting quiz", err);
          message.error("Xoá quiz thất bại");
        }
      },
    });
  };

  const handleBulkDelete = async () => {
    if (selectedQuizzes.length === 0) return;
    Modal.confirm({
      title: "Xác nhận xoá hàng loạt",
      content: `Bạn có chắc muốn xoá ${selectedQuizzes.length} quiz đã chọn?`,
      onOk: async () => {
        try {
          await Promise.all(
            selectedQuizzes.map((id) => axios.delete(`${API_BASE}/${id}`))
          );
          message.success("Đã xoá các quiz được chọn");
          fetchQuizzes();
          setSelectedQuizzes([]);
        } catch (err) {
          console.error("❌ Error deleting selected quizzes", err);
          message.error("Xoá nhiều quiz thất bại");
        }
      },
    });
  };

  const filteredQuizzes = selectedCategory === "all"
    ? quizzes
    : quizzes.filter((quiz) => quiz.category === selectedCategory);

  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = filteredQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);
  const totalPages = Math.ceil(filteredQuizzes.length / quizzesPerPage);

  const columns = [
    {
      title: <Checkbox
        checked={selectedQuizzes.length === filteredQuizzes.length}
        onChange={(e) => {
          setSelectedQuizzes(
            e.target.checked ? filteredQuizzes.map((q) => q._id) : []
          );
        }}
      />,
      dataIndex: "_id",
      render: (id) => (
        <Checkbox
          checked={selectedQuizzes.includes(id)}
          onChange={() => {
            setSelectedQuizzes((prev) =>
              prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
            );
          }}
        />
      ),
      width: 50
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
    },
    {
      title: "Action",
      key: "actions",
      render: (_, quiz) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(quiz._id)}>
            ✏️ Edit
          </Button>
          <Button danger onClick={() => handleDelete(quiz._id)}>
            🗑️ Delete
          </Button>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchQuizzes();
    fetchCategories();
  }, []);

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="mb-4">
        <span>Select Category </span>
        <Select
          style={{ width: 200 }}
          value={selectedCategory}
          onChange={(value) => setSelectedCategory(value)}
        >
          <Option value="all">All</Option>
          {categories.map((cat, index) => (
            <Option key={index} value={cat}>{cat}</Option>
          ))}
        </Select>
      </div>

      <Button
        danger
        className="mb-4"
        onClick={handleBulkDelete}
        disabled={selectedQuizzes.length === 0}
      >
        🗑️ Delete quizzes choose
      </Button>

      {loading ? (
        <Spin size="large" />
      ) : (
        <Table
          rowKey="_id"
          dataSource={currentQuizzes}
          columns={columns}
          pagination={false}
        />
      )}

      <div className="mt-4 text-center">
        <Pagination
          current={currentPage}
          pageSize={quizzesPerPage}
          total={filteredQuizzes.length}
          onChange={(page) => setCurrentPage(page)}
          showSizeChanger={false}
        />
      </div>
    </div>
  );
};

export default QuizManage;