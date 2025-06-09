import React, { useEffect, useState } from 'react';
import { Button, Input, List, Card, message, Typography, Space, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;

const Classes = () => {
  const [className, setClassName] = useState('');
  const [classList, setClassList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/classes');
      setClassList(res.data);
    } catch (err) {
      message.error('Failed to fetch classes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleAddClass = async () => {
    if (!className.trim()) {
      return message.warning('Class name cannot be empty');
    }

    try {
      await axios.post('http://localhost:5000/api/classes', { name: className });
      setClassName('');
      fetchClasses();
      message.success('Class added');
    } catch (err) {
      message.error('Error adding class');
    }
  };

  const handleDeleteClass = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/classes/${id}`);
      fetchClasses();
      message.success('Class deleted');
    } catch (err) {
      message.error('Error deleting class');
    }
  };

  const handleEditClass = (id) => {
    navigate(`/admin/class/${id}`);
  };

  return (
    <Card  style={{ width: '100%', margin: 'auto' }}>
      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder="Enter new class name"
          value={className}
          onChange={(e) => setClassName(e.target.value)}
          style={{ width: 300 }}
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAddClass}>
          Add Class
        </Button>
      </Space>

      <List
        bordered
        loading={loading}
        dataSource={classList}
        locale={{ emptyText: 'No classes found.' }}
        renderItem={(cls) => (
          <List.Item
            actions={[
              <Button icon={<EyeOutlined />} onClick={() => handleEditClass(cls._id)}>View</Button>,
              <Popconfirm
                title="Delete this class?"
                onConfirm={() => handleDeleteClass(cls._id)}
                okText="Yes"
                cancelText="No"
              >
                <Button danger icon={<DeleteOutlined />} />
              </Popconfirm>
            ]}
          >
            <List.Item.Meta title={cls.name} />
          </List.Item>
        )}
      />
    </Card>
  );
};

export default Classes;
