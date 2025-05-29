import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';

const AssignedQuizzes = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuizzesWithAttempts = async () => {
            const token = localStorage.getItem('token');
            const userStr = localStorage.getItem('user');

            if (!token || !userStr) {
                console.error("Missing token or user info");
                setLoading(false);
                return;
            }

            let user;
            try {
                user = JSON.parse(userStr);
            } catch (err) {
                console.error("Failed to parse user JSON", err);
                setLoading(false);
                return;
            }

            const userId = user._id || user.id;
            if (!userId) {
                console.error("User ID is missing");
                setLoading(false);
                return;
            }

            try {
                const res = await fetch(`http://localhost:5000/api/${userId}/quizzes`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) throw new Error('Failed to fetch quizzes');

                const data = await res.json();

                // Fetch latest attempt for each quiz
                const quizzesWithAttempts = await Promise.all(
                    data.map(async (quiz) => {
                        try {
                            const attemptRes = await fetch(`http://localhost:5000/api/results/latest/${quiz._id}`, {
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });

                            if (!attemptRes.ok) {
                                return { ...quiz, latestAttempt: null };
                            }

                            const attemptData = await attemptRes.json();
                            return {
                                ...quiz,
                                latestAttempt: attemptData
                            };
                        } catch (err) {
                            console.error('Error fetching latest attempt', err);
                            return { ...quiz, latestAttempt: null };
                        }
                    })
                );

                setQuizzes(quizzesWithAttempts);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchQuizzesWithAttempts();
    }, []);

    const renderQuizStatus = (quiz) => {
        const attempt = quiz.latestAttempt;

        if (attempt?.submitted && attempt?.score >= 90) {
            return <span className="badge bg-success">🎉 Đã đạt</span>;
        }

        if (attempt && !attempt.submitted) {
            return (
                <Link
                    to={`/user/do-quiz/${quiz._id}`}
                    className="btn btn-warning d-flex align-items-center"
                >
                    <FaPlay className="me-2" /> Tiếp tục
                </Link>
            );
        }

        return (
            <Link
                to={`/user/do-quiz/${quiz._id}`}
                className="btn btn-primary d-flex align-items-center"
            >
                <FaPlay className="me-2" /> Làm bài
            </Link>
        );
    };

    return (
        <div className="container my-5">
            <h1 className="text-center text-primary mb-4">📚 Các bài quiz được giao</h1>

            {loading ? (
                <p className="text-center text-muted">Đang tải dữ liệu...</p>
            ) : Array.isArray(quizzes) && quizzes.length === 0 ? (
                <p className="text-center text-secondary">Không có bài quiz nào được giao.</p>
            ) : (
                <div className="row">
                    {quizzes.map((quiz) => (
                        <div key={quiz._id} className="col-md-4 mb-4">
                            <div className="card h-100 shadow-sm">
                                <div className="card-body">
                                    <h5 className="card-title text-primary">{quiz.title}</h5>
                                    <p className="card-text">{quiz.description || 'Không có mô tả.'}</p>
                                    {renderQuizStatus(quiz)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssignedQuizzes;
