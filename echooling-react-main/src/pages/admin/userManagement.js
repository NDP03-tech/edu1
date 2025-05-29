import React, { useEffect, useState } from 'react';
import axios from 'axios';

const UserManager = () => {
    const defaultFormData = {
        email: '',
        password: '',
        role: 'user',
        firstName: '',
        lastName: '',
        studentPhone: '',
        guardianPhone: '',
        studentEmail: '',
        guardianEmail: '',
        address: '',
    };

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({ ...defaultFormData });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get('http://localhost:5000/api/users', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUsers(res.data);
        } catch (err) {
            console.error('Error fetching users', err);
            if (err.response?.status === 401) {
                alert('Bạn chưa đăng nhập hoặc không có quyền');
            }
        }
    };

    const handleChange = e => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (editingId) {
                await axios.put(
                    `http://localhost:5000/api/users/${editingId}`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            } else {
                await axios.post(
                    'http://localhost:5000/api/users',
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
            }
            // Reset form + reload
            setFormData({ ...defaultFormData });
            setEditingId(null);
            fetchUsers();
        } catch (err) {
            console.error('Error saving user', err);
        }
    };

    const handleEdit = user => {
        setFormData({ ...user, password: '' });
        setEditingId(user._id);
    };

    const handleDelete = async id => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(
                `http://localhost:5000/api/users/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            fetchUsers();
        } catch (err) {
            console.error('Error deleting user', err);
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container mt-5">
            <h2>User Management</h2>

            <form onSubmit={handleSubmit} className="mb-4">
                <div className="row g-3">
                    <div className="col-md-4">
                        <input name="email" className="form-control" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    </div>
                    <div className="col-md-4">
                        <input name="password" className="form-control" placeholder="Password" type="password" value={formData.password} onChange={handleChange} required={!editingId} />
                    </div>
                    <div className="col-md-4">
                        <select name="role" className="form-select" value={formData.role} onChange={handleChange}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <input name="firstName" className="form-control" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <input name="lastName" className="form-control" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <input name="studentPhone" className="form-control" placeholder="Student Phone" value={formData.studentPhone} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <input name="guardianPhone" className="form-control" placeholder="Guardian Phone" value={formData.guardianPhone} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <input name="studentEmail" className="form-control" placeholder="Student Email" value={formData.studentEmail} onChange={handleChange} />
                    </div>
                    <div className="col-md-4">
                        <input name="guardianEmail" className="form-control" placeholder="Guardian Email" value={formData.guardianEmail} onChange={handleChange} />
                    </div>
                    <div className="col-md-12">
                        <input name="address" className="form-control" placeholder="Address" value={formData.address} onChange={handleChange} />
                    </div>
                    <div className="col-md-12">
                        <button type="submit" className="btn btn-primary">
                            {editingId ? 'Update User' : 'Add User'}
                        </button>
                        {editingId && (
                            <button
                                type="button"
                                className="btn btn-secondary ms-2"
                                onClick={() => {
                                    setEditingId(null);
                                    setFormData({ ...defaultFormData });
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>
            </form>

            <input
                type="text"
                className="form-control mb-3"
                placeholder="Search by email..."
                value={search}
                onChange={e => setSearch(e.target.value)}
            />

            <div className="table-responsive">
                <table className="table table-bordered table-hover align-middle user-table">
                    <thead className="table-dark">
                        <tr>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Name</th>
                            <th>Student Phone</th>
                            <th>Guardian Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user._id}>
                                <td>{user.email}</td>
                                <td>{user.role}</td>
                                <td>{user.firstName} {user.lastName}</td>
                                <td>{user.studentPhone}</td>
                                <td>{user.guardianPhone}</td>
                                <td>
                                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(user)}>Edit</button>
                                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(user._id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManager;
