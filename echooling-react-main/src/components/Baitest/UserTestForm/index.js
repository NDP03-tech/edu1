import React, { useState, forwardRef, useImperativeHandle } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

const UserForm = forwardRef(({ onFormComplete }, ref) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    course: '',
  });
  const [message, setMessage] = useState('');
  const isFormValid = Object.values(formData).every((value) => value.trim() !== '');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    if (!isFormValid) {
      setMessage('❌ Vui lòng nhập đầy đủ thông tin trước khi tiếp tục!');
      return;
    }
    onFormComplete(formData);
  };

  useImperativeHandle(ref, () => ({
    handleSubmit: (data) => {
      console.log('Submitting data:', data);
      setMessage('✅ Bài thi đã được nộp!');
    },
  }));

  return (
    <div className="container mt-4">
      <div className="card shadow p-4">
        <h3 className="text-center">Thông tin liên hệ</h3>
        {message && <div className={`alert ${message.includes('✅') ? 'alert-success' : 'alert-danger'}`} role="alert">{message}</div>}
        <form onSubmit={handleConfirm}>
          <div className="mb-3">
            <label className="form-label">Họ và Tên</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Số điện thoại</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-control" required />
          </div>
          <div className="mb-3">
            <label className="form-label">Khóa học muốn đăng ký</label>
            <input type="text" name="course" value={formData.course} onChange={handleChange} className="form-control" required />
          </div>
          <button type="submit" className="btn btn-primary w-100">Xác nhận thông tin</button>
        </form>
      </div>
    </div>
  );
});

export default UserForm;
