import React, { useEffect, useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  UserOutlined,
  ProjectOutlined,
  TeamOutlined,
  ToolOutlined,
  CodeOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { NavLink, useLocation } from "react-router-dom";
import "../assets/style/Pages/SidebarLeft.scss";
import LogoutButton from "./LogoutButton";

// Import logo
import logoSidebar from "../assets/images/logo-sidebar.jpeg";

const { Sider } = Layout;

const SidebarLeft = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState(""); // State để lưu tên tài khoản
  const location = useLocation(); // Hook để lấy thông tin vị trí hiện tại

  const adminMenuItems = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: <NavLink to="/loginmanager">Manage Accounts</NavLink>,
      children: [
        { key: "1-1", label: <NavLink to="/LoginManager">Account Info</NavLink> },
        { key: "1-2", label: <NavLink to="/change-password">Change Password</NavLink> },
      ],
    },
    {
      key: "2",
      icon: <TeamOutlined />,
      label: <NavLink to="/department-dashboard">Department</NavLink>,
    },
    {
      key: "3",
      icon: <ProjectOutlined />,
      label: <NavLink to="/project-management">Project Management</NavLink>,
      children: [
        { key: "3-1", label: <NavLink to="/new-project">New Project</NavLink> },
        { key: "3-2", label: <NavLink to="/project-tracking">Project Tracking</NavLink> },
      ],
    },
    {
      key: "4",
      icon: <TeamOutlined />,
      label: <NavLink to="/supervisor-dashboard">Supervisor</NavLink>,
    },
    {
      key: "5",
      icon: <ToolOutlined />,
      label: <NavLink to="/teacher-dashboard">Teacher</NavLink>,
      children: [
        { key: "5-1", label: <NavLink to="/subject">Subject </NavLink> },
        { key: "5-2", label: <NavLink to="/new-subject">New Subject </NavLink> },
      ],
    },
    { key: "6", icon: <CodeOutlined />, label: <NavLink to="/student-dashboard">Student</NavLink> },
    { key: "8", label: <LogoutButton collapsed={collapsed} /> },
  ];

  // Lấy tên tài khoản từ localStorage khi component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  // Lắng nghe thay đổi vị trí và làm mới
  useEffect(() => {
    // Có thể thêm logic ở đây nếu bạn muốn thực hiện điều gì đó khi vị trí thay đổi
  }, [location]);

  return (
    <Sider
      className="Sidebar"
      collapsible
      collapsed={collapsed}
      onCollapse={(collapsed) => setCollapsed(collapsed)}
      width={229}
    >
      <div className="sidebar-header">
        <img src={logoSidebar} alt="Get IT" className="logo-sidebar" />
        {!collapsed && (
          <>
            <h2 className="sidebar-title">GETIT COMPANY</h2>
            <div className="account-info">
              <span>Welcome, {username}</span>
            </div>
          </>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={role === "admin" ? adminMenuItems : employeeMenuItems}
      />
    </Sider>
  );
};

export default SidebarLeft;
