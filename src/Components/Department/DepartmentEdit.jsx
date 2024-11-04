import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const DepartmentEdit = () => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchDepartment = async () => {
      try {
        const response = await axios.get(`https://comp1640-448f0-default-rtdb.asia-southeast1.firebasedatabase.app/departments/${id}.json`);
        form.setFieldsValue(response.data); // Thiết lập giá trị cho form
      } catch (error) {
        message.error("Failed to load department data.");
      }
    };
    fetchDepartment();
  }, [id, form]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.put(`https://comp1640-448f0-default-rtdb.asia-southeast1.firebasedatabase.app/departments/${id}.json`, values);
      message.success("Department updated successfully.");
      navigate("/department-dashboard");
    } catch (error) {
      message.error("Failed to update department.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Edit Department</h1>
      <Form
        form={form}
        name="departmentEditForm"
        onFinish={onFinish}
        style={{ maxWidth: 600, marginTop: '16px' }}
      >
        <Form.Item
          name="departmentName" // Chỉ giữ lại trường tên phòng ban
          label="Department Name"
          rules={[{ required: true, message: 'Please enter the department name.' }]} // Quy tắc yêu cầu
        >
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Department
          </Button>
          <Button
            type="default"
            onClick={() => navigate("/department-dashboard")}
            style={{ marginLeft: '8px' }}
          >
            Cancel
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default DepartmentEdit;
