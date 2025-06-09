import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Form,
  Input,
  Modal,
  Table,
  Upload,
  message,
} from 'antd';
import { UploadOutlined, SearchOutlined } from '@ant-design/icons';
import { Editor } from '@tinymce/tinymce-react';
import moment from 'moment';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [visible, setVisible] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [form] = Form.useForm();
  const editorRef = useRef();
  const [content, setContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCourses = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:5000/courses', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await response.json();
    setCourses(data);
    setFilteredCourses(data);
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = courses.filter((course) =>
      Object.values(course).some((field) =>
        String(field).toLowerCase().includes(value)
      )
    );
    setFilteredCourses(filtered);
  };

  const handleEdit = (record) => {
    setVisible(true);
    setEditingCourse(record);
    form.setFieldsValue(record);
    setContent(record.content || '');
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    await fetch(`http://localhost:5000/courses/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    fetchCourses();
  };

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'vestaedu');
    formData.append('cloud_name', 'dubzoozqi');

    const res = await fetch('https://api.cloudinary.com/v1_1/dubzoozqi/image/upload', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    return data.secure_url;
  };

  const onFinish = async (values) => {
    const token = localStorage.getItem('token');
    const method = editingCourse ? 'PUT' : 'POST';
    const url = editingCourse
      ? `http://localhost:5000/courses/${editingCourse._id}`
      : 'http://localhost:5000/courses';

    const body = {
      ...values,
      content,
    };

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      message.error('Lỗi khi lưu khóa học!');
      return;
    }

    message.success(editingCourse ? 'Cập nhật thành công' : 'Tạo mới thành công');
    setVisible(false);
    setEditingCourse(null);
    form.resetFields();
    fetchCourses();
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Author', dataIndex: 'author', key: 'author' },
    { title: 'Language', dataIndex: 'language', key: 'language' },
    { title: 'Price', dataIndex: 'price', key: 'price' },
    { title: 'Lessons', dataIndex: 'lesson', key: 'lesson' },
    { title: 'Duration', dataIndex: 'duration', key: 'duration' },
    { title: 'Type', dataIndex: 'type', key: 'type' },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => moment(text).format('YYYY-MM-DD'),
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>
            Edit
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Input
        placeholder="Search courses..."
        prefix={<SearchOutlined />}
        value={searchTerm}
        onChange={handleSearch}
        className="mb-4"
      />

      <Button
        type="primary"
        onClick={() => {
          setVisible(true);
          setEditingCourse(null);
          form.resetFields();
          setContent('');
        }}
        className="mb-4"
      >
        Add Course
      </Button>

      <Table
        rowKey="_id"
        dataSource={filteredCourses}
        columns={columns}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={editingCourse ? 'Edit Course' : 'Add Course'}
        open={visible}
        onCancel={() => setVisible(false)}
        onOk={() => form.submit()}
        width={1000}
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item name="name" label="Course Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="author" label="Author">
            <Input />
          </Form.Item>
          <Form.Item name="language" label="Language">
            <Input />
          </Form.Item>
          <Form.Item name="lesson" label="Lessons">
            <Input />
          </Form.Item>
          <Form.Item name="price" label="Price">
            <Input />
          </Form.Item>
          <Form.Item name="duration" label="Duration">
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Type">
            <Input />
          </Form.Item>

          <Form.Item label="Course Image" name="image" valuePropName="fileList" getValueFromEvent={(e) => e?.fileList}>
            <Upload
              customRequest={async ({ file, onSuccess }) => {
                const url = await handleUpload(file);
                form.setFieldValue('image', url);
                onSuccess("ok");
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Upload Course Image</Button>
            </Upload>
            {form.getFieldValue('image') && (
              <img src={form.getFieldValue('image')} alt="preview" style={{ width: 100, marginTop: 10 }} />
            )}
          </Form.Item>

          <Form.Item label="Content">
            <Editor
              apiKey="n37usgxk136y7jbgbd22rrry2ki2agrdp3zzkfg8gc0adi22"
              value={content}
              onEditorChange={(value) => setContent(value)}
              init={{
                height: 300,
                menubar: false,
                plugins: 'link image code lists table',
                toolbar: 'undo redo | formatselect | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image',
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCourses;
