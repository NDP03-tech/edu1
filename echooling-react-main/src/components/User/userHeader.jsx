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
  items={navItems.map((item) => ({
    key: item.to,
    label: (
      <Link to={item.to} style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'white' }}>
        {item.icon}
        {item.label}
      </Link>
    )
  }))}
/>

        </div>
      </Header>

      {/* HIỂN THỊ HEATMAP NGAY DƯỚI HEADER */}
    

    </>
  );
};

export default UserHeader;
