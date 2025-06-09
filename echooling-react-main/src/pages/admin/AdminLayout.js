import React from 'react';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Bản đồ ánh xạ path sang tiêu đề hiển thị trên Header
  const titleMap = {
    '/admin/dashboard': 'Dashboard',
    '/admin/adminUser': 'User Management',
    '/admin/adminBlog': 'Blog Management',
    '/admin/adminCourse': 'Course Management',
    '/admin/adminEvent': 'Event Management',
    '/admin/quiz-manage': 'Quiz Management',
    '/admin/classes': 'Class Management',
    '/admin/categories': 'Category Management',
  };

  // Lấy tiêu đề tương ứng với đường dẫn hiện tại
  const currentTitle = titleMap[location.pathname] || 'Vesta Academy';

  const handleMenuClick = ({ key }) => {
    if (key === 'logout') {
      localStorage.removeItem('token');
      navigate('/login');
    } else {
      navigate(key);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible>
        <div
          style={{
            height: 32,
            margin: 16,
            background: 'rgba(255,255,255,.3)',
            color: 'white',
            textAlign: 'center',
            lineHeight: '32px',
            fontWeight: 'bold',
          }}
        >
          Admin
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={handleMenuClick}
          items={[
            { key: '/admin/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
            { key: '/admin/adminUser', icon: <UserOutlined />, label: 'Users' },
            { key: '/admin/adminBlog', icon: <FileTextOutlined />, label: 'Blog' },
            { key: '/admin/adminCourse', icon: <BookOutlined />, label: 'Courses' },
            { key: '/admin/adminEvent', icon: <AppstoreOutlined />, label: 'Event' },
            { key: '/admin/quiz-manage', icon: <AppstoreOutlined />, label: 'Quiz Manage' },
            { key: '/admin/classes', icon: <AppstoreOutlined />, label: 'Classes' },
            { key: '/admin/categories', icon: <AppstoreOutlined />, label: 'Categories' },
            { key: 'logout', icon: <LogoutOutlined />, label: 'Logout' },
          ]}
        />
      </Sider>

      <Layout>
        <Header style={{ padding: 0, background: '#fff', textAlign: 'center' }}>
          <h3 style={{ margin: 0 }}>{currentTitle}</h3>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;
