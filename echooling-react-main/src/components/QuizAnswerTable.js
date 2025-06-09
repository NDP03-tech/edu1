import React, { useEffect, useState } from 'react';
import { Table, Tag, Spin, Typography } from 'antd';
import moment from 'moment';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const { Title } = Typography;

const QuizResultTable = () => {
  const { quizId } = useParams();
  const [data, setData] = useState([]);
  const [answerColumns, setAnswerColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/results/best-attempts/${quizId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const attempts = res.data.results || [];
      const correctAnswers = res.data.correctAnswers || [];

      setData(attempts);

      const columns = correctAnswers.map((ca, idx) => {
        const key = `q${ca.questionIndex}-a${ca.partIndex}`;
        return {
          title: (
            <div>
              <strong>Q{ca.questionIndex + 1}-A{ca.partIndex + 1}</strong>
              <div style={{ fontSize: 12, color: '#888' }}>{formatAnswerText(ca.answerText)}</div>
            </div>
          ),
          key,
          align: 'center',
          render: (record) => {
            const question = record.answers?.[ca.questionIndex];
            const userAnswer = getAnswerByIndex(question?.answer, ca.partIndex);
            const correct = question?.comparisonResult?.[ca.partIndex];

            return (
              <Tag color={correct ? 'green' : 'red'}>
                {userAnswer !== undefined && userAnswer !== null && userAnswer !== ''
                  ? String(userAnswer)
                  : '—'}
              </Tag>
            );
          },
        };
      });

      setAnswerColumns(columns);
    } catch (err) {
      console.error('❌ Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) fetchResults();
  }, [quizId]);

  const baseColumns = [
    {
      title: 'User',
      dataIndex: ['user', 'email'],
      key: 'user',
    },
    {
      title: 'Class',
      dataIndex: ['class', 'name'],
      key: 'class',
      render: (name) => name || <em>None</em>,
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      align: 'center',
    },
    {
      title: 'Attempt',
      dataIndex: 'attemptNumber',
      key: 'attempt',
      align: 'center',
    },
    {
      title: 'Duration',
      key: 'duration',
      align: 'center',
      render: (_, record) => {
        const seconds = record.durationSeconds || 0;
        return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
      },
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'date',
      align: 'center',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>📋 Best Attempts for Quiz</Title>
      <Spin spinning={loading}>
        <Table
          columns={[...baseColumns, ...answerColumns]}
          dataSource={data}
          rowKey={(record) => `${record.user._id}-${record.attemptNumber}`}
          pagination={false}
          bordered
          scroll={{ x: 'max-content' }}
        />
      </Spin>
    </div>
  );
};

// Format correct answer preview text
const formatAnswerText = (answer) => {
  if (typeof answer === 'string' || typeof answer === 'number') return String(answer);
  if (Array.isArray(answer)) return answer.join(', ');
  if (typeof answer === 'object' && answer !== null) {
    return Object.values(answer).join(', ');
  }
  return '-';
};

// Get answer from array or object based on index
const getAnswerByIndex = (answer, index) => {
  if (Array.isArray(answer)) return answer[index];
  if (typeof answer === 'object' && answer !== null) {
    const values = Object.values(answer);
    return values[index];
  }
  return null;
};

export default QuizResultTable;
