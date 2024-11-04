import React, { useState } from "react";
import { Button, Form, Input, Typography, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig";
import "../../../src/assets/style/Login/Login.scss"; // Import CSS file

const { Title } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true); // Bật trạng thái loading khi bắt đầu quá trình đăng nhập
    try {
      const response = await axios.post(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${firebaseConfig.apiKey}`,
        {
          email: values.email,
          password: values.password,
          returnSecureToken: true,
        }
      );

      const userRoleResponse = await axios.get(`${firebaseConfig.databaseURL}/account.json`);
      const userRoles = userRoleResponse.data;
      const user = Object.values(userRoles).find((user) => user.email === values.email);

      if (user) {
        message.success("Login successful!");
        setTimeout(() => {
          switch (user.role) {
            case "admin":
              navigate("/loginmanager");
              break;
            case "teacher":
              navigate("/teacher-dashboard");
              break;
            case "student":
              navigate("/student-dashboard");
              break;
            case "supervisor":
              navigate("/supervisor-dashboard");
              break;
            case "guest":
              navigate("/guest-dashboard");
              break;
            default:
              navigate("/user-dashboard");
          }
        }, 500); // Chờ một chút trước khi chuyển hướng để duy trì trạng thái loading
      } else {
        message.error("User not found. Please check your email.");
      }
    } catch (error) {
      console.error("Login error:", error);

      // Kiểm tra thông báo lỗi từ Firebase
      if (error.response && error.response.data.error) {
        message.error(error.response.data.error.message); // Hiển thị thông báo lỗi từ Firebase
      } else {
        message.error("Login failed. Please check your email and password.");
      }
    } finally {
      setLoading(false); // Tắt trạng thái loading nếu có lỗi xảy ra
    }
  };

  const handleFailure = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  return (
    <Spin spinning={loading} tip="Logging in..." size="large">
      <div className="login-background">
        <div className="login-container">
          <Form onFinish={handleSubmit} onFinishFailed={handleFailure} style={{ width: "100%" }}>
            <Title level={3} style={{ textAlign: "center", color: "#003060" }}>
              Login
            </Title>
            <Form.Item
              name="email"
              rules={[
                {
                  required: true,
                  type: "email",
                  message: "Please input a valid email!",
                },
              ]}
            >
              <Input placeholder="E-mail" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" block>
                Sign In
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </Spin>
  );
};

export default Login;
