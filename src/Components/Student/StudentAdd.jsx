import React, { useState } from "react";
import { storage } from "../../../firebaseConfig"; 
import { Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig"; 
import { useLocation, useNavigate } from "react-router-dom"; // Thêm useNavigate

const StudentAdd = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const userId = user ? user.userId : null;

  if (!userId) {
    console.log("No user ID available. User data:", user);
    return <div>No user ID available.</div>;
  }

  const [form] = Form.useForm();
  const [imagePreviews, setImagePreviews] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const subjectId = queryParams.get("subjectId");
  const navigate = useNavigate(); // Khởi tạo navigate

  const handleImageChange = (info) => {
    const fileList = info.fileList || [];
    const previews = fileList.map(file => {
      if (!file.originFileObj) return file;
      return Object.assign(file, {
        preview: URL.createObjectURL(file.originFileObj),
      });
    });
    setImagePreviews(previews);
  };

  const handleSubmit = async (values) => {
    const { files, images } = values;

    if (files && files.length > 0) {
      const submissionData = {
        user_id: userId,
        title: values.title,
        subject_id: subjectId,
        submission_date: new Date().toISOString(),
        fileUrls: [],
        fileNames: [],
        imageUrls: [],
        imageNames: []
      };

      try {
        for (const file of files) {
          const fileObj = file.originFileObj || file;
          const storageRef = ref(storage, `submissions/${fileObj.name}`);
          await uploadBytes(storageRef, fileObj);
          const fileUrl = await getDownloadURL(storageRef);

          submissionData.fileUrls.push(fileUrl);
          submissionData.fileNames.push(fileObj.name);
        }

        for (const image of images || []) {
          const imageObj = image.originFileObj || image;
          const imageRef = ref(storage, `submissions/images/${imageObj.name}`);
          await uploadBytes(imageRef, imageObj);
          const imageUrl = await getDownloadURL(imageRef);

          submissionData.imageUrls.push(imageUrl);
          submissionData.imageNames.push(imageObj.name);
        }

        const response = await axios.post(`${firebaseConfig.databaseURL}/submissions.json`, submissionData);
        if (response.status === 200) {
          message.success("Submission successful!");
          form.resetFields();
          setImagePreviews([]);
          navigate("/student-dashboard"); // Sử dụng navigate để chuyển hướng
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
          onChange={handleImageChange}
        >
          <Upload 
            beforeUpload={() => false} 
            multiple
            accept=".png,.jpg,.jpeg"
          >
            <Button icon={<UploadOutlined />}>Select Images</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>

      {imagePreviews.length > 0 && (
        <div>
          <h2>Image Previews:</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {imagePreviews.map((file, index) => (
              <img key={index} src={file.preview} alt="Preview" style={{ width: '100px', height: '100px', margin: '5px' }} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAdd;
