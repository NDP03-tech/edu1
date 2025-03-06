import React from 'react';
import { Link } from 'react-router-dom';

import courseImg1 from '../../assets/images/course/1.png';

const SingleCourseList = (props) => {
    const { itemClass, courseID, courseImg, courseName, courseTitle, courseAuthor, courseAuthorImg, courseLesson, coursePrice, courseEnrolled, courseReview,courseDis } = props;
	return(
        <div className={itemClass ? itemClass : 'single-studies grid-item'}>
            <div className="single-studies col-lg-12 grid-item">
                <div className="inner-course">
                    <div className="case-img">
                        <Link to="#" className="cate-w">{courseName ? courseName : 'Beginner'}</Link>
                        <img src={courseImg ? require(`../../assets/images//course/${courseImg}`) : require(`../../assets/images//course/${courseImg1}`)} alt={courseTitle} />
                    </div>
                    <div className="case-content">
                        <h4 className="case-title">
                            <Link to={`/course/${courseID}`}>{courseTitle ? courseTitle : 'The Most Complete Design Thinking Course On The Market.'}</Link>
                        </h4>
                        <div className="react__user">
                            <img src={require(`../../assets/images/course/${courseAuthorImg}`)} alt="user" /> {courseAuthor}
                        </div>
                        <ul className="react-ratings">
                            <li className="react-book"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-file-text"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> {courseLesson} Lesson</li>
                            <li className="price">{coursePrice}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
	)
}

export default SingleCourseList