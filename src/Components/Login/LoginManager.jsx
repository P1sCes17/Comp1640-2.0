import React, { useEffect, useState } from "react";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig";
import { Table, Spin, Button, message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import "../../assets/style/Pages/LoginManager.scss";

const LoginManager = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập
    const userFromStorage = localStorage.getItem("user");
    if (!userFromStorage) {
      // Nếu không có người dùng đăng nhập, điều hướng đến trang đăng nhập
      navigate("/login");
    } else {
      setCurrentUser(JSON.parse(userFromStorage));
      fetchData();
      fetchDepartments();
    }
  }, [navigate]);

  const fetchData = async () => {
    try {
      const usersResponse = await axios.get(`${firebaseConfig.databaseURL}/account.json`);
      const usersData = usersResponse.data;
      if (usersData) {
        const userList = Object.entries(usersData).map(([key, value]) => ({
          id: key,
          username: value.username,
          email: value.email,
          role: value.role,
          department: value.department,
        }));
        setUsers(userList);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      message.error("Failed to load data.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${firebaseConfig.databaseURL}/departments.json`);
      const departmentsData = response.data;
      if (departmentsData) {
        const departmentList = Object.entries(departmentsData).map(([key, value]) => ({
          id: key,
          name: value.departmentName,
        }));
        setDepartments(departmentList);
      } else {
        setDepartments([]);
      }
    } catch (error) {
      console.error("Error fetching departments: ", error);
      message.error("Failed to load departments.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user"); // Xóa thông tin người dùng khỏi localStorage
    localStorage.removeItem("userID"); // Xóa userId khỏi localStorage nếu cần
    navigate("/login");
  };

  const handleAddAccount = () => {
    navigate("/loginadd");
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this account?",
      content: "This action cannot be undone.",
      okText: "Yes, delete",
      okType: "danger",
      cancelText: "No, cancel",
      onOk: async () => {
        try {
          await axios.delete(`${firebaseConfig.databaseURL}/account/${id}.json`);
          message.success("Account deleted successfully.");
          setUsers(users.filter((user) => user.id !== id));
        } catch (error) {
          console.error("Error deleting account:", error);
          message.error("Failed to delete account.");
        }
      },
    });
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
      render: (departmentId) => {
        const department = departments.find(dept => dept.id === departmentId);
        return department ? department.name : 'Unknown Department';
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <Button type="primary" danger onClick={() => handleDelete(record.id)}>
          Delete
        </Button>
      ),
    },
  ];

  return (
    <div className="login-manager-container">
      <div className="login-manager-buttons">
        <Button type="primary" onClick={handleLogout}>
          Logout
        </Button>
        <Button type="primary" onClick={handleAddAccount}>
          Add Account
        </Button>
      </div>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table dataSource={users} columns={columns} rowKey="id" />
      )}
    </div>
  );
};

export default LoginManager;
