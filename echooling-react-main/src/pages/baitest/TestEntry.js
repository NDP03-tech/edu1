import React, { useState, useRef } from 'react';
import UserForm from '../../components/Baitest/UserTestForm';
import TestDetail from './index.js';

const TestEntry = () => {
  const [isFormSubmitted, setIsFormSubmitted] = useState(false);
  const formRef = useRef();

  const handleFormSubmit = () => {
    formRef.current.handleSubmit(); // Gửi thông tin
    setTimeout(() => setIsFormSubmitted(true), 500); // Đợi gửi xong rồi mới hiển thị bài test
  };

  return (
    <div className="container mt-4">
      {!isFormSubmitted ? (
        <>
          <UserForm ref={formRef} />
          <button onClick={handleFormSubmit} className="btn btn-success w-100 mt-3">
            Bắt đầu bài test
          </button>
        </>
      ) : (
        <TestDetail />
      )}
    </div>
  );
};

export default TestEntry;
