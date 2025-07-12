import React, { useEffect, useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  message
} from 'antd';
import {
  FileDoneOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const { Title } = Typography;

const ResultsStatsPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    fetch('http://localhost:5000/api/results/user/results-stats', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch stats");
        return res.json();
      })
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        message.error("Failed to load statistics.");
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !stats) {
    return <Spin style={{ marginTop: 100, display: 'block' }} size="large" />;
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Results & Statistics</Title>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Submitted"
              value={stats.totalSubmitted}
              prefix={<FileDoneOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Passed"
              value={stats.totalPassed}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Submitted Today"
              value={stats.submittedToday}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Passed Today"
              value={stats.passedToday}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Average Score Over Time">
        {stats.chartData?.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip
                formatter={(value) => [`${value}%`, 'Avg Score']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="averageScore"
                stroke="#1890ff"
                strokeWidth={2}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <Typography.Text type="secondary">No data available to display chart.</Typography.Text>
        )}
      </Card>
    </div>
  );
};

export default ResultsStatsPage;
