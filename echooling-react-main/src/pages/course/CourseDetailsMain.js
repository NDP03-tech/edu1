import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import RegisterForm from '../../components/PopupFormDangKi';

const CourseDetailsMain = () => {
    const { id } = useParams(); // ✅ Lấy ID khóa học từ URL
    const courseId = id ? id.trim() : ''; // ✅ Xử lý khoảng trắng

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showForm, setShowForm] = useState(false);

    // Gọi API để lấy dữ liệu khóa học
    useEffect(() => {
        if (!courseId || courseId.length !== 24) { // ✅ Kiểm tra ObjectId hợp lệ
            setError("ID khóa học không hợp lệ");
            setLoading(false);
            return;
        }

        const fetchCourse = async () => {
            try {
                const response = await fetch(`http://localhost:5000/courses/${courseId}`);
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Không thể tải dữ liệu khóa học");
                }
                const data = await response.json();
                setCourse(data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu khóa học:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchCourse();
    }, [courseId]);

    const handleOpenForm = () => {
        window.open('https://docs.google.com/forms/d/e/1FAIpQLScBHU9X8svl0J-7uRcjiQMkbPhL6jcg-MFU-CftchmippzenA/viewform', '_blank');
    };

    if (loading) return <p className="text-center mt-4">⏳ Đang tải dữ liệu...</p>;
    if (error) return <p className="text-center mt-4 text-danger">❌ {error}</p>;
    if (!course) return <p className="text-center mt-4 text-warning">⚠️ Không tìm thấy khóa học.</p>;

    // Xử lý lịch học
    const formattedEvents = course?.schedule?.map(date => ({
        title: "Scheduled Class",
        start: `${date}T00:00:00`,
        backgroundColor: "#ff5733",
        borderColor: "#ff5733",
        color: "#ff5733"
    })) || [];

    return (
        <div className="container py-5">
            <div className="row">
                {/* Nội dung chính của khóa học */}
                <div className="col-lg-8">
                    <Tabs>
                        <div className="course-single-tab">
                            <TabList className="nav nav-tabs">
                                <Tab><button className="nav-link active">Mô tả</button></Tab>
                                <Tab><button className="nav-link">Lịch học</button></Tab>
                            </TabList>

                            <div className="tab-content mt-3">
                                <TabPanel>
                                    <div className="tab-pane fade show active">
                                        <h3 className="text-center">Giới thiệu khóa học</h3>
                                        <p className="mt-3" dangerouslySetInnerHTML={{ __html: course?.content ?? "" }} />

                                        <div className="text-center mt-4">
                                            <img 
                                                src={course.image} 
                                                alt="Course" 
                                                className="img-fluid rounded shadow" 
                                                style={{ maxHeight: '400px', objectFit: 'cover' }} 
                                            />
                                        </div>
                                    </div>
                                </TabPanel>
                                <TabPanel>
                                    <div className="tab-pane">
                                        <h3 className="text-center">Lịch học</h3>
                                        <FullCalendar
                                            plugins={[dayGridPlugin, listPlugin]}
                                            initialView="dayGridMonth"
                                            events={formattedEvents}
                                            className="mt-4"
                                        />
                                    </div>
                                </TabPanel>
                            </div>
                        </div>
                    </Tabs>
                </div>

                {/* Sidebar - Thông tin khóa học */}
                <div className="col-lg-4">
                    <div className="card p-4 shadow-sm">
                        <h4 className="text-center">Thông tin khóa học</h4>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item"><b>Giảng viên:</b> {course.author}</li>
                            <li className="list-group-item"><b>Môn học:</b> {course.name}</li>
                            <li className="list-group-item"><b>Thời lượng:</b> {course.duration}</li>
                            <li className="list-group-item"><b>Bài giảng:</b> {course.lesson} bài</li>
                            <li className="list-group-item"><b>Ngôn ngữ:</b> {course.language}</li>
                            <li className="list-group-item"><b>Học phí:</b> <span className="text-danger">{course.price ? `${course.price} VND` : "Miễn phí"}</span></li>
                        </ul>
                        <button className="btn btn-primary mt-3 w-100" onClick={handleOpenForm}>Đăng ký ngay</button>
                    </div>
                </div>
            </div>

            {/* Form đăng ký */}
            {showForm && <RegisterForm courseTitle={course.name} onClose={() => setShowForm(false)} />}
        </div>
    );
}

export default CourseDetailsMain;
