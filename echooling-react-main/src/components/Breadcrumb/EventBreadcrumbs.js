import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Breadcrumb = ({ eventId }) => {
    const [eventData, setEventData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchEventData = async () => {
            if (!eventId) {
                setError('Event ID is undefined');
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`http://localhost:5000/api/events/${eventId}`); // Gọi API để lấy dữ liệu sự kiện
                setEventData(response.data);
            } catch (err) {
                console.error('Error fetching event data:', err);
                setError('Failed to fetch event data');
            } finally {
                setLoading(false);
            }
        };

        fetchEventData();
    }, [eventId]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // Kiểm tra xem eventData có tồn tại không
    if (!eventData) {
        return <div>Event not found</div>;
    }

    const { eventBannerImg, eventCategory, eventDate, eventStartTime, eventEndTime, eventTitle, eventLocation } = eventData;

    return (
        <div className="react-breadcrumbs single-page-breadcrumbs">
            <div className="breadcrumbs-wrap">
                <img className="desktop" src={require(`../../assets/images/event/${eventBannerImg}`)} alt={eventTitle} />
                <img className="mobile" src={require(`../../assets/images/event/${eventBannerImg}`)} alt={eventTitle} />
                <div className="breadcrumbs-inner">
                    <div className="container">
                        <div className="breadcrumbs-text">
                            <Link to="#" className="cate">{eventCategory}</Link>
                            <h1 className="breadcrumbs-title">{eventTitle}</h1>
                            <ul className="user-section">                                        
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-calendar">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg> {eventDate}
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-clock">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg> {eventStartTime} - {eventEndTime}
                                </li>
                                <li>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-map-pin">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                        <circle cx="12" cy="10" r="3"></circle>
                                    </svg> {eventLocation}
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>                
        </div>
    );
}

export default Breadcrumb;