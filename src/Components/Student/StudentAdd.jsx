import React, { useState } from "react";
import { storage } from "../../../firebaseConfig"; 
import { Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig"; 
import { useLocation } from "react-router-dom";

const StudentAdd = () => {
  const userId = localStorage.getItem('userID');

  if (!userId) {
    return <div>No user ID available.</div>;
  }

  const [form] = Form.useForm();
  const [imagePreviews, setImagePreviews] = useState([]);

  // Lấy subject_id từ query params
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subjectId = queryParams.get("subjectId");

  const handleImageChange = (info) => {
    // Cập nhật trạng thái với danh sách hình ảnh đã chọn
    const fileList = info.fileList.map(file => {
      if (file.response) {
        // Nếu đã có phản hồi từ server, lấy URL từ phản hồi
        file.url = file.response.url;
      }
      return file;
    });
    setImagePreviews(fileList);
  };

  const handleSubmit = async (values) => {
    const { files, images } = values;
    if (files && files.length > 0) {
      const submissionData = {
        user_id: userId,
        title: values.title,
        subject_id: subjectId, // Sử dụng subject_id từ URL
        submission_date: new Date().toISOString(), // Lưu ngày nộp
        fileUrls: [],
        fileNames: [],
        imageUrls: [],
        imageNames: []
      };

      try {
        // Upload file và lưu URL cùng tên file vào submissionData
        for (const file of files) {
          const fileObj = file.originFileObj || file;
          const storageRef = ref(storage, `submissions/${fileObj.name}`);
          await uploadBytes(storageRef, fileObj);
          const fileUrl = await getDownloadURL(storageRef);

          submissionData.fileUrls.push(fileUrl);
          submissionData.fileNames.push(fileObj.name); // Lưu tên file gốc
        }

        // Upload hình ảnh và lưu URL cùng tên ảnh vào submissionData
        for (const image of images || []) {
          const imageObj = image.originFileObj || image;
          const imageRef = ref(storage, `submissions/images/${imageObj.name}`);
          await uploadBytes(imageRef, imageObj);
          const imageUrl = await getDownloadURL(imageRef);

          submissionData.imageUrls.push(imageUrl);
          submissionData.imageNames.push(imageObj.name); // Lưu tên ảnh gốc
        }

        // Lưu submission với cả fileNames và imageNames
        const response = await axios.post(`${firebaseConfig.databaseURL}/submissions.json`, submissionData);
        if (response.status === 200) {
          message.success("Submission successful!");
          form.resetFields();
          setImagePreviews([]); // Đặt lại trạng thái hình ảnh đã tải lên
        } else {
          throw new Error(`Failed to submit: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error submitting files: ", error);
        message.error(`Failed to submit files: ${error.message || error}`);
      }
    } else {
      message.warning("Please upload at least one file.");
    }
  };

  return (
    <div>
      <h1>Submit Your Assignment</h1>
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
        <Form.Item
          name="images"
          label="Upload Images"
          valuePropName="fileList"
          getValueFromEvent={event => Array.isArray(event) ? event : event?.fileList}
          onChange={handleImageChange} // Thêm hàm xử lý thay đổi hình ảnh
        >
          <Upload 
            beforeUpload={() => false} 
            multiple
            accept=".png,.jpg,.jpeg"
          >
            <Button icon={<UploadOutlined />}>Select Images</Button>
          </Upload>
        </Form.Item>

        {/* Hiển thị hình ảnh đã tải lên */}
        <div>
          {imagePreviews.map((file) => (
            <div key={file.uid} style={{ display: 'inline-block', marginRight: 10 }}>
              <img
                src={URL.createObjectURL(file.originFileObj)}
                alt="preview"
                style={{ width: 100, height: 100, objectFit: 'cover' }}
              />
            </div>
          ))}
        </div>

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
