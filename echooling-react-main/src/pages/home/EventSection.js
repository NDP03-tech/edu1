import React, { useEffect, useState } from 'react';
import Slider from "react-slick";
import axios from 'axios';

import SectionTitle from '../../components/SectionTitle';
import SingleEvent from '/Users/nguyendacphuc/Downloads/edu/edu1/echooling-react-main/src/components/Event/SingleEvent.js'

const Event = () => {
    const [events, setEvents] = useState([]);

    const eventSettings = {
        dots: true,
        arrows: false,
        infinite: false,
        centerMode: false,
        slidesToShow: 4,
        slidesToScroll: 1,
        responsive: [
            {
                breakpoint: 1199,
                settings: {
                    slidesToShow: 2,
                }
            },
            {
                breakpoint: 767,
                settings: {
                    slidesToShow: 1,
                    arrows: false,
                }
            }
        ]
    };

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/events'); // Đường dẫn API backend
                setEvents(response.data);
            } catch (error) {
                console.error('Failed to fetch events:', error);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="react-upcoming__event blog__area">
            <div className="container">
                <SectionTitle Title="Upcoming Events" />
                <div className="event-slider wow animate__fadeInUp" data-wow-duration="0.3s">
                    <Slider {...eventSettings}>
                        {events.slice(0, 6).map((data) => (
                            <SingleEvent
                                key={data._id || data.id} // tuỳ thuộc backend trả về id
                                eventID={data._id || data.id}
                                eventImg={data.image}
                                eventBannerImg={data.bannerImg}
                                eventDayCount={data.dayCount}
                                eventDate={data.date}
                                eventStartTime={data.startTime}
                                eventEndTime={data.endTime}
                                eventCategory={data.category}
                                eventTitle={data.title}
                                eventBtnText="Find Out More"
                                eventLocation={data.location}
                            />
                        ))}
                    </Slider>
                </div>
            </div>
        </div>
    );
};

export default Event;
