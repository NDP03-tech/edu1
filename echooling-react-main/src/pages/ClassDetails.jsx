import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TableOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Checkbox,
  Select,
  notification,
  Space,
  Typography,
} from 'antd';

const { Title } = Typography;

const ClassDetail = () => {
  const handleViewGrades = (userId) => {
    navigate(`/admin/grades/${userId}`);
  };
  const { id } = useParams();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [editingStudent, setEditingStudent] = useState(null);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedToAdd, setSelectedToAdd] = useState([]);

  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [allClasses, setAllClasses] = useState([]);
  const [targetClassId, setTargetClassId] = useState('');

  const [form] = Form.useForm();

  useEffect(() => {
    fetchClassDetails();
  }, [id]);

  const fetchClassDetails = async () => {
    try {
      const classRes = await axios.get(`http://localhost:5000/api/classes/${id}`);
      setClassInfo(classRes.data);

      const studentsRes = await axios.get(`http://localhost:5000/api/classes/${id}/students`);
      setStudents(studentsRes.data);
    } catch (err) {
      notification.error({ message: 'Failed to fetch class details' });
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student);
    form.setFieldsValue(student);
  };

  const handleSaveEdit = async () => {
    try {
      const values = form.getFieldsValue();
      await axios.put(`http://localhost:5000/api/users/${editingStudent._id}`, values);
      notification.success({ message: 'Student updated successfully' });
      setEditingStudent(null);
      fetchClassDetails();
    } catch {
      notification.error({ message: 'Failed to update student' });
    }
  };

  const handleDelete = async (studentId) => {
    try {
      const token = localStorage.getItem("token")
      await axios.delete(`http://localhost:5000/api/users/${studentId}`);
      notification.success({ message: 'Student deleted' });
      fetchClassDetails();
    } catch {
      notification.error({ message: 'Failed to delete student' });
    }
  };

  const handleBulkRemove = async () => {
    if (!selectedIds.length) return notification.warning({ message: 'No students selected' });
    try {
      await Promise.all(selectedIds.map(id => axios.delete(`http://localhost:5000/api/users/${id}`)));
      notification.success({ message: 'Selected students removed' });
      setSelectedIds([]);
      fetchClassDetails();
    } catch {
      notification.error({ message: 'Failed to remove students' });
    }
  };

  const openAddModal = async () => {
    const res = await axios.get(`http://localhost:5000/api/users`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    });
    setAllUsers(res.data);
    setSelectedToAdd([]);
    setAddModalVisible(true);
  };

  const handleAddStudents = async () => {
    try {
      await axios.post(`http://localhost:5000/api/classes/${id}/students`, {
        studentIds: selectedToAdd,
      });
      notification.success({ message: 'Students added' });
      setAddModalVisible(false);
      fetchClassDetails();
    } catch {
      notification.error({ message: 'Failed to add students' });
    }
  };

  const openMoveModal = async () => {
    const res = await axios.get(`http://localhost:5000/api/classes`);
    setAllClasses(res.data.filter(cls => cls._id !== id));
    setMoveModalVisible(true);
  };

  const handleMoveStudents = async () => {
    if (!targetClassId) return notification.warning({ message: 'Select a class to move to' });
    try {
      await axios.post(`http://localhost:5000/api/classes/move-students`, {
        studentIds: selectedIds,
        fromClassId: id,
        toClassId: targetClassId,
      });
      notification.success({ message: 'Students moved successfully' });
      setSelectedIds([]);
      fetchClassDetails();
      setMoveModalVisible(false);
    } catch {
      notification.error({ message: 'Failed to move students' });
    }
  };

  const columns = [
    {
      title: 'Select',
      render: (_, record) => (
        <Checkbox
          checked={selectedIds.includes(record._id)}
          onChange={(e) => {
            const checked = e.target.checked;
            if (checked) {
              setSelectedIds([...selectedIds, record._id]);
            } else {
              setSelectedIds(selectedIds.filter(id => id !== record._id));
            }
          }}
        />
      ),
    },
    {
      title: 'Name',
      render: (_, record) => `${record.firstName || ''} ${record.lastName || ''}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Password',
      render: () => '••••••',
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>Edit</Button>
          <TableOutlined
  style={{ fontSize: '18px', color: '#1890ff', cursor: 'pointer' }}
  onClick={() => handleViewGrades(record._id)}
  title="View Grades"
/>
        </Space>
      ),
    },
  ];

  return (
    <div className="container mt-4">
      <Title level={3}>👨‍🏫 Class: {classInfo?.name || 'Loading...'}</Title>

      <Space className="mb-3">
        <Button type="primary" onClick={() => navigate(`/admin/quiz-manage?classId=${id}`)}>
          Show Quizzes
        </Button>
        <Button onClick={openAddModal}>Add Students</Button>
        <Button onClick={handleBulkRemove}>Remove Selected</Button>
        <Button onClick={openMoveModal}>Move Selected</Button>
      </Space>

      <Table
        dataSource={students}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
      />

      {/* Edit Modal */}
      <Modal
        open={!!editingStudent}
        title="Edit Student"
        onCancel={() => setEditingStudent(null)}
        onOk={handleSaveEdit}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="First Name" name="firstName">
            <Input />
          </Form.Item>
          <Form.Item label="Last Name" name="lastName">
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email">
            <Input />
          </Form.Item>
          <Form.Item label="Phone" name="studentPhone">
            <Input />
          </Form.Item>
          <Form.Item label="Address" name="address">
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Modal */}
      <Modal
        open={addModalVisible}
        title="Add Students to Class"
        onCancel={() => setAddModalVisible(false)}
        onOk={handleAddStudents}
      >
        <Checkbox
          checked={selectedToAdd.length === allUsers.length && allUsers.length > 0}
          onChange={(e) => setSelectedToAdd(e.target.checked ? allUsers.map(u => u._id) : [])}
        >
          Select All
        </Checkbox>
        <div style={{ maxHeight: 300, overflowY: 'auto', marginTop: 10 }}>
          {allUsers.map(user => (
            <Checkbox
              key={user._id}
              checked={selectedToAdd.includes(user._id)}
              onChange={() => {
                setSelectedToAdd(prev =>
                  prev.includes(user._id)
                    ? prev.filter(id => id !== user._id)
                    : [...prev, user._id]
                );
              }}
            >
              {`${user.firstName} ${user.lastName} (${user.email})`}
            </Checkbox>
          ))}
        </div>
      </Modal>

      {/* Move Modal */}
      <Modal
        open={moveModalVisible}
        title="Move Students to Another Class"
        onCancel={() => setMoveModalVisible(false)}
        onOk={handleMoveStudents}
      >
        <Select
          style={{ width: '100%' }}
          placeholder="Select target class"
          value={targetClassId}
          onChange={setTargetClassId}
        >
          {allClasses.map(cls => (
            <Select.Option key={cls._id} value={cls._id}>
              {cls.name}
            </Select.Option>
          ))}
        </Select>
      </Modal>
    </div>
  );
};

export default ClassDetail;
