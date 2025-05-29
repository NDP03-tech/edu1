import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const HeaderAdmin = ({ setIsLoggedIn }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token'); // Xóa token
        setIsLoggedIn(false); // Cập nhật trạng thái người dùng
        console.log('User logged out: true'); // Log trạng thái đăng xuất
        navigate('/login'); // Chuyển hướng đến trang đăng nhập
    };

    return (
        <header className="bg-dark text-white p-3">
            <nav className="container">
                <ul className="nav justify-content-between">
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/admin/dashboard">Dashboard</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/admin/adminUser">Users</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/admin/adminBlog">Blog</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/admin/adminCourse">Courses</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/admin/adminEvent">Event</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/admin/quiz-manage">Quiz Manage</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/admin/classes">Classes</Link>
                    </li>
                    <li className="nav-item">
                        <Link className="nav-link text-white" to="/admin/categories">Categories</Link>
                    </li>
                   
                    <li className="nav-item ms-auto">
                        <button className="btn btn-outline-light" onClick={handleLogout}>Logout</button>
                    </li>
                </ul>
            </nav>
        </header>
    );
};

export default HeaderAdmin;