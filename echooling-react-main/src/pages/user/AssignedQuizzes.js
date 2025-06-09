import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Table, Typography, Spin, Button, Tag, Empty } from 'antd';
import { PlayCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AssignedQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzesWithAttempts = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (!token || !userStr) return setLoading(false);

      let user;
      try {
        user = JSON.parse(userStr);
      } catch {
        return setLoading(false);
      }

      const userId = user._id || user.id;
      try {
        const res = await fetch(`http://localhost:5000/api/${userId}/quizzes`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        const quizzesWithAttempts = await Promise.all(
          data.map(async (quiz) => {
            try {
              const latestRes = await fetch(
                `http://localhost:5000/api/results/latest/${quiz._id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              );

              const latestAttempt = latestRes.ok ? await latestRes.json() : null;

              return {
                ...quiz,
                latestAttempt,
                attemptsCount: latestAttempt?.attemptNumber ?? 0,
              };
            } catch (err) {
              console.error('Error fetching quiz attempt:', err);
              return { ...quiz, latestAttempt: null, attemptsCount: 0 };
            }
          })
        );

        setQuizzes(quizzesWithAttempts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzesWithAttempts();
  }, []);

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: 'Attempts',
      dataIndex: 'attemptsCount',
      key: 'attemptsCount',
      render: (count) => count ?? 0,
    },
    {
      title: 'Best Score',
      key: 'bestScore',
      render: (_, quiz) => {
        const score = quiz.latestAttempt?.score;
        return score != null ? `${score}%` : 'N/A';
      },
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, quiz) => {
        const attempt = quiz.latestAttempt;

        if (!attempt) return <Tag color="blue">Not Started</Tag>;
        if (!attempt.submitted) return <Tag color="orange">In Progress</Tag>;
        if (attempt.score >= 90) return <Tag color="green">✅ Done</Tag>;
        return <Tag color="red">Submitted</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, quiz) => {
        const attempt = quiz.latestAttempt;
        const label = attempt && !attempt.submitted ? 'Continue' : 'Start';
        const type = attempt && !attempt.submitted ? 'default' : 'primary';

        return (
          <Link to={`/user/do-quiz/${quiz._id}`}>
            <Button icon={<PlayCircleOutlined />} type={type}>
              {label}
            </Button>
          </Link>
        );
      },
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>
        📚 Assigned Quizzes
      </Title>

      {loading ? (
        <Spin tip="Loading quizzes...">
          <div style={{ height: 200 }} />
        </Spin>
      ) : quizzes.length === 0 ? (
        <Empty description="No quizzes assigned." />
      ) : (
        <Table
          columns={columns}
          dataSource={quizzes.map((quiz) => ({ ...quiz, key: quiz._id }))}
          pagination={{ pageSize: 5 }}
          bordered
        />
      )}
    </div>
  );
};

export default AssignedQuizzes;
