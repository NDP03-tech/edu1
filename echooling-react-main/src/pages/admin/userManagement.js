import React, { useEffect, useState } from 'react';
import {
  Form,
  Input,
  Select,
  Button,
  Table,
  Row,
  Col,
  Typography,
  Popconfirm,
  message,
  Space,
  Card,
  Divider,
  Drawer,
  Avatar
} from 'antd';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const highlightText = (text, keyword) => {
  if (!keyword) return text;
  const regex = new RegExp(`(${keyword})`, 'gi');
  const parts = String(text).split(regex);
  return parts.map((part, index) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <Text mark key={index}>{part}</Text>
    ) : (
      <span key={index}>{part}</span>
    )
  );
};

const RenderFormField = ({ name, label, required, type, options }) => (
  <Form.Item
    name={name}
    label={label}
    rules={required ? [{ required: true }] : []}
  >
    {type === 'password' ? (
      <Input.Password />
    ) : type === 'select' ? (
      <Select>{options.map(o => <Option key={o} value={o}>{o}</Option>)}</Select>
    ) : (
      <Input />
    )}
  </Form.Item>
);

const UserManager = () => {
  const [form] = Form.useForm();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const defaultValues = {
    email: '',
    password: '',
    role: 'user',
    firstName: '',
    lastName: '',
    studentPhone: '',
    guardianPhone: '',
    studentEmail: '',
    guardianEmail: '',
    address: '',
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/users', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setUsers(res.data);
    } catch (err) {
      console.error('Error fetching users', err);
      if (err.response?.status === 401) {
        message.error('Bạn chưa đăng nhập hoặc không có quyền');
      }
    } finally {
      setLoading(false);
    }
  };

  const onFinish = async (values) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (editingUser) {
        await axios.put(`http://localhost:5000/api/users/${editingUser._id}`, values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success('User updated');
      } else {
        await axios.post('http://localhost:5000/api/users', values, {
          headers: { Authorization: `Bearer ${token}` },
        });
        message.success('User added');
      }
      form.resetFields();
      setEditingUser(null);
      setIsDrawerOpen(false);
      fetchUsers();
    } catch (err) {
      console.error('Error saving user', err);
      message.error('Error saving user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    form.setFieldsValue({ ...user, password: '' });
    setIsDrawerOpen(true);
  };

  const handleAddUser = () => {
    setEditingUser(null);
    form.setFieldsValue(defaultValues);
    setIsDrawerOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('User deleted');
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user', err);
      message.error('Error deleting user');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setIsDrawerOpen(false);
    form.resetFields();
  };

  const matchesSearch = (user) => {
    const fieldsToSearch = [
      user.email,
      user.role,
      user.firstName,
      user.lastName,
      user.studentPhone,
      user.guardianPhone,
      user.studentEmail,
      user.guardianEmail,
      user.address,
    ];
    return fieldsToSearch.some((field) =>
      field?.toLowerCase().includes(search.toLowerCase())
    );
  };

  const filteredUsers = users.filter(matchesSearch);

  const columns = [
    {
      title: 'Email',
      dataIndex: 'email',
      render: (text, record) => (
        <Space>
          <Avatar>{record.lastName?.charAt(0) || record.firstName?.charAt(0) || '?'}</Avatar>
          {highlightText(text, search)}
        </Space>
      )
    },
    {
      title: 'Role',
      dataIndex: 'role',
      render: (text) => highlightText(text, search),
    },
    {
      title: 'Name',
      render: (_, record) => highlightText(`${record.firstName || ''} ${record.lastName || ''}`, search),
    },
    {
      title: 'Student Phone',
      dataIndex: 'studentPhone',
      render: (text) => highlightText(text, search),
    },
    {
      title: 'Guardian Phone',
      dataIndex: 'guardianPhone',
      render: (text) => highlightText(text, search),
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleEdit(record)} type="link">Edit</Button>
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record._id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </Space>
      )
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Input.Search
        placeholder="Search by any field (except password)..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginBottom: 16, maxWidth: 400 }}
        allowClear
      />
      <Button type="primary" onClick={handleAddUser} style={{ marginBottom: 16 , marginLeft: 14 }}>
        Add User
      </Button>
      <Divider orientation="left">User List</Divider>
      <Table
        columns={columns}
        dataSource={filteredUsers.map((u) => ({ ...u, key: u._id }))}
        loading={loading}
        bordered
        scroll={{ x: 'max-content' }}
        pagination={{ pageSize: 5 }}
      />

      <Drawer
        title={editingUser ? 'Edit User' : 'Add User'}
        width={600}
        onClose={handleCancelEdit}
        open={isDrawerOpen}
        destroyOnClose
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
        >
          <Row gutter={16}>
            {[
              { name: 'email', label: 'Email', required: true },
              { name: 'password', label: 'Password', required: !editingUser, type: 'password' },
              { name: 'role', label: 'Role', type: 'select', options: ['user', 'admin'] },
              { name: 'firstName', label: 'First Name' },
              { name: 'lastName', label: 'Last Name' },
              { name: 'studentPhone', label: 'Student Phone' },
              { name: 'guardianPhone', label: 'Guardian Phone' },
              { name: 'studentEmail', label: 'Student Email' },
              { name: 'guardianEmail', label: 'Guardian Email' },
              { name: 'address', label: 'Address', full: true },
            ].map(({ name, label, required, type, options, full }) => (
              <Col key={name} xs={24} md={full ? 24 : 12}>
                <RenderFormField name={name} label={label} required={required} type={type} options={options} />
              </Col>
            ))}
          </Row>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>Save</Button>
              <Button onClick={handleCancelEdit}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>
    </div>
  );
};

export default UserManager;
