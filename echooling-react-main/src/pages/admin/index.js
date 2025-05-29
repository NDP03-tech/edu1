import React, { useEffect } from 'react';
import HeaderAdmin from '../../components/HeaderAdmin';
import { useNavigate } from 'react-router-dom';
import QuizCreatePage from '../../components/QuizCreatePage';

function Dashbroad() {

  return (
    <div>
      <h1>Welcome to the Admin Dashboard</h1>
      
      <QuizCreatePage/>
    </div>
  );
}

export default Dashbroad;