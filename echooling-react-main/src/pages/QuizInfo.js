import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Tabs, Tab, TabList, TabPanel } from 'react-tabs';
import ExplanationEditor from '../Explanation/ExplanationEditor';

const defaultSettings = {
    oneQuestionPerPage: false,
    showQuestionNumbers: true,
    shuffle: "none",
    timeLimit: 0,
    maxAttempts: "Unlimited",
    showFeedback: true,
    displayScore: true,
    specialChars: "",
    headerText: "",
    instructionText: "",
    quizCompleteMessage: "",
    showHeaderInput: false,
    showCompletionInput: false,
    showInstructionInput: false,
};

const QuizInfo = ({ onQuizInfoChange, quizId }) => {
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [uiSettings, setUiSettings] = useState(defaultSettings);

    const [categories, setCategories] = useState([]);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategory, setNewCategory] = useState('');

    useEffect(() => {
        if (quizId) {
            axios.get(`http://localhost:5000/api/quizzes/${quizId}`)
                .then(response => {
                    const quiz = response.data;
                    setTitle(quiz.title || '');
                    setCategory(quiz.category || '');
                    setUiSettings({ ...defaultSettings, ...quiz.uiSettings });
                })
                .catch(error => {
                    console.error('Error fetching quiz:', error);
                });
        }
    }, [quizId]);

    useEffect(() => {
        onQuizInfoChange({ title, category, uiSettings });
    }, [title, category, uiSettings]);

    useEffect(() => {
        axios.get("http://localhost:5000/api/categories")
            .then(res => setCategories(res.data.map(c => c.name)))
            .catch(err => console.error("Lỗi khi lấy danh mục:", err));
    }, []);

    return (
        <div className="p-4">
            <h1>Create Quiz</h1>

            <div className="form-group">
                <label>Titile:</label>
                <input
                    type="text"
                    className="form-control"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Nhập tiêu đề của quiz"
                />
            </div>

            <div className="form-group">
                <label>Category:</label>
                <div className="d-flex gap-2">
                    <select
                        className="form-control"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => setShowCategoryModal(true)}
                    >
                        ➕
                    </button>
                </div>
            </div>

            <div className="TabForm">
                <Tabs>
                    <TabList>
                        <Tab>Order</Tab>
                        <Tab>Feedback/Input</Tab>
                        <Tab>Visible</Tab>
                    </TabList>

                    <TabPanel>
                        <div className="p-3">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={uiSettings.oneQuestionPerPage}
                                    onChange={() =>
                                        setUiSettings(prev => ({
                                            ...prev,
                                            oneQuestionPerPage: !prev.oneQuestionPerPage
                                        }))
                                    }
                                />
                                <label className="form-check-label">One question per page</label>
                            </div>

                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    checked={uiSettings.showQuestionNumbers}
                                    onChange={() =>
                                        setUiSettings(prev => ({
                                            ...prev,
                                            showQuestionNumbers: !prev.showQuestionNumbers
                                        }))
                                    }
                                />
                                <label className="form-check-label">Show question numbers</label>
                            </div>

                            <div className="form-group">
                                <label>Shuffle:</label>
                                <select
                                    className="form-control"
                                    value={uiSettings.shuffle}
                                    onChange={(e) =>
                                        setUiSettings(prev => ({
                                            ...prev,
                                            shuffle: e.target.value
                                        }))
                                    }
                                >
                                    <option value="none">None</option>
                                    <option value="questions">Shuffle questions</option>
                                    <option value="answers">Shuffle answers</option>
                                    <option value="both">Shuffle questions & answers</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Time Limit:</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={uiSettings.timeLimit || ''}
                                    onChange={(e) =>
                                        setUiSettings(prev => ({
                                            ...prev,
                                            timeLimit: parseInt(e.target.value) || 0
                                        }))
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label>Max number of attempts:</label>
                                <select
                                    className="form-control"
                                    value={uiSettings.maxAttempts}
                                    onChange={(e) =>
                                        setUiSettings(prev => ({
                                            ...prev,
                                            maxAttempts: e.target.value
                                        }))
                                    }
                                >
                                    <option>Unlimited</option>
                                    {[1, 2, 3, 4, 5].map(attempt => (
                                        <option key={attempt} value={attempt}>{attempt}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div className="p-3">
                            <div className="form-group">
                                <label>Header Text:</label>
                                <ExplanationEditor
                                    value={uiSettings.headerText}
                                    onChange={(val) =>
                                        setUiSettings(prev => ({ ...prev, headerText: val }))
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label>Instruction Text:</label>
                                <ExplanationEditor
                                    value={uiSettings.instructionText}
                                    onChange={(val) =>
                                        setUiSettings(prev => ({ ...prev, instructionText: val }))
                                    }
                                />
                            </div>

                            <div className="form-group">
                                <label>Completion Message:</label>
                                <ExplanationEditor
                                    value={uiSettings.quizCompleteMessage}
                                    onChange={(val) =>
                                        setUiSettings(prev => ({ ...prev, quizCompleteMessage: val }))
                                    }
                                />
                            </div>

                            {[
                                { key: 'showHeaderInput', label: 'Show Header Input' },
                                { key: 'showCompletionInput', label: 'Show Completion Input' },
                                { key: 'showInstructionInput', label: 'Show Instruction Input' },
                                { key: 'showFeedback', label: 'Show Feedback' },
                                { key: 'displayScore', label: 'Display Score' }
                            ].map(({ key, label }) => (
                                <div className="form-check" key={key}>
                                    <input
                                        type="checkbox"
                                        className="form-check-input"
                                        checked={uiSettings[key]}
                                        onChange={() =>
                                            setUiSettings(prev => ({
                                                ...prev,
                                                [key]: !prev[key]
                                            }))
                                        }
                                    />
                                    <label className="form-check-label">{label}</label>
                                </div>
                            ))}

                            <div className="form-group">
                                <label>Special Chars:</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    value={uiSettings.specialChars}
                                    onChange={(e) =>
                                        setUiSettings(prev => ({
                                            ...prev,
                                            specialChars: e.target.value
                                        }))
                                    }
                                />
                            </div>
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <div>
                            <label>
                                Link:
                                <input type="text" />
                            </label>
                            <br />
                            <label>
                                Visible to:
                                <select>
                                    <option value="everyone">Everyone</option>
                                    <option value="registered">Registered Users</option>
                                </select>
                            </label>
                        </div>
                    </TabPanel>
                </Tabs>
            </div>

            {/* Modal thêm danh mục */}
            {showCategoryModal && (
                <div className="modal-backdrop show">
                    <div className="modal d-block" tabIndex="-1" role="dialog">
                        <div className="modal-dialog" role="document">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Thêm danh mục mới</h5>
                                    <button
                                        type="button"
                                        className="btn-close"
                                        onClick={() => setShowCategoryModal(false)}
                                    ></button>
                                </div>
                                <div className="modal-body">
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tên danh mục mới"
                                        value={newCategory}
                                        onChange={(e) => setNewCategory(e.target.value)}
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowCategoryModal(false)}
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        className="btn btn-primary"
                                        onClick={async () => {
                                            try {
                                                const res = await axios.post("http://localhost:5000/api/categories", {
                                                    name: newCategory,
                                                });
                                                const newCat = res.data.name;
                                                setCategories((prev) => [...prev, newCat]);
                                                setCategory(newCat);
                                                setNewCategory('');
                                                setShowCategoryModal(false);
                                            } catch (err) {
                                                alert("❌ Không thể thêm danh mục");
                                            }
                                        }}
                                    >
                                        Lưu
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizInfo;
