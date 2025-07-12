import React, { useEffect, useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  message,
  Space,
  Image,
} from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import './AdminCourse.css';

const AdminCourse = () => {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const editorRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/course', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setCourses(data);
        setFilteredCourses(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách khóa học:', error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(course =>
      course.title?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCourses(filtered);
  }, [searchText, courses]);

  const uploadToLocalServer = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload-media', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Upload failed');
      return data.fileUrl;
    } catch (err) {
      message.error('Upload thất bại');
      return null;
    }
  };

  const handleFileUpload = async (options, field) => {
    const { file, onSuccess, onError } = options;
    const url = await uploadToLocalServer(file);
    if (url) {
      form.setFieldValue(field, url);
      message.success(`${field} uploaded`);
      onSuccess("OK");
    } else {
      onError(new Error('Upload failed'));
    }
  };

  const handleEdit = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/course/${id}`);
      const courseToEdit = await response.json();
      setShowModal(true);
      setEditingId(id);
      setEditorContent(courseToEdit.content || '');
      setTimeout(() => {
        form.setFieldsValue(courseToEdit);
      }, 0);
    } catch (error) {
      message.error('Không thể lấy dữ liệu khóa học');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/course/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Xóa thất bại');

      setCourses(prev => prev.filter(course => course._id !== id));
      message.success('Đã xóa khóa học');
    } catch (err) {
      message.error('Lỗi khi xóa khóa học');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const isEdit = !!editingId;
      const updatedCourse = {
        ...values,
        content: editorContent,
        createdAt: new Date().toISOString(),
      };

      const url = isEdit
        ? `http://localhost:5000/api/course/${editingId}`
        : 'http://localhost:5000/api/course/create';

      const method = isEdit ? 'PUT' : 'POST';
      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedCourse),
      });

      if (!response.ok) throw new Error('Lỗi khi lưu khóa học');

      const refreshed = await fetch('http://localhost:5000/api/course', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedCourses = await refreshed.json();
      setCourses(updatedCourses);
      setShowModal(false);
      form.resetFields();
      setEditorContent('');
      setEditingId(null);
      message.success('Lưu thành công');
    } catch (error) {
      console.error('❌ Submit error:', error);
      message.error('Lỗi khi gửi biểu mẫu');
    }
  };

  const columns = [
    { title: 'No.', render: (_, __, index) => index + 1 },
    { title: 'Title', dataIndex: 'title' },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      render: text => new Date(text).toLocaleString(),
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <Space>
          <Button type="primary" onClick={() => handleEdit(record._id)}>Edit</Button>
          <Button type="primary" danger onClick={() => handleDelete(record._id)}>Delete</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-4">
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingId(null);
            setEditorContent('');
            setShowModal(true);
            setTimeout(() => form.resetFields(), 0);
          }}
        >
          Add Course
        </Button>
        <Input.Search
          placeholder="Search by title"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Space>

      <Table columns={columns} dataSource={filteredCourses} rowKey="_id" />

      <Modal
        title={editingId ? 'Edit Course' : 'Add New Course'}
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={handleSubmit}
        width="80vw"
      >
        <Form layout="vertical" form={form}>
          {['image', 'bannerImg', 'authorImg'].map(field => (
            <Form.Item key={field} label={field} name={field}>
              <div>
                <Upload
                  customRequest={(options) => handleFileUpload(options, field)}
                  showUploadList={false}
                >
                  <Button icon={<UploadOutlined />}>Upload {field}</Button>
                </Upload>
                {form.getFieldValue(field) && (
                  <Image src={form.getFieldValue(field)} width={100} style={{ marginTop: 10 }} />
                )}
              </div>
            </Form.Item>
          ))}

          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="name" label="Course Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="author" label="Author" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="lesson" label="Lesson" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="duration" label="Duration" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="type" label="Type" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="language" label="Language" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item name="dis" label="Description" rules={[{ required: true }]}>
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="schedule"
            label="Schedule (comma separated)"
            rules={[{ required: true }]}
          >
            <Input
              placeholder="e.g. Monday, Wednesday, Friday"
              onChange={(e) =>
                form.setFieldValue(
                  'schedule',
                  e.target.value.split(',').map(day => day.trim())
                )
              }
            />
          </Form.Item>

          <Form.Item name="content" label="Content" rules={[{ required: true }]}>
            <Editor
              apiKey="n37usgxk136y7jbgbd22rrry2ki2agrdp3zzkfg8gc0adi22"
              onInit={(evt, editor) => (editorRef.current = editor)}
              value={editorContent}
              onEditorChange={(content) => {
                setEditorContent(content);
                form.setFieldValue('content', content);
              }}
              init={{
                height: 300,
                menubar: false,
                plugins: 'lists link image media table code help wordcount fullscreen',
                toolbar:
                  'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | image media | fullscreen | removeformat | help',
                file_picker_types: 'image',
                file_picker_callback: (callback, value, meta) => {
                  if (meta.filetype === 'image') {
                    const input = document.createElement('input');
                    input.setAttribute('type', 'file');
                    input.setAttribute('accept', 'image/*');
                    input.onchange = async function () {
                      const file = this.files[0];
                      const url = await uploadToLocalServer(file);
                      if (url) {
                        callback(url, { alt: file.name });
                      } else {
                        alert('Upload ảnh thất bại');
                      }
                    };
                    input.click();
                  }
                },
                images_upload_handler: async (blobInfo, success, failure) => {
                  const file = blobInfo.blob();
                  const url = await uploadToLocalServer(file);
                  if (url) {
                    success(url);
                  } else {
                    failure('Upload ảnh thất bại');
                  }
                },
              }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminCourse;
