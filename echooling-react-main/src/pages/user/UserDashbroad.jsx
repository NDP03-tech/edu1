import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { addDays, subDays, format } from 'date-fns';
import UserHeader from '../../components/User/userHeader';

const UserDashboard = () => {
    const [activityData, setActivityData] = useState([]);

    useEffect(() => {
        // Gọi API lấy dữ liệu bài làm theo ngày
        const fetchData = async () => {
            try {
                const res = await fetch('/api/user/quiz-activity'); // Trả về [{ date: '2025-05-01', count: 1 }, ...]
                const data = await res.json();
                setActivityData(data);
            } catch (err) {
                console.error(err);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <UserHeader />
            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">🎯 Bảng điều khiển hoạt động</h2>
                <p className="mb-4 text-gray-600">Lịch sử làm bài của bạn trong năm qua:</p>
                <div className="bg-white p-4 rounded shadow max-w-4xl mx-auto">
                    <CalendarHeatmap
                        startDate={subDays(new Date(), 365)}
                        endDate={new Date()}
                        values={activityData}
                        classForValue={(value) => {
                            if (!value) {
                                return 'color-empty';
                            }
                            if (value.count >= 3) return 'color-github-4';
                            if (value.count === 2) return 'color-github-3';
                            if (value.count === 1) return 'color-github-2';
                            return 'color-github-1';
                        }}
                        tooltipDataAttrs={(value) => {
                            if (!value || !value.date) return null;
                            return {
                                'data-tip': `${value.date}: ${value.count} bài đã làm`
                            };
                        }}
                        showWeekdayLabels
                    />
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;
