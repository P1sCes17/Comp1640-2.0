import React, { useEffect, useState } from "react";
import axios from "axios"; // Import Axios
import { firebaseConfig } from "../../../firebaseConfig"; // Import Firebase configuration
import { Table, Spin, Button, message, Form, Input, Select } from "antd"; 
import { useNavigate } from "react-router-dom"; // Import useNavigate for navigation
import { auth } from "../../../firebaseConfig"; 

const SupervisorDashboard = () => {
  const [supervisors, setSupervisors] = useState([]); // All supervisors from the database
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [pageSize] = useState(10); // Number of items per page
  const navigate = useNavigate(); // Hook to access navigate

  const fetchSupervisors = async () => {
    try {
      const response = await axios.get(`${firebaseConfig.databaseURL}/supervisors.json`);
      const data = response.data;

      if (data) {
        // Convert data to array of supervisors without slicing
        const supervisorList = Object.entries(data).map(([key, value]) => ({
          id: key,
          username: value.username,
          email: value.email,
          role: value.role,
          department: value.department,
          userId: generateRandomUserId(), // Generate random UserID
        }));
        
        setSupervisors(supervisorList); // Set the full list of supervisors
      } else {
        setSupervisors([]);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      message.error("Failed to load supervisors.");
    } finally {
      setLoading(false); 
    }
  };

  const generateRandomUserId = () => {
    return `UID-${Math.random().toString(36).substr(2, 9)}`; // Generate a random UserID
  };

  useEffect(() => {
    fetchSupervisors(); 
  }, []);

  const onFinish = async (values) => {
    console.log("Success:", values);
    // Clear form fields after submission
    setFormData(
      {
        "username": null,
        "email": null,
        "department": null,
        "role": null
    }
    );

    // Check if editing or adding new supervisor
    if (isEditing) {
      // Update supervisor logic
      try {
        await axios.put(`${firebaseConfig.databaseURL}/supervisors/${formData.id}.json`, values);
        message.success("Supervisor updated successfully.");
      } catch (error) {
        message.error("Failed to update supervisor.");
      }
    } else {
      // Add new supervisor logic
      try {
        await axios.post(`${firebaseConfig.databaseURL}/supervisors.json`, values);
        message.success("Supervisor added successfully.");
      } catch (error) {
        message.error("Failed to add supervisor.");
      }
    }
    fetchSupervisors(); // Refresh the list
    setIsEditing(false); // Reset editing state
  };

  const handleEdit = (record) => {
    setFormData(record);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${firebaseConfig.databaseURL}/supervisors/${id}.json`);
      message.success("Supervisor deleted successfully.");
      fetchSupervisors(); // Refresh the list
    } catch (error) {
      message.error("Failed to delete supervisor.");
    }
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current); // Update current page when table changes
  };

  const columns = [
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
    },
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
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button onClick={() => handleDelete(record.id)} style={{ marginLeft: '8px' }}>Delete</Button>
        </>
      ),
    },
  ];

  // Calculate current supervisors based on pagination
  const currentSupervisors = supervisors.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <h1>Supervisor List</h1>
      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <Table 
          dataSource={currentSupervisors} // Use current supervisors
          columns={columns} 
          rowKey="id" 
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: supervisors.length, // Total count of supervisors
            onChange: handleTableChange, // Handle page change
          }} 
        />
      )}
      <Form
        name="supervisorForm"
        onFinish={onFinish}
        style={{ maxWidth: 600, marginTop: '16px' }}
        initialValues={formData}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: "email", required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="department" label="Department">
          <Select >
            <Select.Option value="Computing">Computing</Select.Option>
            <Select.Option value="Business">Business</Select.Option>
            <Select.Option value="Event">Event</Select.Option>
            <Select.Option value="Design">Design</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item name="role" label="Role">
          <Select >
            <Select.Option value="Student">Student</Select.Option>
            <Select.Option value="Marketing Manager">Marketing Manager</Select.Option>
            <Select.Option value="Marketing Coordinator">Marketing Coordinator</Select.Option>
            <Select.Option value="Administrator">Administrator</Select.Option>
            <Select.Option value="Guest">Guest</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" onClick={() => setFormData({})}>
            {isEditing ? "Update" : "Add"}
          </Button>
          <Button type="default" onClick={() => {
            setFormData({});
            setIsEditing(false); // Reset editing state
          }} style={{ marginLeft: '8px' }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default SupervisorDashboard;
