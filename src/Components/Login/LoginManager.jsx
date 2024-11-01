import React, { useEffect, useState } from "react";
import axios from "axios"; 
import { firebaseConfig } from "../../../firebaseConfig"; 
import { Table, Spin, Button, message } from "antd"; 
import { useNavigate } from "react-router-dom"; 
import { auth } from "../../../firebaseConfig"; 

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
  ];

  return (
    <div>
      <h1>Account List</h1>
      <Button type="primary" onClick={handleLogout} style={{ marginBottom: '16px', marginRight: '8px' }}>
        Logout
      </Button>
      <Button type="primary" onClick={handleAddAccount} style={{ marginBottom: '16px' }}>
        Add Account
      </Button>
      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <Table 
          dataSource={users} 
          columns={columns} 
          rowKey="id" 
        />
      )}
    </div>
  );
};

export default LoginManager;
