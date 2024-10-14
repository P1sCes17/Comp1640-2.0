import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import {
  UserOutlined,
  ProjectOutlined,
  TeamOutlined,
  ToolOutlined,
  CodeOutlined,
  FileTextOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from "@ant-design/icons";
import { NavLink } from "react-router-dom";
import "../assets/style/Pages/SidebarLeft.scss";
import LogoutButton from "./LogoutButton";


const { Sider } = Layout;

const SidebarLeft = ({ role }) => {
  const [collapsed, setCollapsed] = useState(false);

  const adminMenuItems = [
    {
      key: "1",
      icon: <UserOutlined />,
      label: <NavLink to="/account-management">Manage Accounts</NavLink>,
      children: [
        {
          key: "1-1",
          label: <NavLink to="/LoginManager">Account Info</NavLink>,
        },
        {
          key: "1-2",
          label: <NavLink to="/change-password">Change Password</NavLink>,
        },
      ],
    },
    {
      key: "2",
      icon: <TeamOutlined />,
      label: <NavLink to="/employee-management">Employee Management</NavLink>,
    },
    {
      key: "3",
      icon: <ProjectOutlined />,
      label: <NavLink to="/project-management">Project Management</NavLink>,
      children: [
        {
          key: "3-1",
          label: <NavLink to="/new-project">New Project</NavLink>,
        },
        {
          key: "3-2",
          label: <NavLink to="/project-tracking">Project Tracking</NavLink>,
        },
      ],
    },
    {
      key: "4",
      icon: <TeamOutlined />,
      label: <NavLink to="/supervisor-dashboard">Supervisor</NavLink>, // Cập nhật đường dẫn
    },
    {
      key: "5",
      icon: <ToolOutlined />,
      label: <NavLink to="/teacher-dashboard">Teacher</NavLink>, // Cập nhật đường dẫn
    },
    {
      key: "6",
      icon: <CodeOutlined />,
      label: <NavLink to="/student-dashboard">Student</NavLink>, // Cập nhật đường dẫn
    },
    {
      key: "8",
      label: <LogoutButton collapsed={collapsed} />,
    },
  ];
  
 

  return (
    <Sider
      className="Sidebar"
      collapsible
      collapsed={collapsed}
      onCollapse={(collapsed) => setCollapsed(collapsed)}
      width={229}
    >
      <div className="sidebar-header">
        <img
          src="/public/images/logo.jpg"
          alt="Get IT"
          className="logo-sidebar"
        />
        {!collapsed && <h2 className="sidebar-title">GETIT COMPANY</h2>}
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
