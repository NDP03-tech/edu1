import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ReactPaginate from 'react-paginate'; // Import thư viện phân trang
import SectionTitle from '../../components/SectionTitle';
import SingleCourseThreeCustom from '../../components/Course/SingleCourseThreeCustom';
import courses from '../../data/Courses.json';

const itemsPerPage = 3; // Số khóa học hiển thị trên mỗi trang

const Course = () => {
    const [currentPage, setCurrentPage] = useState(0); // State để theo dõi trang hiện tại

    // Tính toán dữ liệu hiển thị theo trang
    const offset = currentPage * itemsPerPage; // Xác định vị trí bắt đầu của trang hiện tại
    const displayedCourses = courses.slice(offset, offset + itemsPerPage); // Lấy danh sách khóa học theo trang

    // Hàm xử lý khi người dùng bấm chuyển trang
    const handlePageClick = ({ selected }) => {
        console.log("Selected page:", selected); // Kiểm tra trang được chọn
        setCurrentPage(selected);
    };

    return (
        <div className="popular__course__area pt---100 pb---100">
            <div className="container">
                <SectionTitle Title="Các khoá học" />

                <div className="row">
                    {displayedCourses.map((data, index) => (
                        <div key={index} className="col-lg-4 col-md-6 col-sm-12">
                            <SingleCourseThreeCustom
                                courseID={data.id}
                                courseImg={data.image}
                                courseTitle={data.title}
                                courseName={data.name}
                                courseLesson={data.lesson}
                                coursePrice={data.price}
                                courseDis={data.dis}
                                courseAuthor={data.author}
                                courseDuration={data.duration}
                                courseSchedule={data.schedule} // Thêm lịch học
                            />
                        </div>
                    ))}
                </div>

        
                <div className="text-center">
                    <Link to="/course" className="view-courses">
                        View All Courses <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Course;
