import React, { useState, useEffect } from "react";
import { Table, Spin, Button, message, Form, Input, Select } from "antd";
import axios from "axios";

const DepartmentDashboard = () => {
  const [departments, setDepartments] = useState([]); // Cập nhật tên biến thành departments
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const fetchDepartments = async () => { // Cập nhật tên hàm
    setLoading(true);
    try {
      const response = await axios.get('/api/departments'); // Thay thế với URL API đúng
      console.log(response.data); // Ghi lại phản hồi API để kiểm tra cấu trúc dữ liệu
      setDepartments(Array.isArray(response.data) ? response.data : []); // Đảm bảo departments là mảng
    } catch (error) {
      message.error("Failed to load departments."); // Cập nhật thông điệp
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments(); // Gọi hàm fetchDepartments
  }, []);

  const onFinish = async (values) => {
    if (isEditing) {
      try {
        await axios.put(`/api/departments/${formData.userId}`, values); // Cập nhật URL
        message.success("Department updated successfully."); // Cập nhật thông điệp
      } catch (error) {
        message.error("Failed to update department."); // Cập nhật thông điệp
      }
    } else {
      try {
        await axios.post('/api/departments', values); // Cập nhật URL
        message.success("Department added successfully."); // Cập nhật thông điệp
      } catch (error) {
        message.error("Failed to add department."); // Cập nhật thông điệp
      }
    }
    fetchDepartments(); // Tải lại danh sách departments
    setIsEditing(false);
    setFormData({});
  };

  const handleEdit = (record) => {
    setFormData(record);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/api/departments/${id}`); // Cập nhật URL
      message.success("Department deleted successfully."); // Cập nhật thông điệp
      fetchDepartments(); // Tải lại danh sách departments
    } catch (error) {
      message.error("Failed to delete department."); // Cập nhật thông điệp
    }
  };

  const handleTableChange = (pagination) => {
    setCurrentPage(pagination.current);
  };

  const columns = [
    { title: 'Department ID', dataIndex: 'userId', key: 'userId' }, // Cập nhật tiêu đề
    { title: 'Department Name', dataIndex: 'username', key: 'username' }, // Cập nhật tiêu đề
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Role', dataIndex: 'role', key: 'role' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button onClick={() => handleEdit(record)}>Edit</Button>
          <Button onClick={() => handleDelete(record.userId)} style={{ marginLeft: '8px' }}>Delete</Button>
        </>
      ),
    },
  ];

  const currentDepartments = departments.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div>
      <h1>Department List</h1> {/* Cập nhật tiêu đề trang */}
      {loading  (
        <Table>
        dataSource={currentDepartments}
        columns={columns}
        rowKey="userId"
        pagination={{
          current: currentPage,
          pageSize: 10,
          }}</Table>
      )}
      <Form
        name="departmentForm" // Cập nhật tên form
        onFinish={onFinish}
        style={{ maxWidth: 600, marginTop: '16px' }}
        initialValues={formData}
      >
        <Form.Item
          name="username"
          label="Department Name" // Cập nhật nhãn
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
        <Form.Item name="role" label="Role"> {/* Cập nhật nhãn */}
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
            {isEditing ? "Update" : "Add"} {/* Cập nhật thông điệp */}
          </Button>
          <Button
            type="default"
            onClick={() => {
              setFormData({});
              setIsEditing(false);
            }}
            style={{ marginLeft: '8px' }}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DepartmentDashboard;
