import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

import msly from "../../assets/images/instructors/msly.jpeg";

const EventDetailsMain = ({ eventId }) => {
    const [eventDetails, setEventDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEventDetails = async () => {
            if (!eventId) {
                setError('Event ID is undefined');
                setLoading(false);
                return;
            }

            try {
                const response = await axios.get(`http://localhost:5000/api/events/${eventId}`);
                setEventDetails(response.data);
            } catch (err) {
                console.error('Error fetching event details:', err);
                setError('Failed to fetch event details');
            } finally {
                setLoading(false);
            }
        };

        fetchEventDetails();
    }, [eventId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // Kiểm tra xem eventDetails có tồn tại không
    if (!eventDetails) {
        return <div>Event not found</div>;
    }

    const {
        eventDate,
        eventStartTime,
        eventEndTime,
        eventLocation,
        eventCost,
        eventHost,
        eventContactNo,
        eventContent,
    } = eventDetails;

    return (
        <div className="back__course__page_grid react-courses__single-page react-events__single-page pb---40 pt---120">
            <div className="container pb---70">
                <div className="row">
                    <div className="col-lg-8">
                        <div className="events-details">
                            <h3>About The Event</h3>
                            <p>{eventContent}</p>
                            <ul className="others-instructors">
                                <li>Người tổ chức sự kiện: {eventHost}</li>
                                <li>
                                    Đặt chỗ ngay hôm nay:  
                                    <a href="https://forms.gle/nTSLtEqaFXK3sGGJ8" target="_blank" rel="noopener noreferrer">
                                        Bấm vào đây
                                    </a>
                                </li>
                                <br />
                                <li>🌐 www.vestaedu.online</li>
                                <br />
                                <li>📞 {eventContactNo}</li>
                            </ul>
                            <img src={msly} alt="Ms. Ly" width="900" height="100" />
                        </div>
                    </div>
                    <div className="col-lg-4 md-mt-60">
                        <div className="react-sidebar react-back-course2 ml----30">                                                                        
                            <div className="widget get-back-course">                                       
                                <ul className="price__course">
                                    <li><i className="icon_ribbon_alt"></i> Cost: <b className="prs">{eventCost}</b></li>
                                    <li><i className="icon_profile"></i> Instructor: <b>{eventHost}</b></li>
                                </ul>
                                <Link to="https://forms.gle/nTSLtEqaFXK3sGGJ8" className="start-btn" target="_blank" rel="noopener noreferrer">
                                    Join Now! 
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-right">
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </Link>
                                <div className="share-course">
                                    Share this course <em>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-share-2">
                                            <circle cx="18" cy="5" r="3"></circle>
                                            <circle cx="6" cy="12" r="3"></circle>
                                            <circle cx="18" cy="19" r="3"></circle>
                                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                                        </svg>
                                    </em>
                                    <span>
                                        <Link to="#"><i aria-hidden="true" className="social_facebook"></i></Link>
                                        <Link to="#"><i aria-hidden="true" className="social_linkedin"></i></Link>
                                    </span>
                                </div>
                            </div> 
                            <div className="widget react-date-sec">
                                <ul className="recent-date">
                                    <li>Date: <b>{eventDate}</b></li>
                                    <li>Time: <b>{eventStartTime} - {eventEndTime}</b></li>
                                    <li>Venue: <b>{eventLocation}</b></li>
                                    <li>Phone: <b>{eventContactNo}</b></li>
                                </ul>
                            </div>                                
                        </div>
                    </div>
                </div>
            </div>
        </div>  
    );
}

export default EventDetailsMain;