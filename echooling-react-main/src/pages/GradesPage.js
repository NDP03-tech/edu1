import { Table, Spin, Card, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const { Title } = Typography;

const GradesPage = () => {
  const { userId } = useParams(); // Get userId from URL
  const navigate = useNavigate(); // 👈 for navigation
  const [quizSummaries, setQuizSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`http://localhost:5000/api/results/user-summary/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data.map(item => ({
          key: item.quizId, // required by Table
          quizId: item.quizId, // 👈 store quizId separately
          quizTitle: item.quizTitle,
          bestScore: item.bestScore,
          attempts: item.attempts,
          duration: item.avgDuration ? `${item.avgDuration}s` : 'N/A',
          lastAttempt: item.lastAttempt ? new Date(item.lastAttempt).toLocaleString() : 'N/A',
          status: item.bestScore >= 80 ? 'passed' : 'failed',
        }));

        setQuizSummaries(data);
      } catch (err) {
        console.error('❌ Error fetching quiz summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [userId]);

  const columns = [
    {
      title: 'Quiz Title',
      dataIndex: 'quizTitle',
      key: 'quizTitle',
      render: (_, record) => (
        <a
          onClick={() => navigate(`/answer/${record.quizId}`)}
          style={{ color: '#1677ff', cursor: 'pointer' }}
        >
          {record.quizTitle}
        </a>
      ),
    },
    {
      title: 'Best Score',
      dataIndex: 'bestScore',
      key: 'bestScore',
      render: score => (
        <Tag color={score >= 80 ? 'green' : score >= 50 ? 'orange' : 'red'}>
          {score}%
        </Tag>
      ),
      align: 'center',
    },
    {
      title: 'Attempts',
      dataIndex: 'attempts',
      key: 'attempts',
      align: 'center',
    },
    {
      title: 'Average Duration',
      dataIndex: 'duration',
      key: 'duration',
      align: 'center',
    },
    {
      title: 'Last Attempt',
      dataIndex: 'lastAttempt',
      key: 'lastAttempt',
      align: 'center',
    },
  ];

  return (
    <div style={{ padding: 24, backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <Card bordered={false} style={{ maxWidth: 1000, margin: '0 auto' }}>
        <Title level={3} style={{ marginBottom: 20 }}>
          📊 Quiz Results Summary
        </Title>
        <Spin spinning={loading} tip="Loading data...">
          <Table
            columns={columns}
            dataSource={quizSummaries}
            pagination={false}
            bordered
            rowClassName={(record) =>
              record.status === 'passed' ? 'row-passed' : 'row-failed'
            }
          />
        </Spin>
      </Card>
    </div>
  );
};

export default GradesPage;
