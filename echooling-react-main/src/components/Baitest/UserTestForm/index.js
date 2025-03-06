import React, { useState } from 'react';
import emailjs from '@emailjs/browser';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserForm = ({ writingEssay, speakingVideoUrl, readingScore, listeningScore }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '' // Thêm trường khóa học
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submissionData = {
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      course: formData.course, // Thêm khóa học vào dữ liệu gửi
      writingEssay,
      speakingVideoUrl,
      readingScore,
      listeningScore,
    };

    // Gửi dữ liệu đến emailjs
    const serviceID = 'service_addy4sj';
    const templateID = 'template_ff0z4pb';
    const userID = 'gY_asaAKpxmYdIg29';

    emailjs.send(serviceID, templateID, submissionData, userID)
      .then(() => {
        setMessage('Gửi thành công!');
        setFormData({ name: '', email: '', phone: '', course: '' }); // Reset form
      })
      .catch((error) => {
        console.error('Lỗi gửi email:', error);
        setMessage('Gửi thất bại. Vui lòng thử lại!');
      });
  };

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h3 className="text-center">Thông tin liên hệ</h3>
        {message && <div className={`alert ${message.includes('thành công') ? 'alert-success' : 'alert-danger'}`} role="alert">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Họ và Tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              placeholder="Nhập họ và tên"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              placeholder="Nhập email"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="form-control"
              placeholder="Nhập số điện thoại"
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Khóa học muốn đăng ký</label>
            <input
              type="text"
              name="course"
              value={formData.course}
              onChange={handleChange}
              className="form-control"
              placeholder="Nhập tên khóa học"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">Gửi thông tin</button>
        </form>
      </div>
    </div>
  );
};

export default UserForm;