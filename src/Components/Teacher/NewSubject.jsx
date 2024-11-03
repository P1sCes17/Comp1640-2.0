import React, { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Select, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { TextArea } = Input;
const { Option } = Select;

const NewSubject = () => {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lấy danh sách departments từ Firebase và chỉ lấy phần `username`
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          "https://comp1640-448f0-default-rtdb.asia-southeast1.firebasedatabase.app/departments.json"
        );
        const departmentsData = response.data
          ? Object.keys(response.data).map((key) => ({
              id: key,
              name: response.data[key].username, // Lấy giá trị `username`
            }))
          : [];
        setDepartments(departmentsData);
      } catch (error) {
        message.error("Failed to load departments.");
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Xử lý khi gửi form
  const onFinish = (values) => {
    const subjectData = {
      ...values,
      deadline: values.deadline ? values.deadline.toISOString() : null,
      createdAt: new Date().toISOString(),
    };
    message.success("Subject added successfully!");
    navigate("/subject"); // Điều hướng về trang danh sách môn học
  };

  return (
    <div style={{ padding: "24px 0", background: "#fff", maxWidth: "1000px", margin: "auto" }}>
      <h2>Add New Subject</h2>
      <Form form={form} onFinish={onFinish}>
        <Form.Item
          label="Name Subject"
          name="name"
          rules={[{ required: true, message: "Please input the subject name!" }]}
        >
          <Input placeholder="Enter subject name" />
        </Form.Item>

        {/* Chọn Department từ Firebase */}
        <Form.Item
          label="Department"
          name="department"
          rules={[{ required: true, message: "Please select a department!" }]}
        >
          <Select placeholder="Select a department" loading={loading}>
            {departments.map((department) => (
              <Option key={department.id} value={department.name}>
                {department.name} {/* Hiển thị `username` */}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Deadline" name="deadline">
          <DatePicker showTime placeholder="Select deadline" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add Subject
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default NewSubject;
