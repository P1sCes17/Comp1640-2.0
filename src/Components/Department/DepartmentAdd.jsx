import React, { useState } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import axios from "axios";

const DepartmentAdd = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Khởi tạo navigate

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Gửi yêu cầu POST để thêm department mới
      await axios.post('https://comp1640-448f0-default-rtdb.asia-southeast1.firebasedatabase.app/departments.json', values);
      message.success("Department added successfully.");
      navigate("/department-dashboard", { state: { refresh: true } });
    } catch (error) {
      message.error("Failed to add department. Please try again.");
    } finally {
      setLoading(false);
    }
  }; 

  return (
    <div>
      <h1>Add Department</h1>
      <Form
        name="departmentForm"
        onFinish={onFinish}
        style={{ maxWidth: 600, marginTop: '16px' }}
      >
        <Form.Item
          name="username"
          label="Department Name"
          rules={[{ required: true, message: 'Please input the department name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[{ type: "email", required: true, message: 'Please input a valid email!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item name="role" label="Role">
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Department
          </Button>
          <Button
            type="default"
            onClick={() => navigate("/department-dashboard")}
            style={{ marginLeft: '8px' }}
          >
            Back to Dashboard
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DepartmentAdd;
