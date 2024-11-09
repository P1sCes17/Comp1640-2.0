import React, { useState, useEffect } from "react";
import { Form, Input, Button, DatePicker, Select, message } from "antd";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { database } from "../../../firebaseConfig"; // Import cấu hình Firebase
import { ref, push, set } from "firebase/database"; // Import các hàm từ Firebase

const { Option } = Select;

const NewSubject = () => {
  const [form] = Form.useForm();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Lấy danh sách departments từ Firebase
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await axios.get(
          "https://comp1640-448f0-default-rtdb.asia-southeast1.firebasedatabase.app/departments.json"
        );
        const departmentsData = response.data
          ? Object.keys(response.data).map((key) => ({
              id: key,
              name: response.data[key].departmentName, // Lấy `departmentName` làm tên department
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

  // Hàm tạo subject trong Firebase
  const createSubject = async (subjectData) => {
    try {
      const newSubjectRef = push(ref(database, "subjects")); // Tạo mục mới trong nhánh "subjects"
      await set(newSubjectRef, subjectData);
      return { success: true };
    } catch (error) {
      console.error("Error creating subject:", error);
      return { success: false };
    }
  };

  // Xử lý khi gửi form
  const onFinish = async (values) => {
    const selectedDepartment = departments.find(department => department.id === values.department);
    
    const subjectData = {
      ...values,
      departmentName: selectedDepartment ? selectedDepartment.name : "Unknown Department", // Gán tên khoa thay vì ID
      deadline: values.deadline ? values.deadline.toISOString() : null,
      createdAt: new Date().toISOString(),
    };

    const result = await createSubject(subjectData);

    if (result.success) {
      message.success("Subject added successfully!");
      navigate("/subject"); // Điều hướng đến trang danh sách môn học
    } else {
      message.error("Failed to add subject to Firebase.");
    }
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
              <Option key={department.id} value={department.id}>
                {department.name}
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
