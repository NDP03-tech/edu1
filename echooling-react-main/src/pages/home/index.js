import logoImage from '../../assets/images/logos/1.jpg';
import React, { useState } from 'react';
import HomeMain from './HomeMain';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import footerLogo from '../../assets/images/logos/logo-doc.png';

const HomePage = () => {
    const [showPopup, setShowPopup] = useState(true);

    const handleClosePopup = () => {
        setShowPopup(false);
    };

    const handleRegisterClick = () => {
        // Thay đổi URL này thành đường dẫn bạn muốn mở
        const registrationUrl = 'https://docs.google.com/forms/d/e/1FAIpQLScBHU9X8svl0J-7uRcjiQMkbPhL6jcg-MFU-CftchmippzenA/viewform';
        window.open(registrationUrl, '_blank'); // Mở liên kết trong tab mới
        handleClosePopup(); // Đóng popup sau khi mở liên kết
    };

    return (
        <>
            {showPopup && (
                <div style={{ 
                    position: 'fixed', 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0, 
                    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
                    zIndex: 40 
                }} />
            )}

            {showPopup && (
                <div 
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0, 
                        display: 'flex', 
                        justifyContent: 'center', 
                        alignItems: 'center', 
                        zIndex: 50 
                    }} 
                    onClick={handleClosePopup}
                >
                    <div style={{ 
                        backgroundColor: 'white', 
                        padding: '24px', 
                        borderRadius: '8px', 
                        boxShadow: '0 10px 15px rgba(0, 0, 0, 0.1)', 
                        maxWidth: '800px', 
                        width: '80%' 
                    }} onClick={(e) => e.stopPropagation()}>
                        <div style={{ display: 'flex' }}>
                            <div style={{ flex: 1, paddingRight: '16px', textAlign: 'center' }}>
                                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Đăng Ký Ngay Để Nhận Ưu Đãi!</h1>
                                <div style={{ 
                                    width: '100%', 
                                    maxWidth: '320px', 
                                    height: 'auto', 
                                    overflow: 'hidden', 
                                    borderRadius: '8px', 
                                    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', 
                                    margin: '0 auto' 
                                }}>
                                    <img 
                                        src={logoImage} 
                                        alt="Logo" 
                                        style={{ 
                                            width: '100%', 
                                            height: 'auto', 
                                            objectFit: 'cover', 
                                            transition: 'transform 0.3s' 
                                        }} 
                                    />
                                </div>
                            </div>
                            <div style={{ flex: 2, paddingLeft: '16px' }}>
                                <form style={{ display: 'flex', flexDirection: 'column' }}>
                                    <input type="text" placeholder="Họ và Tên" required style={{ marginBottom: '8px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    <input type="email" placeholder="Email" required style={{ marginBottom: '8px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                                    <input type="tel" placeholder="Số điện thoại" required style={{ marginBottom: '16px', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
                                </form> 
                                <h3 style={{ marginTop: '16px', color: '#333' }}>Những khóa học tiêu biểu:</h3>
                                <div style={{ marginTop: '8px', color: '#718096' }}>
                                    {['5+', '6+', '7+'].map((level, index) => {
                                        const currentPrice = level === '5+' ? '8.400.000 VNĐ' : level === '6+' ? '12.000.000 VNĐ' : '15.000.000 VNĐ';
                                        const originalPrice = level === '5+' ? '12.000.000 VNĐ' : level === '6+' ? '16.000.000 VNĐ' : '18.000.000 VNĐ';

                                        return (
                                            <div key={index} style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '4px' }}>
                                                <span style={{ marginRight: '10px' }}>IELTS {level}: {currentPrice}</span>
                                                <span style={{ textDecoration: 'line-through', color: '#f56565' }}>{originalPrice}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                                <h3 style={{ marginTop: '16px', color: '#333' }}>Và còn khóa học không thể bỏ lỡ!</h3>
                                <button 
                                    style={{ 
                                        marginTop: '20px', 
                                        backgroundColor: '#3b82f6', 
                                        color: 'white', 
                                        padding: '10px 20px', 
                                        borderRadius: '8px', 
                                        transition: 'background-color 0.3s',
                                        alignSelf: 'center' 
                                    }} 
                                    onClick={handleRegisterClick} // Cập nhật hàm onClick
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                                >
                                    Đăng ký ngay!!!
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