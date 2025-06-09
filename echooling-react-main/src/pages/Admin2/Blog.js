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
import './AdminBlog.css';

const AdminBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');
  const editorRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editorContent, setEditorContent] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/blog', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        setBlogs(data);
        setFilteredBlogs(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách blog:', error);
      }
    };
    fetchBlogs();
  }, []);

  useEffect(() => {
    const filtered = blogs.filter(blog =>
      blog.title?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredBlogs(filtered);
  }, [searchText, blogs]);

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
      const response = await fetch(`http://localhost:5000/api/blog/${id}`);
      const blogToEdit = await response.json();
      setShowModal(true);
      setEditingId(id);
      setEditorContent(blogToEdit.content || '');
      setTimeout(() => {
        form.setFieldsValue(blogToEdit);
      }, 0);
    } catch (error) {
      message.error('Không thể lấy dữ liệu blog');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/blog/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Xóa thất bại');

      setBlogs(prev => prev.filter(blog => blog._id !== id));
      message.success('Đã xóa blog');
    } catch (err) {
      message.error('Lỗi khi xóa blog');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      const isEdit = !!editingId;
      const updatedBlog = {
        ...values,
        content: editorContent,
        createdAt: new Date().toISOString(),
      };

      const url = isEdit
        ? `http://localhost:5000/api/blog/${editingId}`
        : 'http://localhost:5000/api/blog/create';

      const method = isEdit ? 'PUT' : 'POST';
      const token = localStorage.getItem('token');

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedBlog),
      });

      if (!response.ok) throw new Error('Lỗi khi lưu blog');

      const refreshed = await fetch('http://localhost:5000/api/blog', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const updatedBlogs = await refreshed.json();
      setBlogs(updatedBlogs);
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
          Add Blog
        </Button>
        <Input.Search
          placeholder="Search by title"
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
        />
      </Space>

      <Table columns={columns} dataSource={filteredBlogs} rowKey="_id" />

      <Modal
        title={editingId ? 'Edit Blog' : 'Add New Blog'}
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={handleSubmit}
        width="80vw"
      >
        <Form layout="vertical" form={form}>
          <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input placeholder="Nhập tiêu đề blog" />
          </Form.Item>

          <Form.Item name="author" label="Author" rules={[{ required: true, message: 'Vui lòng nhập tác giả' }]}>
            <Input />
          </Form.Item>

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

          <Form.Item
            label="Content"
            name="content"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
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
                  'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist | image media | fullscreen |  removeformat | help',
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

export default AdminBlog;
