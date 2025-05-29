import React, { useEffect, useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminBlog.css';

const AdminBlog = () => {
  const [blogs, setBlogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  
  const initialBlogState = {
    id: '',
    image: '',
    bannerImg: '',
    title: '',
    author: '',
    authorImg: '',
    content: '',
    createdAt: new Date().toISOString(),
  };

  const [blog, setBlog] = useState(initialBlogState);
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/blog', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setBlogs(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách blog:', error);
      }
    };
    fetchBlogs();
  }, []);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "vestaedu");
    formData.append("cloud_name", "dubzoozqi");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dubzoozqi/image/upload", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Upload thất bại: ${data.error?.message || 'Unknown error'}`);
      }

      return data.secure_url;
    } catch (error) {
      console.error("Lỗi khi upload ảnh lên Cloudinary:", error.message);
      return null;
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl) {
          setBlog((prevBlog) => ({
            ...prevBlog,
            [field]: imageUrl,
            image: field === 'bannerImg' || field === 'authorImg' ? imageUrl : prevBlog.image,
          }));
          console.log(`${field} uploaded successfully:`, imageUrl);
        } else {
          console.error(`Upload ${field} không thành công.`);
        }
      } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
      }
    }
  };

  const handleEditorChange = (newContent) => {
    setBlog(prevBlog => ({ ...prevBlog, content: newContent }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog((prevBlog) => ({ ...prevBlog, [name]: value }));
  };

  const handleEdit = async (id) => {
    console.log('Fetching blog with ID:', id); // Log ID để kiểm tra
    try {
        const response = await fetch(`http://localhost:5000/api/blog/${id}`);
        if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);

        const blogToEdit = await response.json();
        setBlog(blogToEdit);
        setEditingIndex(blogToEdit._id); // Sử dụng _id
        setShowModal(true); // Mở modal
    } catch (error) {
        console.error('Error fetching blog:', error.message);
    }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  const requiredFields = ['title', 'content', 'author', 'authorImg', 'image', 'bannerImg'];

  for (const field of requiredFields) {
      if (!blog[field]) {
          alert(`Vui lòng điền trường ${field}`);
          return;
      }
  }

  try {
      const method = editingIndex !== null ? 'PUT' : 'POST';
      const url = editingIndex !== null
          ? `http://localhost:5000/api/blog/${blog._id}` // Sử dụng _id để cập nhật
          : 'http://localhost:5000/api/blog/create'; // Sử dụng cho việc tạo mới

      const updatedBlog = {
          ...blog,
          createdAt: new Date().toISOString(),
      };

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
          method,
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(updatedBlog),
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to ${editingIndex !== null ? 'update' : 'add'} blog: ${errorData.message || 'Unknown error'}`);
      }

      const updatedBlogs = await fetch('http://localhost:5000/api/blog', {
          headers: {
              'Authorization': `Bearer ${token}`,
          },
      });
      setBlogs(await updatedBlogs.json());

      setShowModal(false);
      setEditingIndex(null);
      setBlog(initialBlogState);
  } catch (error) {
      console.error("Error during submit:", error.message);
  }
};
  const handleDelete = async (id) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Bạn cần đăng nhập để xóa bài viết');
        }

        const response = await fetch(`http://localhost:5000/api/blog/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete blog');
        }

        console.log('Blog deleted successfully');
        setBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== id)); // Cập nhật danh sách blog
    } catch (error) {
        console.error("Error deleting blog:", error.message);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Admin Blog</h1>
      <button className="btn btn-success mb-3" onClick={() => { setBlog(initialBlogState); setEditingIndex(null); setShowModal(true); }}>
        Add Blog
      </button>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>No.</th>
            <th>Title</th>
            <th>Created On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {blogs.map((blog, index) => (
    <tr key={blog._id}>
      <td>{index + 1}</td>
      <td>{blog.title}</td>
      <td>{new Date(blog.createdAt).toLocaleString()}</td>
      <td>
        <button className="btn btn-warning me-2" onClick={() => handleEdit(blog._id)}>Edit</button>
        <button className="btn btn-danger" onClick={() => handleDelete(blog._id)}>X</button>
      </td>
    </tr>
  ))}
</tbody>
      </table>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1"
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }}>
          <div className="modal-dialog w-100 m-0" style={{ maxWidth: '100vw' }}>
            <div className="modal-content" style={{ width: '100%' }}>
              <div className="modal-header">
                <h5 className="modal-title">{editingIndex !== null ? 'Edit Blog' : 'Add New Blog'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      placeholder="Blog Title"
                      value={blog.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Author</label>
                    <input
                      type="text"
                      className="form-control"
                      name="author"
                      placeholder="Author Name"
                      value={blog.author}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {[
                    { key: "image", label: "Blog Image" },
                    { key: "bannerImg", label: "Banner Image" },
                    { key: "authorImg", label: "Author Image" }
                  ].map(({ key, label }) => (
                    <div className="mb-3" key={key}>
                      <label className="form-label">{label}</label>
                      {blog[key] && <img src={blog[key]} alt={key} style={{ width: "100px" }} />}
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => handleFileUpload(e, key)}
                      />
                    </div>
                  ))}
                  <div className="mb-3">
                    <label className="form-label">Content</label>
                    <Editor
                      apiKey="n37usgxk136y7jbgbd22rrry2ki2agrdp3zzkfg8gc0adi22"
                      onInit={(evt, editor) => (editorRef.current = editor)}
                      value={blog.content}
                      onEditorChange={handleEditorChange}
                      init={{
                        height: 300,
                        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                      }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    {editingIndex !== null ? "Update" : "Save"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;