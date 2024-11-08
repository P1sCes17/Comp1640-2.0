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
    setLoading(true);
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
        const username = user.username;

        // Lưu thông tin người dùng vào localStorage
        localStorage.setItem("user", JSON.stringify({
          email: values.email,
          role: user.role,
          department: user.department,
          userId: user.userId // Lưu userId vào đây
        }));

        console.log("User data saved:", {
          email: values.email,
          role: user.role,
          department: user.department,
          userId: user.userId // Log thông tin người dùng
        });
        console.log("- Role User: "+user.role);
        
        message.success(`Successfully logged in to your account: ${username}!`);

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
        }, 500);
      } else {
        message.error("User not found. Please check your email.");
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error.response && error.response.data.error) {
        message.error(error.response.data.error.message);
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
    <div className="login-background">
      <Spin spinning={loading} size="large">
        <div className="login-container">
          <Form onFinish={handleSubmit} onFinishFailed={handleFailure} style={{ width: "100%" }}>
            <Title level={3} style={{ textAlign: "center", color: "#003060" }}>
              Login
            </Title>
            <Form.Item
              name="email"
              rules={[{ required: true, type: "email", message: "Please input a valid email!" }]}
            >
              <Input placeholder="E-mail" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: "Please input your password!" }]}
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
      </Spin>
    </div>
  );
};

export default Login;
