import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layout, Menu, Typography } from 'antd';
import {
  ClipboardList,
  PlayCircle,
  BarChart3
} from 'lucide-react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';

const { Header, Content } = Layout;
const { Title } = Typography;

const UserHeader = () => {
  const location = useLocation();
  const [heatmapData, setHeatmapData] = useState([]);

  const navItems = [
    {
      label: 'Xem các quiz được giao',
      to: '/user/quizzes',
      icon: <ClipboardList size={18} />
    },
    {
      label: 'Làm bài và lưu tiến độ',
      to: '/user/do-quiz',
      icon: <PlayCircle size={18} />
    },
    {
      label: 'Xem kết quả và thống kê',
      to: '/user/results',
      icon: <BarChart3 size={18} />
    },
  ];

  // Gọi 2 API và gộp dữ liệu
  const fetchQuizzesWithLatestAttempts = async (userId, token) => {
    const res = await fetch(`http://localhost:5000/api/${userId}/quizzes`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const quizzes = await res.json();

    const enriched = await Promise.all(
      quizzes.map(async (quiz) => {
        const attemptRes = await fetch(`http://localhost:5000/api/results/latest/${quiz._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const latestAttempt = await attemptRes.json();
        return { ...quiz, latestAttempt };
      })
    );

    return enriched;
  };

  // Chuyển dữ liệu sang dạng heatmap
  const convertToHeatmapData = (quizAttempts) => {
    const dateMap = {};

    quizAttempts.forEach(({ latestAttempt }) => {
      if (latestAttempt?.submittedAt) {
        const date = latestAttempt.submittedAt.split('T')[0]; // "YYYY-MM-DD"
        dateMap[date] = (dateMap[date] || 0) + 1;
      }
    });

    return Object.entries(dateMap).map(([date, count]) => ({ date, count }));
  };

  // Gọi dữ liệu ban đầu
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      const user = JSON.parse(userStr);
      const userId = user._id || user.id;

      const combined = await fetchQuizzesWithLatestAttempts(userId, token);
      const data = convertToHeatmapData(combined);
      setHeatmapData(data);
    };

    init();
  }, []);

  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(endDate.getMonth() - 2); // 2 tháng gần nhất

  return (
    <>
      <Header style={{
        background: 'linear-gradient(to right, #6366f1, #a855f7, #ec4899)',
        padding: '0 24px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <Title level={3} style={{ color: '#fff', margin: 0 }}>
            VestaEdu Academy
          </Title>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            style={{
              background: 'transparent',
              borderBottom: 'none',
              fontWeight: 500
            }}
          >
            {navItems.map((item) => (
              <Menu.Item key={item.to} style={{ color: 'white' }}>
                <Link to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.icon}
                  {item.label}
                </Link>
              </Menu.Item>
            ))}
          </Menu>
        </div>
      </Header>

      {/* HIỂN THỊ HEATMAP NGAY DƯỚI HEADER */}
      <Content style={{ padding: 24 }}>
  <h3>Attempts in this year</h3>
  <div style={{
    maxWidth: 600,
    overflowX: 'auto',
    transform: 'scale(0.85)',
    transformOrigin: 'top left',
  }}>
    <CalendarHeatmap
      startDate={startDate}
      endDate={endDate}
      values={heatmapData}
      classForValue={(value) => {
        if (!value) return 'color-empty';
        if (value.count >= 3) return 'color-github-4';
        if (value.count === 2) return 'color-github-3';
        if (value.count === 1) return 'color-github-2';
        return 'color-github-1';
      }}
      tooltipDataAttrs={value => ({
        'data-tip': value.date ? `${value.date}: ${value.count} lần làm bài` : ''
      })}
      showWeekdayLabels
    />
  </div>
</Content>

    </>
  );
};

export default UserHeader;
