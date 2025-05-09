import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SingleEvent from '../../components/Event/SingleEvent';
import events from '../../data/Events.json';

const EventMain = () => {
    const itemsPerPage = 8; // Số sự kiện mỗi trang
    const [currentPage, setCurrentPage] = useState(1);

    // Tính toán danh sách sự kiện theo trang hiện tại
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEvents = events.slice(indexOfFirstItem, indexOfLastItem);

    // Tổng số trang
    const totalPages = Math.ceil(events.length / itemsPerPage);

    // Chuyển trang
    const paginate = (pageNumber) => {setCurrentPage(pageNumber);
       
    window.scrollTo(0, 0);
    }

    return (
        <div className="react-upcoming__event react-upcoming__event_page blog__area pt---100 pb---112">
            <div className="container">  
                <div className="row">
                    {currentEvents.map((data) => (
                        <div className="col-lg-3" key={data.id}>
                            <SingleEvent
                                eventID={data.id}
                                eventImg={data.image}
                                eventBannerImg={data.bannerImg}
                                eventDayCount={data.dayCount}
                                eventDate={data.date}
                                eventStartTime={data.startTime}
                                eventEndTime={data.endTime}
                                eventCategory={data.category}
                                eventContent={data.content}
                                eventTitle={data.title}
                                eventBtnText="Get Ticket"
                                eventLocation={data.location}
                            />
                        </div>
                    ))}
                </div>  

                {/* Pagination */}
                <ul className="back-pagination pt---20">
                    {Array.from({ length: totalPages }, (_, i) => (
                        <li key={i + 1} className={currentPage === i + 1 ? 'active' : ''}>
                            <Link to="#" onClick={() => paginate(i + 1)}>{i + 1}</Link>
                        </li>
                    ))}
                    {currentPage < totalPages && (
                        <li className="back-next">
                            <Link to="#" onClick={() => paginate(currentPage + 1)}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-arrow-right">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </Link>
                        </li>
                    )}
                </ul>                                          
            </div>
        </div>  
    );
}

export default EventMain;
