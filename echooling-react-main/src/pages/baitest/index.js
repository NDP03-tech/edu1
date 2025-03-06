import React, { useState } from 'react';
import ReadingSection from '../../components/Baitest/ReadingSection';
import WritingTask from '../../components/Baitest/Writing';
import SpeakingComponent from '../../components/Baitest/Speaking';
import UserForm from '../../components/Baitest/UserTestForm';
import Listening from '../../components/Baitest/Listening';

const TestDetail = () => {
    const [writingEssay, setWritingEssay] = useState('');
    const [speakingVideoUrl, setSpeakingVideoUrl] = useState('');
    const [readingScore, setReadingScore] = useState(0);
    const [listeningScore, setListeningScore] = useState(0);
  
    return (
      <div> 
        <h2 className="text-center">
          THÍ SINH ĐƯỢC LÀM BÀI CHỈ 1 LẦN, LIỀN TRONG 130 PHÚT (60 PHÚT ĐỌC, 20 PHÚT NGHE, 40 PHÚT VIẾT, 10 PHÚT NÓI)
        </h2>
        <Listening setBandScore={setListeningScore} /> {/* Thay đổi từ setScore thành setBandScore */}
        <ReadingSection setBandScore={setReadingScore} /> {/* Thay đổi từ setScore thành setBandScore */}
        
        <WritingTask setEssayState={setWritingEssay} />
        <SpeakingComponent setVideoUrl={setSpeakingVideoUrl} />
  
        <UserForm
          writingEssay={writingEssay}
          speakingVideoUrl={speakingVideoUrl}
          readingScore={readingScore}
          listeningScore={listeningScore}
        />
      </div>
    );
}

export default TestDetail;