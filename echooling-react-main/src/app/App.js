import React, { useState, useEffect } from "react";
import { Route, Routes } from 'react-router-dom';
import Preloader from "../components/Preloader";
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute";
import AdminLayout from "../pages/admin/AdminLayout";

// Custom Components
import HomeMain from '/Users/nguyendacphuc/Downloads/edu/edu1/echooling-react-main/src/pages/home/HomeMain.js';
import About from '../pages/about';
import AssignedQuizzes from "../pages/user/AssignedQuizzes";
import Course from '../pages/course';
import Dashbroad from "../pages/admin"; // Đảm bảo rằng Dashbroad được định nghĩa đúng
import CourseDetails from '../pages/course/course-details';
import Instructor from '../pages/instructor';
import InstructorDetails from '../pages/instructor/instructor-details';
import Event from '../pages/event';
import EventSidebar from '../pages/event/event-sidebar';
import EventDetails from '../pages/event/event-details';
import Blog from '../pages/blog';
import BlogDetails from '../pages/blog/blog-details';
import Login from '../pages/authentication/login';
import UserManagement from "../pages/admin/userManagement";
import Contact from '../pages/contact';
import Error from '../pages/404';
import UserDashboard from "../pages/user/UserDashbroad";
import LoadTop from '../components/ScrollTop/LoadTop';
import AdminCourses from "../pages/Admin2/Course";
import UserTestComponent from '../pages/baitest/UserTestComponent';
import AdminBlog from "../pages/Admin2/Blog";
import AdminEvent from "../pages/Admin2/Event";
import QuizManage from "../pages/QuizManage";
import Classes from "/Users/nguyendacphuc/Downloads/edu/edu1/echooling-react-main/src/pages/Classes.js"
import QuizPreview from "/Users/nguyendacphuc/Downloads/edu/edu1/echooling-react-main/src/components/QuizPreview.js";
import EditQuiz from "../pages/EditQuiz";
import QuizBuilder from "/Users/nguyendacphuc/Downloads/edu/edu1/echooling-react-main/src/components/QuizBuilder.jsx";
import CategoryPage from "../pages/CategoryPage";
import ClassDetail from "../pages/ClassDetails";
import AdminRoute from '../components/ProtectedRoute/AdminRoute';
import UserRoute from '../components/ProtectedRoute/UserRoute';

import  QuizPreviewWrapper from "/Users/nguyendacphuc/Downloads/edu/edu1/echooling-react-main/src/pages/QuizPreviewWrapper.js";
const App = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token')); // Kiểm tra token trong localStorage

    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
    }, []);

    const handleLogin = () => {
        setIsLoggedIn(true); // Cập nhật trạng thái khi đăng nhập
        console.log('User logged in:', true); // Log trạng thái đăng nhập
    };

    const handleLogout = () => {
        setIsLoggedIn(false); // Cập nhật trạng thái khi đăng xuất
        localStorage.removeItem('token'); // Xóa token khỏi localStorage
        localStorage.removeItem('role'); // Xóa vai trò khỏi localStorage
        console.log('User logged out:', false); // Log trạng thái đăng xuất
    };

    return (
        <div className='App'>
            {isLoading ? <Preloader /> : ''}
            <>
                <LoadTop />
                <Routes>
                    <Route path="/" exact element={<HomeMain />} />
                    <Route path="/login" element={<Login onLogin={handleLogin} setIsLoggedIn={setIsLoggedIn} />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/course" element={<Course />} />
                    <Route path="/test" element={<UserTestComponent />} />
                    <Route path="/course/:id" element={<CourseDetails />} />
                    <Route path="/event" element={<Event />} />
                    <Route path="/event/:id" element={<EventDetails />} />
                    <Route path="/event-sidebar" element={<EventSidebar />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogDetails />} />
                    <Route path="/instructor" element={<Instructor />} />
                    <Route path="/instructor/:id" element={<InstructorDetails />} />
                    <Route path="/contact" element={<Contact />} />

                    {/* Protected Routes with AdminLayout */}
                    <Route element={<AdminRoute isLoggedIn={isLoggedIn} />}>
  <Route path="/admin" element={<AdminLayout onLogout={handleLogout} setIsLoggedIn={setIsLoggedIn} />}>
                            <Route index element={<Dashbroad />} /> {/* Quan trọng */}
                            <Route path="dashboard" element={<Dashbroad />} />
                            <Route path="adminUser" element={<UserManagement />} />
                            <Route path="adminEvent" element={<AdminEvent />} />
                            <Route path="adminBlog" element={<AdminBlog />} />
                            <Route path="adminCourse" element={<AdminCourses />} />

                            


                            <Route path="quiz-manage" element={<QuizManage />} />
                            <Route path="quiz-preview/:id" element={<QuizPreview />} />
                            <Route path="preview/:quizId" element={<QuizPreviewWrapper />} />
                            <Route path="quizzes/:id/edit" element={<EditQuiz />} />
                            <Route path="quiz-builder/:quizId" element={<QuizBuilder />} />
                            <Route path="categories" element={<CategoryPage />} />
                            <Route path="classes" element={<Classes />} />
                            <Route path="class/:id" element={<ClassDetail />} />
                        </Route>
                    </Route>

                    <Route path='*' element={<Error />} />
                    <Route element={<UserRoute isLoggedIn={isLoggedIn} />}>
  <Route path="/user" element={<UserDashboard />} />
  <Route path="/user/do-quiz/:quizId" element={<QuizPreviewWrapper />} /> 
  <Route path="/user/quizzes" element={<AssignedQuizzes />} />
</Route>

                </Routes>
            </>
        </div>
    );
}

export default App;