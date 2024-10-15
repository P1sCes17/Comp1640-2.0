import React, { useState } from "react";
import { Button, Form, Input, Typography, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Import Axios
import { firebaseConfig } from "../../../firebaseConfig"; // Import Firebase configuration

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

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Đăng nhập vào Firebase
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
        {
          email: values.email,
          password: values.password,
          returnSecureToken: true,
        }
      );

      // Kiểm tra người dùng tồn tại
      const userRoleResponse = await axios.get(`${firebaseConfig.databaseURL}/account.json`);
      const userRoles = userRoleResponse.data;

      const user = Object.values(userRoles).find(user => user.email === values.email);

      if (user) {
        message.success("Login successful!");

        // Lưu trữ token và userID vào localStorage
        localStorage.setItem('token', response.data.idToken); // Lưu token vào localStorage
        localStorage.setItem('userID', user.user_id); // Lưu userID vào localStorage

        // Điều hướng dựa trên vai trò người dùng
        switch (user.role) {
          case 'admin':
            navigate("/loginmanager"); // Redirect to LoginManager page
            break;
          case 'teacher':
            navigate("/teacher-dashboard"); // Redirect to Teacher dashboard
            break;
          case 'student':
            navigate("/student-dashboard"); // Redirect to Student dashboard
            break;
          case 'supervisor':
            navigate("/supervisor-dashboard"); // Redirect to Supervisor dashboard
            break;
          case 'guest':
            navigate("/guest-dashboard"); // Redirect to Guest dashboard
            break;
          default:
            navigate("/user-dashboard"); // Redirect to a default user dashboard
        }
      } else {
        message.error("User not found. Please check your email.");
      }

      console.log("Logged in user:", response.data);
    } catch (error) {
      console.error("Login error:", error);

      // Kiểm tra thông báo lỗi từ Firebase
      if (error.response && error.response.data.error) {
        message.error(error.response.data.error.message); // Hiển thị thông báo lỗi từ Firebase
      } else {
        message.error("Login failed. Please check your email and password.");
      }
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
      tip="Logging in..."
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Form
        {...formItemLayout}
        onFinish={handleSubmit}
        onFinishFailed={handleFailure}
      >
        <Title level={3} style={{ textAlign: "center" }}>
          Login
        </Title>
        <Form.Item
          label="Email"
          name="email"
          rules={[{ required: true, type: "email", message: "Please input a valid email!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item wrapperCol={{ offset: 6, span: 16 }}>
          <Button type="primary" htmlType="submit">
            Login
          </Button>
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default Login;
