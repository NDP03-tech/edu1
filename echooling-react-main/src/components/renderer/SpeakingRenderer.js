import React, { useState, useEffect, useRef } from 'react';
import MicRecorder from 'mic-recorder-to-mp3';
import { Button, Upload, Typography, Space, Tooltip, message } from 'antd';
import { UploadOutlined, AudioOutlined, StopOutlined, StepBackwardOutlined, StepForwardOutlined } from '@ant-design/icons';

const { Paragraph } = Typography;
const recorder = new MicRecorder({ bitRate: 128 });

const SpeakingRenderer = ({ question, initialAnswer = null, onAnswerChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(null);
  const [mediaBlob, setMediaBlob] = useState(null);
  const mediaRef = useRef(null);

  useEffect(() => {
    if (initialAnswer) {
      if (typeof initialAnswer === "string") {
        setMediaUrl(initialAnswer);
        setMediaBlob(null);
      } else if (initialAnswer instanceof File) {
        setMediaUrl(URL.createObjectURL(initialAnswer));
        setMediaBlob(initialAnswer);
      }
    }
  }, [initialAnswer]);

  const uploadMediaToServer = async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('http://localhost:5000/api/upload-media', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      return data.fileUrl;
    } catch (error) {
      message.error('Lỗi khi tải file lên máy chủ.');
      console.error(error);
      return null;
    }
  };

  const startRecording = () => {
    recorder.start()
      .then(() => {
        setIsRecording(true);
        message.success("🎤 Bắt đầu ghi âm");
      })
      .catch(console.error);
  };

  const stopRecording = () => {
    recorder.stop().getMp3()
      .then(async ([buffer, blob]) => {
        const file = new File(buffer, 'recording.mp3', {
          type: blob.type,
          lastModified: Date.now()
        });

        const uploadedUrl = await uploadMediaToServer(file);
        if (uploadedUrl) {
          setMediaUrl(uploadedUrl);
          setMediaBlob(null);
          if (onAnswerChange) {
            onAnswerChange(question._id, uploadedUrl);
          }
          message.success("✅ Ghi âm đã được tải lên thành công");
        }
        setIsRecording(false);
      })
      .catch(console.error);
  };

  const handleUpload = async (info) => {
    const file = info.file.originFileObj;
    if (!file) return;

    const uploadedUrl = await uploadMediaToServer(file);
    if (uploadedUrl) {
      setMediaUrl(uploadedUrl);
      setMediaBlob(null);
      if (onAnswerChange) {
        onAnswerChange(question._id, uploadedUrl);
      }
      message.success("📁 Tệp đã được tải lên");
    }
  };

  const seekBackward = () => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.max(0, mediaRef.current.currentTime - 10);
    }
  };

  const seekForward = () => {
    if (mediaRef.current) {
      mediaRef.current.currentTime = Math.min(mediaRef.current.duration, mediaRef.current.currentTime + 10);
    }
  };

  const isVideo = (url) => {
    const videoExtensions = ['.mp4', '.webm', '.ogg'];
    return videoExtensions.some(ext => url?.toLowerCase().endsWith(ext));
  };

  return (
    <div style={{ marginBottom: 24 }}>
      <div
        className="ant-typography"
        dangerouslySetInnerHTML={{ __html: question.question_text }}
        style={{ background: '#fafafa', padding: 16, borderRadius: 8, marginBottom: 16 }}
      />

      <Space style={{ marginBottom: 16 }} wrap>
        {!isRecording ? (
          <Button type="primary" icon={<AudioOutlined />} onClick={startRecording}>
            Ghi âm
          </Button>
        ) : (
          <Button danger icon={<StopOutlined />} onClick={stopRecording}>
            Dừng
          </Button>
        )}

        <Upload
          showUploadList={false}
          beforeUpload={() => false}
          accept="audio/*,video/*"
          customRequest={handleUpload}
        >
          <Button icon={<UploadOutlined />}>Tải lên</Button>
        </Upload>
      </Space>

      {mediaUrl && (
        <div>
          {isVideo(mediaUrl) ? (
            <video
              ref={mediaRef}
              controls
              src={mediaUrl}
              style={{ width: '100%', maxHeight: '360px' }}
            />
          ) : (
            <audio
              ref={mediaRef}
              controls
              src={mediaUrl}
              style={{ width: '100%', height: '40px' }}
            />
          )}

          <Space style={{ marginTop: 8 }}>
            <Tooltip title="Tua lùi 10 giây">
              <Button icon={<StepBackwardOutlined />} onClick={seekBackward} />
            </Tooltip>
            <Tooltip title="Tua tới 10 giây">
              <Button icon={<StepForwardOutlined />} onClick={seekForward} />
            </Tooltip>
          </Space>
        </div>
      )}
    </div>
  );
};

export default SpeakingRenderer;
