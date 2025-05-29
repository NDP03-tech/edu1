import React from 'react';
import { Navbar, Nav } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Import Link từ react-router-dom
import 'bootstrap/dist/css/bootstrap.min.css';

function HeaderAdmin() {
    console.log("HeaderAdmin is rendering"); // Log để kiểm tra
    return (
        <Navbar bg="light" expand="lg" style={{ zIndex: 1000, position: 'relative', backgroundColor: 'lightblue' }}>
            <Navbar.Brand as={Link} to="/dashboard">Admin Dashboard</Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="ml-auto">
                    <Nav.Link as={Link} to="/adminCourse">Course</Nav.Link>
                    <Nav.Link as={Link} to="/adminUser">Users</Nav.Link>
                    <Nav.Link as={Link} to="/adminBlog">Blog</Nav.Link>
                    <Nav.Link as={Link} to="/adminEvent">Event</Nav.Link>
                    <Nav.Link as={Link} to="/quiz-manage">Quiz Manage</Nav.Link>
                    <Nav.Link as={Link} to="/classes">Classes</Nav.Link>
                    <Nav.Link as={Link} to="/categories">Categories</Nav.Link>
                  
                </Nav>
            </Navbar.Collapse>
        </Navbar>
    );
}

export default HeaderAdmin;