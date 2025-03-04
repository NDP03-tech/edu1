import React, { useState } from "react";
import { Link, useLocation } from 'react-router-dom';
import CountUp from 'react-countup';
import VisibilitySensor from 'react-visibility-sensor'; 

import courses from '../../data/Courses.json';
import instructors from '../../data/Instructors.json';
import './InstructorDetailsMain.css';
import countIcon1 from '../../assets/images/profile/2.png'; // Biểu tượng 1
import countIcon2 from '../../assets/images/profile/3.png'; // Biểu tượng 2
import countIcon3 from '../../assets/images/profile/4.png'; // Biểu tượng 3

const InstructorDetailsMain = () => {
    const location = useLocation();
    const postURL = location.pathname.split('/'); 
    
    const instructor = instructors.find((b) => b.id === Number(postURL[2]));

    const [state, setState] = useState(true);

    const icons = [countIcon1, countIcon2, countIcon3]; // Mảng các biểu tượng
    const titles = [
        "Student complete",
        "Classes complete",
        "Students enrolled"
    ]; // Mảng tiêu đề

    return (
        <>
            <div className="profile-top back__course__area pt---120 pb---90">
                <div className="container">
                    <div className="row">
                    <div className="col-lg-4">
                            <img 
                                className="profile-image" 
                                src={require(`../../assets/images/instructors/${instructor.image}`)} 
                                alt={instructor.name} 
                            />
                            <Link to="#" className="follows">Follow</Link>
                        </div>
                        <div className="col-lg-8">
                            <ul className="user-section">
                                <li className="user">
                                    <span className="name">Name:</span><em>{instructor.name}</em>
                                </li>
                                <li>Job Title:<em>{instructor.designation}</em></li>
                                <li>Phone:<em>{instructor.phone}</em></li>
                                <li>Email:<em>{instructor.email}</em></li>
                            </ul>
                            <h3>Biography</h3>
                            <p dangerouslySetInnerHTML={{ __html: instructor.bio.replace(/\n/g, '<br />') }} />
                            
                            {/* Hiển thị counters */}
                            {instructor.counters && (
                                <div className="count__area2"> 
                                    <ul className="row">
                                        {instructor.counters.map((counter, index) => {
                                            const countNum = Object.values(counter)[0]; // Lấy giá trị đầu tiên (số lượng)
                                            return (
                                                <li key={index} className="col-lg-4">
                                                    <div className="count__content">
                                                        <div className="icon">
                                                            <img src={icons[index]} alt={`Icon ${index + 1}`} /> {/* Lấy biểu tượng từ mảng */}
                                                        </div>
                                                        <div className="text">
                                                            <VisibilitySensor onChange={(isVisible) => isVisible && setState(false)} delayedCall>
                                                                <CountUp start={state ? 0 : countNum} end={countNum} duration={10} />
                                                            </VisibilitySensor>
                                                            <em>{counter.countSubtext}</em>
                                                            <p>{titles[index]}</p> {/* Lấy tiêu đề từ mảng */}
                                                        </div>                                           
                                                    </div>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}
                            
                            <h2 className="teacher__course">Teacher Courses</h2>
                            <div className="react-course-filter related__course">
                                <div className="row react-grid">  
                                    {courses.map((data) => (
                                        <div className="single-studies col-lg-6 grid-item" key={data.id}>
                                            <div className="inner-course">
                                                <div className="case-img">
                                                    <Link to="#" className="cate-w">{data.name}</Link>
                                                    <img src={require(`../../assets/images/course/${data.image}`)} alt={data.title} />
                                                </div>
                                                <div className="case-content">
                                                    <ul className="meta-course">
                                                        <li>{data.review} review</li>
                                                        <li>{data.enrolled} Students</li>
                                                    </ul>
                                                    <h4 className="case-title"><Link to={`/course/${data.id}`}>{data.title}</Link></h4>
                                                    <div className="react__user">
                                                        <img src={require(`../../assets/images/course/${data.authorImg}`)} alt={data.author} /> {data.author}
                                                    </div>
                                                </div>
                                            </div>
                                        </div> 
                                    )).slice(0, 4)}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>  
        </>
    );
}

export default InstructorDetailsMain;