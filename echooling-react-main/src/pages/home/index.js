import React, { useState } from 'react';
import './HomePage.css'; // Import file CSS
import logoImage from '../../assets/images/logos/1.jpg';
import HomeMain from './HomeMain';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import footerLogo from '../../assets/images/logos/logo-footer.png';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const [showPopup, setShowPopup] = useState(true);
    const [isBlinking, setIsBlinking] = useState(false);
    const navigate = useNavigate(); // Khởi tạo useNavigate
    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleRegisterClick = () => {
        const registrationUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScBHU9X8svl0J-7uRcjiQMkbPhL6jcg-MFU-CftchmippzenA/viewform';
        window.open(registrationUrl, '_blank');
        handleClosePopup();
    };

    const handleFreeTestClick = () => {
        setIsBlinking(true);
        setTimeout(() => {
            setIsBlinking(false);
        }, 1000); // Nhấp nháy trong 1 giây

        // Chuyển hướng đến trang /test
        navigate('/test'); // Sử dụng navigate thay vì history.push
    };


    return (
        <>
            {showPopup && <div id="popup-overlay" />}

            {showPopup && (
                <div id="popup-container" onClick={handleClosePopup}>
                    <div id="popup-content" onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex' }}>
                            <div style={{ flex: 1, paddingRight: '16px', textAlign: 'center' }}>
                                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Đăng Ký Ngay Để Nhận Ưu Đãi!</h1>
                                <div id="popup-image">
                                    <img src={logoImage} alt="Logo" style={{ width: '100%', height: 'auto' }} />
                                </div>
                            </div>
                            <div style={{ flex: 2, paddingLeft: '16px' }}>
                                <form id="popup-form">
                                    <input type="text" placeholder="Họ và Tên" required />
                                    <input type="email" placeholder="Email" required />
                                    <input type="tel" placeholder="Số điện thoại" required />
                                </form>
                                <h3 style={{ marginTop: '16px', color: '#333' }}>Những khóa học tiêu biểu:</h3>
                                <div id="price-container">
                                    {['5+', '6+', '7+'].map((level, index) => {
                                        const currentPrice = level === '5+' ? '8.400.000 VNĐ' : level === '6+' ? '12.000.000 VNĐ' : '15.000.000 VNĐ';
                                        const originalPrice = level === '5+' ? '12.000.000 VNĐ' : level === '6+' ? '16.000.000 VNĐ' : '18.000.000 VNĐ';

                                        return (
                                            <div key={index} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
                                                <span>IELTS {level}: {currentPrice}</span>
                                                <span className="original-price">{originalPrice}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <h3 style={{ marginTop: '16px', color: '#333' }}>Và còn khóa học không thể bỏ lỡ!</h3>
                                <button id="register-button" onClick={handleRegisterClick}>
                                    Đăng ký ngay!!!
                                </button>
                                
                                <button 
    style={{ 
        marginTop: '16px', 
        color: '#fff', 
        backgroundColor: isBlinking ? 'red' : '#007bff', // Đổi màu nền khi nhấp nháy
        border: 'none', 
        borderRadius: '5px', 
        padding: '10px 20px', 
        cursor: 'pointer', 
        transition: 'background-color 0.3s ease', 
        marginLeft: '55px' 
    }} 
    onClick={handleFreeTestClick}
>
    Đăng kí thi thử miễn phí!!!
</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!showPopup && <Header parentMenu='home' topbarEnable='enable' />}
            <HomeMain isDimmed={showPopup} />
            <Footer footerLogo={footerLogo} isDimmed={showPopup} />
        </>
    );
};

export default HomePage;