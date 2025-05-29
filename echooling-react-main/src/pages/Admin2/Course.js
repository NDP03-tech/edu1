import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminCourse.css';

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('token'); // Lấy token từ localStorage
        const response = await fetch('http://localhost:5000/courses', {
          headers: {
            'Authorization': `Bearer ${token}`, // Thêm token vào tiêu đề
          },
        });
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách khóa học:', error);
      }
    };
    fetchCourses();
  }, []);

  // Khởi tạo khóa học mới
  const initialCourseState = {
    id: Date.now(),
    image: '',
    bannerImg: '',
    name: '',
    author: '',
    authorImg: '',
    lesson: '',
    price: '',
    duration: '',
    type: '',
    language: '',
    content: '',
    title: '',
    dis: '',
    schedule: [],
    createdAt: new Date().toISOString(), // Sử dụng createdAt
  };

  const [course, setCourse] = useState(initialCourseState);
  const editorRef = useRef(null);

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
      console.log("Upload response:", data);
  
      if (!response.ok) {
        throw new Error(`Upload thất bại: ${data.error?.message || 'Unknown error'}`);
      }
  
      return data.secure_url; // Trả về link ảnh
    } catch (error) {
      console.error("Lỗi khi upload ảnh lên Cloudinary:", error.message);
      return null;
    }
  };
  
  // Xử lý upload ảnh
  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imageUrl = await uploadToCloudinary(file);
        setCourse((prevCourse) => ({ ...prevCourse, [field]: imageUrl }));
      } catch (error) {
        console.error("Lỗi khi upload ảnh lên Cloudinary:", error);
      }
    }
  };

  // Cập nhật nội dung TinyMCE
  const handleEditorChange = (newContent) => {
    setCourse(prevCourse => {
      if (prevCourse.content === newContent) return prevCourse; // Tránh cập nhật không cần thiết
      return { ...prevCourse, content: newContent };
    });
  };
  
  // Cập nhật input text
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCourse((prevCourse) => ({ ...prevCourse, [name]: value }));
  };

  // Thêm ngày vào lịch học
  const handleAddSchedule = () => {
    setCourse((prevCourse) => ({
      ...prevCourse,
      schedule: [...prevCourse.schedule, '']
    }));
  };

  // Xóa ngày khỏi lịch học
  const handleRemoveSchedule = (index) => {
    const updatedSchedule = course.schedule.filter((_, i) => i !== index);
    setCourse((prevCourse) => ({ ...prevCourse, schedule: updatedSchedule }));
  };

  // Chỉnh sửa khóa học
  const handleEdit = async (id) => {
    try {
      const token = localStorage.getItem('token'); // Lấy token từ localStorage
      const response = await fetch(`http://localhost:5000/courses/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm token vào tiêu đề
        },
      });
      if (!response.ok) throw new Error('Failed to fetch course');

      const courseToEdit = await response.json();
      setCourse(courseToEdit);
      setEditingIndex(id);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching course:', error);
    }
  };

  // Gửi dữ liệu (Thêm hoặc Cập nhật)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingIndex !== null ? 'PUT' : 'POST';
      const url = editingIndex !== null
        ? `http://localhost:5000/courses/${course._id}`
        : 'http://localhost:5000/courses';

      const updatedCourse = {
        ...course,
        createdAt: new Date(course.createdAt).toISOString(), // Sử dụng createdAt
      };

      const token = localStorage.getItem('token'); // Lấy token từ localStorage
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Thêm token vào tiêu đề
        },
        body: JSON.stringify(updatedCourse),
      });

      if (!response.ok) throw new Error(`Failed to ${editingIndex !== null ? 'update' : 'add'} course`);

      const updatedCourses = await fetch('http://localhost:5000/courses', {
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm token vào tiêu đề
        },
      });
      setCourses(await updatedCourses.json());

      setShowModal(false);
      setEditingIndex(null);
      setCourse(initialCourseState);
    } catch (error) {
      console.error(error);
    }
  };

  // Xóa khóa học
  const handleDelete = async (index) => {
    try {
      const courseId = courses[index]._id;
      const token = localStorage.getItem('token'); // Lấy token từ localStorage
      const response = await fetch(`http://localhost:5000/courses/${courseId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm token vào tiêu đề
        },
      });

      if (!response.ok) throw new Error('Failed to delete course');

      const updatedCourses = await fetch('http://localhost:5000/courses', {
        headers: {
          'Authorization': `Bearer ${token}`, // Thêm token vào tiêu đề
        },
      });
      setCourses(await updatedCourses.json());
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Admin Courses</h1>
      <button className="btn btn-success mb-3" onClick={() => { setCourse(initialCourseState); setShowModal(true); }}>
        Add Course
      </button>

      {/* Bảng khóa học */}
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
          {courses.map((course, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{course.name}</td>
              <td>{course.createdAt ? new Date(course.createdAt).toLocaleDateString() : ''}</td>
              <td>
                <button className="btn btn-warning me-2" onClick={() => handleEdit(course._id)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(index)}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal thêm/sửa khóa học */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1"
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }}>
          <div className="modal-dialog w-100 m-0" style={{ maxWidth: '100vw' }}>
            <div className="modal-content" style={{ width: '100%' }}>
              <div className="modal-header">
                <h5 className="modal-title">{editingIndex !== null ? 'Edit Course' : 'Add New Course'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  {[
                    { key: "name", label: "Course Name" },
                    { key: "author", label: "Author" },
                    { key: "lesson", label: "Lessons" },
                    { key: "price", label: "Price" },
                    { key: "duration", label: "Duration" },
                    { key: "type", label: "Course Type" },
                    { key: "language", label: "Language" },
                    { key: "title", label: "Title" },
                    { key: "dis", label: "Description" }
                  ].map(({ key, label }) => (
                    <div className="mb-3" key={key}>
                      <label className="form-label">{label}</label>
                      <input
                        type="text"
                        className="form-control"
                        name={key}
                        placeholder={label}
                        value={course[key]}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  ))}

                  {[
                    { key: "image", label: "Course Image" },
                    { key: "bannerImg", label: "Banner Image" },
                    { key: "authorImg", label: "Author Image" }
                  ].map(({ key, label }) => (
                    <div className="mb-3" key={key}>
                      <label className="form-label">{label}</label>
                      {course[key] && <img src={course[key]} alt={key} style={{ width: "100px" }} />}
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
                      value={course.content}
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

export default AdminCourses;