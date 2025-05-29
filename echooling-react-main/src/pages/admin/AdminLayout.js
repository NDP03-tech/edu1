import React from 'react';
import HeaderAdmin from './HeaderAdmin';
import { Outlet } from 'react-router-dom';

const AdminLayout = ({ onLogout,setIsLoggedIn }) => {
    console.log('AdminLayout rendered'); // Log khi AdminLayout được render
    return (
        <div>
           <HeaderAdmin onLogout={onLogout} setIsLoggedIn={setIsLoggedIn} />
            <Outlet /> {/* Nội dung của các route con sẽ được hiển thị ở đây */}
        </div>
    );
};

export default AdminLayout;