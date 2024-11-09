import React, { useEffect, useState } from "react";
import { Layout, Menu } from "antd";
import {
  UserOutlined,
  TeamOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { NavLink, useLocation } from "react-router-dom";
import "../assets/style/Pages/SidebarLeft.scss";
import LogoutButton from "./LogoutButton";
import logoSidebar from "../assets/images/logo-sidebar.jpeg";

const { Sider } = Layout;

const SidebarLeft = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [username, setUsername] = useState("");
  const location = useLocation();

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const adminMenuItems = [
    { key: "1", icon: <UserOutlined />, label: <NavLink to="/loginmanager">Manage Accounts</NavLink> },
    { key: "2", icon: <TeamOutlined />, label: <NavLink to="/department-dashboard">Department</NavLink> },
    { key: "3", icon: <TeamOutlined />, label: <NavLink to="/supervisor-dashboard">Supervisor</NavLink> },
    { key: "4", icon: <TeamOutlined />, label: <NavLink to="/student-dashboard">Teacher</NavLink> },
    { key: "5", icon: <ToolOutlined />, label: <NavLink to="/subject">Subject</NavLink> },
    { key: "6", icon: <ToolOutlined />, label: <NavLink to="/student-dashboard">Student</NavLink> },
    { key: "7", icon: <ToolOutlined />, label: <NavLink to="/guestmanager">Guest</NavLink> },
    { key: "8", label: <LogoutButton collapsed={collapsed} /> },
  ];

  const teacherMenuItems = [
    { key: "5", icon: <ToolOutlined />, label: <NavLink to="/subject">Subject</NavLink> },
    { key: "4", icon: <TeamOutlined />, label: <NavLink to="/student-dashboard">Teacher</NavLink> },
    { key: "8", label: <LogoutButton collapsed={collapsed} /> },
  ];

  const studentMenuItems = [
    { key: "6", icon: <ToolOutlined />, label: <NavLink to="/student-dashboard">Student</NavLink> },
    { key: "8", label: <LogoutButton collapsed={collapsed} /> },
  ];

  const supervisorMenuItems = [
    { key: "3", icon: <TeamOutlined />, label: <NavLink to="/supervisor-dashboard">Supervisor</NavLink> },
    { key: "8", label: <LogoutButton collapsed={collapsed} /> },
  ];

  const guestMenuItems = [
    { key: "8", label: <LogoutButton collapsed={collapsed} /> },
  ];

  const getMenuItems = () => {
    switch (role) {
      case "admin":
        return adminMenuItems;
      case "teacher":
        return teacherMenuItems;
      case "student":
        return studentMenuItems;
      case "supervisor":
        return supervisorMenuItems;
      case "guest":
        return guestMenuItems;  
      default:
        return [];
    }
  };

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
            <h2 className="sidebar-title">Greenwich</h2>
            <div className="account-info">
              <span>{username}</span>
            </div>
          </>
        )}
      </div>
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["1"]}
        items={getMenuItems()}
      />
    </Sider>
  );
};

export default SidebarLeft;
