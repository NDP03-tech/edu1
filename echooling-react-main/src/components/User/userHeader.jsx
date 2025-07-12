import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Typography, Button } from 'antd';
import {
  ClipboardList,
  PlayCircle,
  BarChart3,
  LogOut
} from 'lucide-react';

const { Header } = Layout;
const { Title } = Typography;

const UserHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const linkStyle = (path) => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 6,
    color: location.pathname === path ? '#fff' : '#e0e0e0',
    backgroundColor: location.pathname === path ? 'rgba(255,255,255,0.2)' : 'transparent',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.3s ease'
  });

  return (
    <Header
      style={{
        background: 'linear-gradient(to right, #4f46e5, #9333ea, #ec4899)',
        padding: '0 24px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        {/* Left: Logo & Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
        <Link to="/user" style={{ textDecoration: 'none' }}>
  <Title level={3} style={{ color: '#fff', margin: 0, cursor: 'pointer' }}>
    VestaEdu Academy
  </Title>
</Link>

          <div style={{ display: 'flex', gap: 16 }}>
            <Link to="/user/quizzes" style={linkStyle('/user/quizzes')}>
              <ClipboardList size={18} />
              Assigned Quizzes
            </Link>
            <Link to="/user/results" style={linkStyle('/user/results')}>
              <BarChart3 size={18} />
              Results & Stats
            </Link>
          </div>
        </div>

        {/* Right: Logout */}
        <Button
          type="text"
          icon={<LogOut size={18} />}
          onClick={handleLogout}
          style={{
            color: 'white',
            fontWeight: 500,
            borderRadius: 6,
            padding: '4px 12px',
            transition: 'background 0.3s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          Log Out
        </Button>
      </div>
    </Header>
  );
};

export default UserHeader;
