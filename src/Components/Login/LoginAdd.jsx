import React, { useState } from "react";
import { Button, Form, Input, Typography, message, Select, Spin } from "antd";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig"; 
import { useNavigate } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; 

const { Title } = Typography;

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 6 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 14 },
  },
};

const LoginAdd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const auth = getAuth(); 

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      
      const userUID = userCredential.user.uid;

      
      await axios.post(`${firebaseConfig.databaseURL}/account.json`, {
        ...values,
        userId: userUID 
      });

      message.success("User added successfully!");
      form.resetFields();
      navigate("/LoginManager");
    } catch (error) {
      console.error("Error adding user: ", error);
      message.error("Failed to add user.");
    } finally {
      setLoading(false);
    }
  };

  const handleFailure = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Spin
      spinning={loading}
      tip="Submitting..."
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Form
        {...formItemLayout}
        form={form}
        onFinish={handleSubmit}
        onFinishFailed={handleFailure}
      >
        <Title level={3} style={{ textAlign: "center" }}>
          Add New User
        </Title>
        <Form.Item
          label="Username"
          name="username"
          rules={[
            {
              required: true,
              message: "Please input the Username!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            {
              required: true,
              type: "email",
              message: "Please input a valid email!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[
            {
              required: true,
              message: "Please input the Password!",
            },
          ]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item
          label="Role"
          name="role"
          rules={[
            {
              required: true,
              message: "Please select the Role!",
            },
          ]}
        >
          <Select placeholder="Select a Role">
            <Select.Option value="admin">Admin</Select.Option>
            <Select.Option value="user">User</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item
          label="Department"
          name="department"
          rules={[
            {
              required: true,
              message: "Please input the Department!",
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
          <Button
            type="primary"
            style={{ marginLeft: 8 }}
            onClick={() => navigate("/LoginManager")}
          >
            Back to User List
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default LoginAdd;
