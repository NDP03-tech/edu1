import React from 'react';
import aboutImg from '../../assets/images/about/ab.png';
import shapeImg from '../../assets/images/about/badge.png';

const AboutPart = () => {
    return (
        <div className="about__area about__area_one p-relative pt---100 pb---120">
            <div className="container">
                <div className="row">
                    <div className="col-lg-6">
                        <div className="about__image wow animate__fadeInUp" data-wow-duration="0.3s">
                            <img src={aboutImg} alt="About" />
                            <img className="react__shape__ab" src={shapeImg} alt="Shape Image" />
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <div className="about__content">
                            <h2 className="about__title wow animate__fadeInUp" data-wow-duration="0.3s">
                                Welcome to <br/> <em>VESTA ACADEMY</em>
                            </h2>
                            <p className="about__paragraph wow animate__fadeInUp" data-wow-duration="0.5s">
                           <em> Giáo dục không chỉ là việc truyền đạt kiến thức, mà còn là hành trình khám phá tri thức và chắp cánh ước mơ.</em>
                            </p>
                            <p className="wow animate__fadeInUp" data-wow-duration="0.9s">
                           <em> Tại đây, chúng tôi cam kết mang đến những bài học đầy cảm hứng, giúp bạn mở rộng tầm nhìn và chuẩn bị cho tương lai thành công.</em>
                            </p>

                            <ul className="mt-4">
                                <li className="last-li wow animate__fadeInUp" data-wow-duration="1.3s">
                                    <em>Get Support</em>
                                    <a href="mailto: info@vestaedu.online"> info@vestaedu.online</a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Hiển thị phần nội dung ra ngoài div row */}
                <div className="react-content  mt-16 bg-gray-100 p-6 rounded-lg shadow-md wow animate__fadeInUp" data-wow-duration="1s">
                <h3 
    className="text-center"
    style={{
        background: 'linear-gradient(45deg, #FFD700, #FFA500)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        fontWeight: 'bold',
        fontFamily: 'sans-serif',
        fontSize: '2rem',
        marginTop: '96px',
        marginBottom: '16px',
        
    }}
>
    About VESTA ACADEMY
</h3>



            <p className="text-gray-700 text-2xl react-content">
    <strong>1. Hành trình ra đời:</strong><br />
    <strong>Vesta Academy</strong> được sáng lập bởi Thạc sĩ <strong>Lê Hương Ly</strong>, một nhà giáo dục tận tâm với 14 năm kinh nghiệm giảng dạy tiếng Anh chuyên sâu. <br />
    Từng đảm nhận vai trò giám khảo hỏi thi nói Cambridge (<strong>KET, PET</strong>), giảng viên tại <strong>Đại học Ngoại ngữ – ĐHQGHN (ULIS)</strong>, và giáo viên tại các ngôi trường danh giá như <strong>Hà Nội - Amsterdam</strong> và <strong>Greenfield School</strong> (hệ Cambridge), cô Hương Ly mang đến một hành trình học thuật đáng tự hào: <br />
    - <strong>IELTS 8.5 (Speaking 9.0)</strong>, hai bằng Thạc sĩ từ <strong>Victoria University (Úc)</strong> và <strong>Derby University (Anh)</strong>, đồng thời là đồng tác giả các cuốn sách nổi tiếng như “Bài Luận Mẫu Tiếng Anh Cho Học Sinh Chuyên”.<br />
    - Từ những ngày đồng hành cùng đội tuyển tiếng Anh quốc gia tại <strong>Hà Nội - Amsterdam</strong> đến việc dẫn dắt hàng ngàn học sinh chinh phục mục tiêu học thuật, <strong>Vesta Academy</strong> ra đời như một lời cam kết: <em>“Trao cho mỗi học viên tấm vé thay đổi tương lai, không chỉ qua tiếng Anh mà còn qua tầm nhìn, tri thức và cơ hội vươn xa.”</em><br /><br />

    <strong>2. Tầm nhìn & Sứ mệnh:</strong><br />
    <strong>Tầm nhìn:</strong><br />
    - Kiến tạo một cộng đồng học thuật nơi mọi học viên, bất kể xuất phát điểm, đều có thể tiến bộ vượt bậc và tự tin bước ra thế giới.<br />
    - <strong>Vesta Academy</strong> hướng tới việc phát triển giáo dục bền vững, thúc đẩy bình đẳng giới để cả nam và nữ đều được học tập công bằng, đồng thời đóng góp vào sự đổi mới của đất nước thông qua tri thức.<br /><br />

    <strong>Sứ mệnh:</strong> <em>“Không có học sinh kém, chỉ là chưa biết đường.”</em><br />
    - Chúng tôi tin rằng mọi học viên đều sở hữu tiềm năng vô hạn, và với phương pháp đúng đắn cùng sự đồng hành tận tâm, họ sẽ biến giấc mơ thành hiện thực.<br /><br />

    <strong>Giá trị cốt lõi:</strong><br />
    - <strong>Đồng hành:</strong> Luôn đặt học viên làm trung tâm, từ bài học đầu tiên đến thành công cuối cùng.<br />
    - <strong>Khoa học:</strong> Ứng dụng phương pháp Flip Classroom, ôn luyện hằng ngày, kiểm tra liên tục để kiến thức khắc sâu.<br />
    - <strong>Đổi mới:</strong> Trao học viên tấm vé thay đổi cuộc đời qua giáo dục, mở lối đến tương lai tươi sáng.<br /><br />

    <strong>3. Chiến lược triển khai:</strong><br />
    - <strong>Lộ trình cá nhân hóa:</strong> Mỗi học viên được thiết kế chương trình học riêng, dựa trên trình độ, mục tiêu và nhu cầu cụ thể, đảm bảo tiến bộ rõ rệt trong thời gian ngắn.<br />
    - <strong>Ôn luyện hằng ngày:</strong> Với bài tập bắt buộc mỗi ngày và kiểm tra từ vựng liên tục (<strong>200 từ/buổi</strong>), chúng tôi giúp học viên nắm chắc kiến thức, tránh lãng quên.<br />
    - <strong>Cam kết đầu ra:</strong> Chỉ <strong>4 tháng/khóa</strong>, học viên tăng ít nhất <strong>1-2 band IELTS</strong>; trong <strong>1 năm</strong>, từ số 0 có thể đạt <strong>IELTS 7.0</strong>.<br />
    - <strong>Đào tạo cho tương lai:</strong> Chúng tôi vinh dự được đào tạo IELTS cho các học sinh chuẩn bị du học. Họ không chỉ học tiếng Anh, mà còn mang tầm nhìn rộng mở, mang tri thức khoa học về đổi mới đất nước, và thay đổi chính cuộc đời mình.<br />
    - <strong>Give back cho xã hội:</strong> <strong>Vesta Academy</strong> không chỉ dạy học, mà còn nỗ lực xóa bỏ định kiến “học sinh dốt”, thúc đẩy bình đẳng giới, và hỗ trợ học bổng cho học viên khó khăn, để ai cũng có cơ hội vươn lên.<br />
</p>

                </div>
            </div>
        </div>
    );
}

export default AboutPart;
