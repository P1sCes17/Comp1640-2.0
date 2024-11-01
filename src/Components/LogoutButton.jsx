import React from "react";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import "../assets/style/Pages/LogoutButton.scss";

function LogoutButton({ collapsed }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("userId"); // Xóa dữ liệu đăng nhập
    navigate("/login"); // Điều hướng đến trang đăng nhập
  };

  return (
    <Button
      className={`logout-button ${collapsed ? "collapsed" : ""}`}
      type="text"
      icon={<LogoutOutlined />}
      onClick={handleLogout}
    >
      {!collapsed && "Log Out"}
    </Button>
  );
}

LogoutButton.propTypes = {
  collapsed: PropTypes.bool.isRequired,
};

export default LogoutButton;
