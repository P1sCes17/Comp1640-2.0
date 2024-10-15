import './App.css';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from './Layout';

import Home from './Components/Home/Home';
import Login from './Components/Login/Login';
import LoginAdd from './Components/Login/LoginAdd';
import LoginManager from './Components/Login/LoginManager';

import TeacherDashboard from './Components/Teacher/TeacherDashboard';
import StudentDashboard from './Components/Student/StudentDashboard';
import StudentAdd from './Components/Student/StudentAdd'; // Import StudentAdd
import SupervisorDashboard from './Components/Supervisor/SupervisorDashboard';
import GuestDashboard from './Components/Guest/GuestDashboard';
import PageNotFound from './Components/PageNotFound/PageNotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="loginadd" element={<LoginAdd />} />
          <Route path="loginmanager" element={<LoginManager />} />
          
          {/* Dashboard cho các vai trò */}
          <Route path="teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="student-dashboard" element={<StudentDashboard />} />
          <Route path="student-add" element={<StudentAdd />} /> 
          <Route path="supervisor-dashboard" element={<SupervisorDashboard />} />
          <Route path="guest-dashboard" element={<GuestDashboard />} />

          {/* Xử lý trang không tìm thấy */}
          <Route path="*" element={<PageNotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
