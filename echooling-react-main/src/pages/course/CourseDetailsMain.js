import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Faq from '../../components/Faq';
import courses from '../../data/Courses.json';
import { useParams } from "react-router-dom";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';
import RegisterForm from '../../components/PopupFormDangKi';

import authorImg1 from '../../assets/images/course-single/user4.jpg';
import authorImg2 from '../../assets/images/course-single/user5.jpg';

const CourseDetailsMain = (props) => {
    const [showForm, setShowForm] = useState(false);

    const handleOpenForm = () => {
        window.open('https://docs.google.com/forms/d/e/1FAIpQLScBHU9X8svl0J-7uRcjiQMkbPhL6jcg-MFU-CftchmippzenA/viewform', '_blank'); // Thay 'https://your-link.com' bằng link bạn muốn mở
    };
    const handleCloseForm = () => setShowForm(false);

    let tab1 = "Description",
        tab2 = "Schedule";
    const tabStyle = 'nav nav-tabs';

    const { courseImg, courseName, courseAuthor, courseLesson, courseDuration, coursePrice, courseLanguage, courseContent, courseSchedule, courseDis } = props;
    console.log(courses);
    const formattedEvents = courseSchedule.map(date => ({
        title: "Scheduled Class",
        start: `${date}T00:00:00`,
        backgroundColor: "#ff5733",
        borderColor: "#ff5733",
        color: "#ff5733"
    }));
  
    console.log(coursePrice)

    return (
        <div className="back__course__page_grid react-courses__single-page pb---16 pt---110">
            <div className="container pb---70">
                <div className="row">
                    <div className="col-lg-8">
                        <Tabs>
                            <div className="course-single-tab">
                                <TabList className={tabStyle}>
                                    <Tab><button>{tab1}</button></Tab>
                                    <Tab><button>{tab2}</button></Tab>
                                </TabList>

                                <div className="tab-content" id="back-tab-content">
                                    <TabPanel>
                                        <div className="tab-pane">
                                            <h3>About This Course</h3>
                                            <p>
                                                {courseContent.split('\n').map((line, index) => (
                                                    <span key={index}>
                                                        {line}
                                                        <br />
                                                    </span>
                                                ))}
                                            </p>
                                            <div className="image-banner"><img src={require(`../../assets/images/course/${courseImg}`)} alt="user" /></div>
                                        </div>
                                    </TabPanel>
                                    <TabPanel>
                                        <div className="tab-pane">
                                            <h3>Course Schedule</h3>
                                            <FullCalendar
                                                plugins={[dayGridPlugin, listPlugin]}
                                                initialView="dayGridMonth"
                                                events={formattedEvents}
                                                eventBackgroundColor="#ff0000"
                                                eventBorderColor="#ff0000"
                                            />
                                        </div>
                                    </TabPanel>
                                </div>
                            </div>
                        </Tabs>
                        <div className="react-course-filter related__course">                                  
                            <h3>Related Courses</h3>                                             
                            <div className="row react-grid">
                                {courses.map((data, index) => {
                                    return (
                                        <div key={data.id || index} className="single-studies col-lg-6 grid-item">
                                            <div className="inner-course">
                                                <div className="case-img">
                                                    <Link to={`/course/${data.id}`} className="cate-w">{data.name}</Link>
                                                    <img src={require(`../../assets/images/course/${data.image}`)} alt={data.title} />
                                                </div>
                                                <div className="case-content">
                                                    <ul className="meta-course">
                                                    </ul>
                                                    <h4 className="case-title"> <Link to={`/course/${data.id}`}>{data.title}</Link></h4>
                                                    <div className="react__user">
                                                        <img src={require(`../../assets/images/course/${data.authorImg}`)} alt={data.author} /> {data.author}
                                                    </div>
                                                    <ul className="react-ratings">
                                                        <li className="react-book"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-file-text"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> {data.lesson} Lessons</li>
                                                        <li className="price">{data.price}</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                }).slice(4, 6)}
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-4 md-mt-60">
                        <div className="react-sidebar react-back-course2 ml----30">                                                                 
                            <div className="widget get-back-course">                                       
                                <ul className="price">
                                    <li>{coursePrice}</li>
                                </ul>                                        
                                <ul className="price__course">
                                    <li> <i className="icon_profile"></i> Instructor <b>{courseAuthor}</b></li>
                                    <li><i className="icon_tag_alt"></i> Subject <b>{courseName}</b></li>
                                    <li><i className="icon_clock_alt"></i> Duration <b>{courseDuration}</b></li>
                                    <li><i className="icon_book_alt"></i> Lectures <b>{courseLesson} lectures</b></li>
                                    <li><i className="icon_map_alt"></i> Language <b> {courseLanguage}</b></li>
                                </ul>
                                <button className="start-btn" onClick={handleOpenForm}>Start Now</button>
                            </div>                                
                        </div>
                    </div>
                </div>
            </div>
            {showForm && <RegisterForm courseTitle={courseName} onClose={handleCloseForm} />}
        </div> 
    );
}

export default CourseDetailsMain;