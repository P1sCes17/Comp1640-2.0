import { Outlet } from "react-router-dom";
import Sidebar from './Components/SidebarLeft'; // Đảm bảo đường dẫn đúng
import './App.css'; // Đảm bảo rằng bạn đã liên kết với file CSS

const Layout = () => {
    // Lấy thông tin người dùng từ localStorage
    const userData = JSON.parse(localStorage.getItem("user"));
    const userRole = userData ? userData.role : "guest"; // Nếu không có user, mặc định là "guest" hoặc giá trị mặc định khác

    return (
        <div className="layout-container"> {/* Sử dụng class layout-container để bố trí flexbox */}
            <Sidebar role={userRole} /> {/* Truyền role vào Sidebar */}
            <div className="main-content"> {/* Đây là phần nội dung chính */}
                <Outlet /> {/* Render các thành phần khác ở đây */}
            </div>
        </div>
    )
};

export default Layout;
