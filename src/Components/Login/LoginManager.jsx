import React, { useEffect, useState } from "react";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig";
import { Table, Spin, Button, message, Modal } from "antd";
import { useNavigate } from "react-router-dom";
import { auth } from "../../../firebaseConfig";
import "../../assets/style/Pages/LoginManager.scss";

const LoginManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const response = await axios.get(`${firebaseConfig.databaseURL}/account.json`);
      const data = response.data;

      if (data) {
        const userList = Object.entries(data).map(([key, value]) => ({
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
      message.error("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        console.log("User signed out");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
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
          setUsers(users.filter((user) => user.id !== id)); // Update the local state
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
      <h1 className="login-manager-header">Account List</h1>
      <div className="login-manager-buttons">
        <Button type="primary" onClick={handleLogout}>
          Logout
        </Button>
        <Button type="primary" onClick={handleAddAccount}>
          Add Account
        </Button>
      </div>
      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <Table 
          dataSource={users} 
          columns={columns} 
          rowKey="id"
          pagination={false}
        />
      )}
    </div>
  );
};

export default LoginManager;
