// Layout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from './Components/SidebarLeft'; // Đảm bảo đường dẫn đúng
import './App.css'; // Đảm bảo rằng bạn đã liên kết với file CSS

const Layout = () => {
    return (
        <div className="layout-container"> {/* Sử dụng class layout-container để bố trí flexbox */}
            <Sidebar role="admin" /> {/* Thêm Sidebar ở đây */}
            <div className="main-content"> {/* Đây là phần nội dung chính */}
                <Outlet /> {/* Render các thành phần khác ở đây */}
            </div>
        </div>
    )
};

export default Layout;
