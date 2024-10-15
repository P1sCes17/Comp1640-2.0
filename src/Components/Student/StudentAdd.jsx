import React from "react";
import { storage } from "../../../firebaseConfig"; 
import { Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig"; 
import { useLocation } from "react-router-dom"; // Import useLocation

const StudentAdd = () => {
  const location = useLocation(); // Nhận location từ react-router
  const { folder } = location.state || {}; // Lấy folder từ props

  // Lấy userId từ localStorage
  const userId = localStorage.getItem('userID'); 
  console.log("User ID from localStorage:", userId); // Kiểm tra giá trị của userId

  // Kiểm tra nếu folder hoặc userId không hợp lệ
  if (!folder || !userId) {
    return <div>No folder or user ID available.</div>; // Thông báo nếu không có folder hoặc userId
  }

  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    console.log("Submit button clicked", values); // Kiểm tra sự kiện nhấn nút

    const { files } = values;
    if (files && files.length > 0) {
      const submissionData = {
        user_id: userId, 
        folder_id: folder.folder_id, // Sử dụng folder.folder_id
        title: values.title,
        submission_date: new Date().toISOString(),
        fileUrls: [], // Khai báo để lưu URL của file
      };

      try {
        // Upload từng file và lưu URL vào submissionData
        for (const file of files) { 
          const storageRef = ref(storage, `submissions/${file.name}`);
          await uploadBytes(storageRef, file.originFileObj);

          const fileUrl = await getDownloadURL(storageRef);
          submissionData.fileUrls.push(fileUrl); // Thêm URL vào mảng
        }

        // Gửi submissionData đến Firebase Database
        const response = await axios.post(`${firebaseConfig.databaseURL}/submissions.json`, submissionData);
        if (response.status === 200) {
          message.success("Submission successful!");
          form.resetFields();
        } else {
          throw new Error(`Failed to submit: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error submitting files: ", error);
        message.error(`Failed to submit files: ${error.message || error}`); // Hiển thị thông báo lỗi chi tiết
      }
    } else {
      message.warning("Please upload at least one file.");
    }
  };

  return (
    <div>
      <h1>Submit to {folder.folder_name}</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={(errorInfo) => {
          console.log("Failed:", errorInfo);
        }}
      >
        <Form.Item
          name="title"
          label="Submission Title"
          rules={[{ required: true, message: 'Please input submission title!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="files"
          label="Upload Files"
          valuePropName="fileList"
          getValueFromEvent={event => Array.isArray(event) ? event : event?.fileList}
          rules={[{ required: true, message: 'Please upload at least one file!' }]}
        >
          <Upload 
            beforeUpload={() => false} 
            multiple
            accept=".doc,.docx,.png,.jpg,.jpeg"
          >
            <Button icon={<UploadOutlined />}>Select Files</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default StudentAdd;
