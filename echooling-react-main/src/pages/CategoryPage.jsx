import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Input, List, message, Typography } from 'antd';
import { PlusOutlined, BookOutlined, AppstoreAddOutlined } from '@ant-design/icons';

const { Title } = Typography;

const CategoryPage = () => {
  const [categories, setCategories] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const res = await axios.get('http://localhost:5000/api/categories');
    setCategories(res.data);
  };

  const addCategory = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/categories', { name: newCategory });
      setCategories(prev => [...prev, res.data]);
      setNewCategory('');
      message.success('Category added successfully!');
    } catch (err) {
      message.error('❌ Category already exists or an error occurred.');
    }
  };

  const fetchQuizzesByCategory = async (cat) => {
    setSelectedCategory(cat);
    const res = await axios.get(`http://localhost:5000/api/categories/${cat}/quizzes`);
    setQuizzes(res.data);
  };

  return (
    <div className="container mt-4">
      <Title level={2}>
        <AppstoreAddOutlined style={{ marginRight: '8px' }} />
        Quiz Categories
      </Title>

      <div className="mb-3">
        <Input
          placeholder="New category name"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          style={{ width: '300px', marginRight: '8px' }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={addCategory}>
          Add Category
        </Button>
      </div>

      <div className="d-flex flex-wrap gap-3">
        {categories.map(cat => (
          <Button
            key={cat._id}
            type={cat.name === selectedCategory ? 'primary' : 'default'}
            icon={<BookOutlined />}
            onClick={() => fetchQuizzesByCategory(cat.name)}
          >
            {cat.name}
          </Button>
        ))}
      </div>

      <hr />

      {selectedCategory && (
        <>
          <Title level={4}>Quizzes in category: <strong>{selectedCategory}</strong></Title>
          {quizzes.length === 0 ? (
            <p>No quizzes available.</p>
          ) : (
            <List
              bordered
              dataSource={quizzes}
              renderItem={quiz => (
                <List.Item key={quiz._id}>
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