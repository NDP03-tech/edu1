import React, { useEffect, useState } from 'react';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { subDays } from 'date-fns';
import UserHeader from '../../components/User/userHeader';
import QuoteOfTheDay from '../../components/QuoteOfTheDay';
const UserDashboard = () => {
  const [activityData, setActivityData] = useState([]);

  const fetchQuizzesWithLatestAttempts = async (userId, token) => {
    const res = await fetch(`http://localhost:5000/api/${userId}/quizzes`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const quizzes = await res.json();

    const enriched = await Promise.all(
      quizzes.map(async (quiz) => {
        const attemptRes = await fetch(`http://localhost:5000/api/results/latest/${quiz._id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const latestAttempt = await attemptRes.json();
        return { ...quiz, latestAttempt };
      })
    );

    return enriched;
  };

  const convertToHeatmapData = (quizAttempts) => {
    const dateMap = {};
    quizAttempts.forEach(({ latestAttempt }) => {
      if (latestAttempt?.submittedAt) {
        const date = latestAttempt.submittedAt.split('T')[0];
        dateMap[date] = (dateMap[date] || 0) + 1;
      }
    });

    return Object.entries(dateMap).map(([date, count]) => ({ date, count }));
  };

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        const user = JSON.parse(userStr);
        const userId = user._id || user.id;

        const combined = await fetchQuizzesWithLatestAttempts(userId, token);
        const data = convertToHeatmapData(combined);
        setActivityData(data);
      } catch (err) {
        console.error('Lỗi khi lấy dữ liệu heatmap:', err);
      }
    };

    init();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-screen-xl mx-auto p-4">
      <QuoteOfTheDay />
      <p className="mb-6 text-gray-800">Your quiz activity over the past year:</p>


        <div className="bg-white p-4 rounded shadow w-full overflow-x-auto">
          <div className="scale-[0.8] sm:scale-100 origin-top-left">
            <CalendarHeatmap
              startDate={subDays(new Date(), 365)}
              endDate={new Date()}
              values={activityData}
              classForValue={(value) => {
                if (!value) return 'color-empty';
                if (value.count >= 3) return 'color-github-4';
                if (value.count === 2) return 'color-github-3';
                if (value.count === 1) return 'color-github-2';
                return 'color-github-1';
              }}
              tooltipDataAttrs={(value) =>
                value && value.date
                  ? { 'data-tip': `${value.date}: ${value.count} bài đã làm` }
                  : null
              }
              showWeekdayLabels
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
