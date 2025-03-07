import React, { useState, useRef, useEffect } from 'react';
import ReadingSection from '../../components/Baitest/ReadingSection';
import WritingTask from '../../components/Baitest/Writing';
import SpeakingComponent from '../../components/Baitest/Speaking';
import UserForm from '../../components/Baitest/UserTestForm';
import Listening from '../../components/Baitest/Listening';
import './TestDetail.css';

const TestDetail = () => {
  const [formData, setFormData] = useState(null); // Lưu thông tin cá nhân
  const [writingEssay, setWritingEssay] = useState('');
  const [speakingVideoUrl, setSpeakingVideoUrl] = useState('');
  const [readingScore, setReadingScore] = useState(0);
  const [listeningScore, setListeningScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(130 * 60); // 130 phút (giây)
  const [isTestStarted, setIsTestStarted] = useState(false); // Kiểm soát trạng thái bài test
  
  const formRef = useRef(null);

  // 🔥 Fix lỗi: Thời gian không chạy
  useEffect(() => {
    if (!isTestStarted) return; // Chỉ chạy khi bài test bắt đầu

    const timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          alert('⏳ Hết thời gian làm bài!');
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer); // Cleanup khi unmount
  }, [isTestStarted]);

  const handleSubmit = () => {
    if (formRef.current) {
      formRef.current.handleSubmit({
        ...formData,
        writingEssay,
        speakingVideoUrl,
        readingScore,
        listeningScore,
        overall: ((listeningScore + readingScore) / 2).toFixed(1),
      });
    }
  };

  return (
    <div>
      <h2 className="text-center">THÍ SINH ĐƯỢC LÀM BÀI CHỈ 1 LẦN</h2>

      {/* Chỉ hiển thị đồng hồ khi bài test bắt đầu */}
      {isTestStarted && (
        <h3 className="fixed-timer">
          ⏳ Thời gian còn lại: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </h3>
      )}

      {/* Bước 1: Nếu chưa nhập thông tin, hiển thị form */}
      {!formData ? (
        <UserForm
          ref={formRef}
          onFormComplete={(data) => {
            setFormData(data);
            setIsTestStarted(true); // 🔥 Bắt đầu bài test khi nhập thông tin xong
          }}
        />
      ) : (
        <>
          {/* Bước 2: Hiển thị bài test sau khi nhập thông tin */}
          <Listening setBandScore={setListeningScore} />
          <ReadingSection setBandScore={setReadingScore} />
          <WritingTask setEssayState={setWritingEssay} />
          <SpeakingComponent setVideoUrl={setSpeakingVideoUrl} />

          {/* Bước 3: Khi nộp bài, gửi toàn bộ dữ liệu */}
          <button onClick={handleSubmit} className="btn btn-danger w-100 mt-3">
            Nộp bài ngay
          </button>
        </>
      )}
    </div>
  );
};

export default TestDetail;
