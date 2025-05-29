import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Classes = () => {
    const [className, setClassName] = useState('');
    const [classList, setClassList] = useState([]);
    const navigate = useNavigate();

    const fetchClasses = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/classes');
            setClassList(res.data);
        } catch (err) {
            console.error("Error fetching classes", err);
        }
    };

    useEffect(() => {
        fetchClasses();
    }, []);

    const handleAddClass = async () => {
        if (!className) return;
        try {
            await axios.post('http://localhost:5000/api/classes', { name: className });
            setClassName('');
            fetchClasses();
        } catch (err) {
            console.error("Error adding class", err);
        }
    };

    const handleDeleteClass = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/classes/${id}`);
            fetchClasses();
        } catch (err) {
            console.error("Error deleting class", err);
        }
    };

    const handleEditClass = (id) => {
        navigate(`/admin/class/${id}`);
    };

    return (
        <div className="container mt-5">
            <div className="card shadow">
                <div className="card-body">
                    <h2 className="card-title mb-4">📚 Class Management</h2>
                    <div className="input-group mb-3">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Enter class name"
                            value={className}
                            onChange={(e) => setClassName(e.target.value)}
                        />
                        <button className="btn btn-primary" onClick={handleAddClass}>Add Class</button>
                    </div>

                    <ul className="list-group">
                        {classList.map(cls => (
                            <li key={cls._id} className="list-group-item d-flex justify-content-between align-items-center">
                                <span>{cls.name}</span>
                                <div>
                                    <button
                                        className="btn btn-sm btn-warning me-2"
                                        onClick={() => handleEditClass(cls._id)}
                                    >
                                        View
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDeleteClass(cls._id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>

                    {classList.length === 0 && (
                        <div className="text-muted mt-3">No classes found.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Classes;
