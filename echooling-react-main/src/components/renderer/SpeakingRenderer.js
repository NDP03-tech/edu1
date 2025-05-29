import React, { useState, useEffect, useRef } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';

const recorder = new MicRecorder({ bitRate: 128 });

const SpeakingRenderer = ({ question, initialAnswer = null, onAnswerChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaBlob, setMediaBlob] = useState(null);
  const mediaRef = useRef(null); // Tham chiếu đến audio hoặc video

  useEffect(() => {
    if (initialAnswer) {
      if (typeof initialAnswer === "string") {
        console.log('Load initialAnswer as URL:', initialAnswer);
        setMediaUrl(initialAnswer);
        setMediaBlob(null);
      } else if (initialAnswer instanceof File) {
        console.log('Load initialAnswer as File:', initialAnswer);
        setMediaUrl(URL.createObjectURL(initialAnswer));
        setMediaBlob(initialAnswer);
      }
    }
  }, [initialAnswer]);

  // Upload file lên server
  const uploadMediaToServer = async (file) => {
    try {
      console.log('Uploading file to server...', file);
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:5000/api/upload-media', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        console.error('Upload failed with status:', res.status);
        throw new Error('Upload failed');
      }

      const data = await res.json();
      console.log('Upload success, server returned:', data);

      return data.fileUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const startRecording = () => {
    recorder.start()
      .then(() => {
        setIsRecording(true);
        console.log('Recording started');
      })
      .catch(console.error);
  };

  const stopRecording = () => {
    recorder.stop()
      .getMp3()
      .then(async ([buffer, blob]) => {
        const file = new File(buffer, 'recording.mp3', {
          type: blob.type,
          lastModified: Date.now()
        });

        const uploadedUrl = await uploadMediaToServer(file);
        if (uploadedUrl) {
          setMediaUrl(uploadedUrl);
          setMediaBlob(null);
          console.log('Audio uploaded successfully:', uploadedUrl);
          if (onAnswerChange) {
            onAnswerChange(question._id, uploadedUrl);
          }
        } else {
          console.log('Upload failed or no URL returned');
        }

        setIsRecording(false);
      }).catch(console.error);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadedUrl = await uploadMediaToServer(file);
    if (uploadedUrl) {
      setMediaUrl(uploadedUrl);
      setMediaBlob(null);
      console.log('File uploaded by user successfully:', uploadedUrl);
      if (onAnswerChange) {
        onAnswerChange(question._id, uploadedUrl);
      }
    } else {
      console.log('Upload failed or no URL returned');
    }
  };

  // Hàm tua lùi 10 giây
  const seekBackward = () => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.max(0, mediaRef.current.currentTime - 10);
    }
  };

  // Hàm tua tới 10 giây
  const seekForward = () => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.min(mediaRef.current.duration, mediaRef.current.currentTime + 10);
    }
  };

  // Hàm kiểm tra kiểu media (audio/video) dựa trên đuôi file
  const isVideo = (url) => {
    if (!url) return false;
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some(ext => url.toLowerCase().endsWith(ext));
  };

  console.log('Render mediaUrl:', mediaUrl);

  return (
    <div>
      <div
        className="border rounded p-3 mb-3"
        dangerouslySetInnerHTML={{ __html: question.question_text }}
      />

      <div className="mb-3">
        {!isRecording ? (
          <button className="btn btn-success me-2" onClick={startRecording}>🎤 Ghi âm</button>
        ) : (
          <button className="btn btn-danger me-2" onClick={stopRecording}>⏹️ Dừng</button>
        )}

        <label className="btn btn-outline-secondary">
          📁 Tải lên
          <input type="file" accept="audio/*,video/*" onChange={handleUpload} hidden />
        </label>
      </div>

      {mediaUrl && (
        <>
          {isVideo(mediaUrl) ? (
            <video
              ref={mediaRef}
              controls
              src={mediaUrl}
              style={{ width: '100%', maxHeight: '360px' }}
              preload="metadata"
            />
          ) : (
            <audio
              ref={mediaRef}
              controls
              src={mediaUrl}
              style={{ width: '100%', height: '40px' }}
              preload="metadata"
            />
          )}

          <div style={{ marginTop: 8 }}>
            <button className="btn btn-secondary me-2" onClick={seekBackward}>« Tua lùi 10s</button>
            <button className="btn btn-secondary" onClick={seekForward}>Tua tới 10s »</button>
          </div>
        </>
      )}
    </div>
  );
};

export default SpeakingRenderer;
