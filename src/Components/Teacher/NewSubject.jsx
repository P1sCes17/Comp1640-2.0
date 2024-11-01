import React, { useState, useEffect } from "react";
import { Button, Form, Input, DatePicker, Select, message } from "antd";
import { useNavigate } from "react-router-dom";
import { createSubject } from "../../service/Subject";
import { database } from "../../../firebaseConfig"; // Import cấu hình Firebase của bạn
import { ref, get } from "firebase/database"; // Import các hàm từ Firebase

const { TextArea } = Input;
const { Option } = Select;

const NewSubject = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]); // State để lưu trữ danh sách departments

  // Lấy danh sách departments từ Firebase
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const departmentsRef = ref(database, "departments");
        const snapshot = await get(departmentsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          const departmentList = Object.keys(data).map((key) => ({
            id: key,
            name: data[key].name || "Unnamed Department",
          }));
          setDepartments(departmentList);
        }
      } catch (error) {
        console.error("Error fetching departments:", error);
        message.error("Failed to load departments.");
      }
    };
    fetchDepartments();
  }, []);

  // Hàm xử lý khi ấn "Submit"
  const onFinish = async (values) => {
    try {
      const subjectData = {
        ...values,
        deadline: values.deadline ? values.deadline.toISOString() : null, // Chuyển đổi deadline thành chuỗi ISO
        createdAt: new Date().toISOString(), // Ngày tạo
      };

      const result = await createSubject(subjectData);

      if (result.success) {
        message.success("Subject added successfully!");
        navigate("/subject"); // Điều hướng về trang quản lý môn học
      } else {
        message.error("Failed to add subject");
      }
    } catch (error) {
      console.error("Error creating subject:", error);
      message.error("An error occurred while creating the subject.");
    }
  };

  return (
    <div style={{ padding: "24px 0", background: "#fff", maxWidth: "1000px", margin: "auto" }}>
      <h2>Add New Subject</h2>
      <Form form={form} onFinish={onFinish}>
        <Form.Item label="Name Subject" name="name" rules={[{ required: true, message: "Please input the subject name!" }]}>
          <Input placeholder="Enter subject name" />
        </Form.Item>

        {/* Dropdown chọn Department */}
        <Form.Item label="Department" name="department" rules={[{ required: true, message: "Please select the department!" }]}>
          <Select placeholder="Select department">
            {departments.map((dept) => (
              <Option key={dept.id} value={dept.name}>
                {dept.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Thêm trường Deadline */}
        <Form.Item label="Deadline" name="deadline" rules={[{ required: true, message: "Please select the deadline!" }]}>
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
