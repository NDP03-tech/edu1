import React, { useEffect, useState } from 'react';
import { Button, Input, List, message, Typography, Modal, Card, Row, Col, Divider } from 'antd';
import { PlusOutlined, BookOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/categories');
      setCategories(res.data);
    } catch (err) {
      message.error('Failed to fetch categories');
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      return message.warning('Category name cannot be empty.');
    }

    try {
      const res = await axios.post('http://localhost:5000/api/categories', { name: newCategory });
      setCategories(prev => [...prev, res.data]);
      setNewCategory('');
      message.success('Category added successfully!');
    } catch (err) {
      message.error('❌ Category already exists or an error occurred.');
    }
  };

  const fetchQuizzesByCategory = async (catName) => {
    setSelectedCategory(catName);
    try {
      const res = await axios.get(`http://localhost:5000/api/categories/${catName}/quizzes`);
      setQuizzes(res.data);
    } catch (err) {
      message.error('Failed to fetch quizzes.');
    }
  };

  const handleQuizClick = (quizId) => {
    navigate(`/user/do-quiz/${quizId}`);
  };

  const handleDeleteCategory = (cat) => {
    Modal.confirm({
      title: `Delete category "${cat.name}"?`,
      content: 'This will also delete all quizzes in this category.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`http://localhost:5000/api/categories/${cat._id}`);
          setCategories(prev => prev.filter(c => c._id !== cat._id));

          if (selectedCategory === cat.name) {
            setSelectedCategory('');
            setQuizzes([]);
          }

          message.success('Category and its quizzes deleted.');
        } catch (err) {
          message.error('Failed to delete category.');
        }
      },
    });
  };

  return (
    <div className="container mt-4">
      <Title level={3}>📚 Quiz Categories</Title>

      <Card className="mb-4" title="Manage Categories">
        <Row gutter={[8, 8]} align="middle">
          <Col xs={24} sm={16} md={12}>
            <Input
              placeholder="Enter new category"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Button type="primary" icon={<PlusOutlined />} onClick={addCategory} block>
              Add
            </Button>
          </Col>
        </Row>

        <Divider />

        <Row gutter={[12, 12]} className="mt-3">
          {categories.map((cat) => (
            <Col key={cat._id}>
              <Button
                type={cat.name === selectedCategory ? 'primary' : 'default'}
                icon={<BookOutlined />}
                onClick={() => fetchQuizzesByCategory(cat.name)}
              >
                {cat.name}
              </Button>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteCategory(cat)}
                style={{ marginLeft: '6px' }}
              />
            </Col>
          ))}
        </Row>
      </Card>

      {selectedCategory && (
        <>
          <Title level={4}>📋 Quizzes in: <strong>{selectedCategory}</strong></Title>
          {quizzes.length === 0 ? (
            <p>No quizzes available.</p>
          ) : (
            <List
              bordered
              dataSource={quizzes}
              renderItem={(quiz) => (
                <List.Item
                  key={quiz._id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleQuizClick(quiz._id)}
                >
                  {quiz.title || 'Untitled Quiz'}
                </List.Item>
              )}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CategoryPage;
