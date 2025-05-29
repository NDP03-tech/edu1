import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Breadcrumb from '../../components/Breadcrumb/EventBreadcrumbs';
import EventDetailsMain from './EventDetailsMain';
import ScrollToTop from '../../components/ScrollTop';
import Logo from '../../assets/images/logos/logo2.png';

const EventDetails = () => {
    const location = useLocation();
    const eventId = location.pathname.split('/')[2]; // Lấy ID sự kiện từ URL
    const [event, setEvent] = useState(null); // Khởi tạo state cho sự kiện
    const [loading, setLoading] = useState(true); // Khởi tạo state cho trạng thái loading
    const [error, setError] = useState(null); // Khởi tạo state cho lỗi

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/events/${eventId}`); // Gọi API để lấy sự kiện
                setEvent(response.data); // Lưu dữ liệu sự kiện vào state
                setLoading(false); // Cập nhật trạng thái loading
            } catch (err) {
                console.error('Error fetching event:', err);
                setError('Failed to fetch event data'); // Cập nhật lỗi nếu có
                setLoading(false); // Cập nhật trạng thái loading
            }
        };

        fetchEvent();
    }, [eventId]); // Gọi lại hàm khi eventId thay đổi

    // Hiển thị loading hoặc thông báo lỗi nếu có
    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    // Nếu không có sự kiện, hiển thị thông báo không tìm thấy
    if (!event) {
        return <div>Event not found</div>;
    }

    return (
        <>
            <Header
                parentMenu='event'
                menuCategoryEnable='enable'
                headerNormalLogo={Logo}
                headerStickyLogo={Logo}
            />

            <div className="react-wrapper">
                <div className="react-wrapper-inner">
                    <Breadcrumb
                        eventID={event.id}
                        eventImg={event.image}
                        eventBannerImg={event.bannerImg}
                        eventDayCount={event.dayCount}
                        eventDate={event.date}
                        eventStartTime={event.startTime}
                        eventEndTime={event.endTime}
                        eventCategory={event.category}
                        eventTitle={event.title}
                        eventBtnText="Find Out More"
                        eventContent={event.content}
                        eventLocation={event.location}
                    />

                    <EventDetailsMain
                        eventID={event.id}
                        eventImg={event.image}
                        eventBannerImg={event.bannerImg}
                        eventDayCount={event.dayCount}
                        eventDate={event.date}
                        eventStartTime={event.startTime}
                        eventEndTime={event.endTime}
                        eventCategory={event.category}
                        eventTitle={event.title}
                        eventContent={event.content}
                        eventBtnText="Find Out More"
                        eventLocation={event.location}
                        eventCost={event.cost}
                        eventHost={event.host}
                        eventTotalSlot={event.totalSlot}
                        eventBookedSlot={event.bookedSlot}
                        eventContactNo={event.phone}
                    />

                    {/* scrolltop-start */}
                    <ScrollToTop />
                    {/* scrolltop-end */}
                </div>
            </div>

            <Footer />
        </>
    );
}

export default EventDetails;