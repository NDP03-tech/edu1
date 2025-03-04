import React from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb/CourseBreadcrumbs';
import CourseDetailsMain from './CourseDetailsMain';
import ScrollToTop from '../../components/ScrollTop';
import courses from '../../data/Courses.json';

import Logo from '../../assets/images/logos/logo2.png';

const CourseDetails = () => {
    const location = useLocation();
    const courseURL = location.pathname.split('/'); 
    const course = courses.find((b) => b.id === Number(courseURL[2]));

    if (!course) {
        return <div>Khóa học không tồn tại.</div>;
    }

    const flatPrice = course.price.split('.');

    return (
        <div className="course-single">
            <Header
                parentMenu='course'
                menuCategoryEnable='enable'
                headerNormalLogo={Logo}
                headerStickyLogo={Logo}
            />

            <div className="react-wrapper">
                <div className="react-wrapper-inner">
                    <Breadcrumb
                        courseBannerImg={course.bannerImg}
                        courseTitle={course.title}
                        courseName={course.name}
                        courseAuthor={course.author}
                        courseAuthorImg={course.authorImg}
                        courseLesson={course.lesson}
                    />

                    <CourseDetailsMain
                        courseID={course.id}
                        courseImg={course.image}
                        courseTitle={course.title}
                        courseName={course.name}
                        courseAuthor={course.author}
                        courseAuthorImg={course.authorImg}
                        courseLesson={course.lesson}
                        courseDuration={course.duration}
                        coursePrice={course.price}
                        courseLanguage={course.language}
                        courseContent={course.content}
                        courseSchedule={course.schedule} // Thêm lịch học
                    />

                    {/* scrolltop-start */}
                    <ScrollToTop />
                    {/* scrolltop-end */}
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default CourseDetails;
