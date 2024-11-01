import React, { useState, useEffect } from "react";
import { Table, Spin, Button, message, Form, Input, Select } from "antd";
import axios from "axios";

const DepartmentDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/departments");
      setDepartments(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      message.error("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (values) => {
    try {
      if (isEditing) {
        await axios.put(`/api/departments/${formData.userId}`, values);
        message.success("Department updated successfully.");
      } else {
        await axios.post("/api/departments", values);
        message.success("Department added successfully.");
      }
      fetchDepartments();
      resetForm();
    } catch (error) {
      message.error(isEditing ? "Failed to update department." : "Failed to add department.");
    }
  };

  const handleEdit = (record) => {
    setFormData(record);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/departments/${id}`);
      message.success("Department deleted successfully.");
      fetchDepartments();
    } catch (error) {
      message.error("Failed to delete department.");
    }
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
  };

  const resetForm = () => {
    setFormData({});
    setIsEditing(false);
  };

  const columns = [
    { title: "Department ID", dataIndex: "userId", key: "userId" },
    { title: "Department Name", dataIndex: "username", key: "username" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button onClick={() => handleDelete(record.userId)} style={{ marginLeft: 8 }}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>Department List</h1>
      {loading ? (
        <Spin />
      ) : (
        <Table
          dataSource={departments}
          columns={columns}
          rowKey="userId"
          pagination={{
            current: currentPage,
            pageSize,
            onChange: handleTableChange,
          }}
        />
      )}
      <Form
        name="departmentForm"
        onFinish={handleFormSubmit}
        style={{ maxWidth: 600, marginTop: 16 }}
        initialValues={formData}
        onValuesChange={(changedValues, allValues) => setFormData(allValues)}
      >
        <Form.Item
          name="username"
          label="Department Name"
          rules={[{ required: true, message: "Please input the department name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: "email", required: true, message: "Please enter a valid email!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="role" label="Role">
          <Select>
            <Select.Option value="Student">Student</Select.Option>
            <Select.Option value="Marketing Manager">Marketing Manager</Select.Option>
            <Select.Option value="Marketing Coordinator">Marketing Coordinator</Select.Option>
            <Select.Option value="Administrator">Administrator</Select.Option>
            <Select.Option value="Guest">Guest</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {isEditing ? "Update" : "Add"}
          </Button>
          <Button onClick={resetForm} style={{ marginLeft: 8 }}>
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DepartmentDashboard;
