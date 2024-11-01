import React, { useState } from "react";
import { storage } from "../../../firebaseConfig"; 
import { Form, Input, Upload, Button, message, Image, Modal } from "antd";
import { UploadOutlined } from "@ant-design/icons"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import useNavigate để chuyển hướng
import { firebaseConfig } from "../../../firebaseConfig"; 

const StudentAdd = () => {
  const userId = localStorage.getItem('userID');
  const navigate = useNavigate(); // Khởi tạo navigate

  if (!userId) {
    return <div>No user ID available.</div>;
  }

  const [form] = Form.useForm();
  const [previewImages, setPreviewImages] = useState([]);
  const [previewFiles, setPreviewFiles] = useState([]);

  const handleFileChange = ({ fileList }) => {
    const filesPreview = fileList.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file.originFileObj || file),
    }));
    setPreviewFiles(filesPreview);
  };

  const handleImageChange = ({ fileList }) => {
    const imagesPreview = fileList.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file.originFileObj || file),
    }));
    setPreviewImages(imagesPreview);
  };

  const handleSubmit = async (values) => {
    const { files, images } = values;
    if (files && files.length > 0) {
      const submissionData = {
        user_id: userId, 
        title: values.title,
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
          setPreviewImages([]);
          setPreviewFiles([]);
          navigate('/student-dashboard'); // Chuyển hướng về StudentDashboard sau khi thành công
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

  const showConfirmDialog = () => {
    Modal.confirm({
      title: "Confirm Submission",
      content: "Are you sure you want to submit this assignment?",
      okText: "Yes",
      cancelText: "No",
      onOk: () => form.submit(),
    });
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
            onChange={handleFileChange}
          >
            <Button icon={<UploadOutlined />}>Select Files</Button>
          </Upload>
        </Form.Item>
        
        {previewFiles.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3>File Previews:</h3>
            {previewFiles.map((file, index) => (
              <div key={index}>{file.name}</div>
            ))}
          </div>
        )}

        <Form.Item
          name="images"
          label="Upload Images"
          valuePropName="fileList"
          getValueFromEvent={event => Array.isArray(event) ? event : event?.fileList}
        >
          <Upload 
            beforeUpload={() => false} 
            multiple
            accept=".png,.jpg,.jpeg"
            onChange={handleImageChange}
          >
            <Button icon={<UploadOutlined />}>Select Images</Button>
          </Upload>
        </Form.Item>
        
        {previewImages.length > 0 && (
          <div style={{ marginBottom: 16 }}>
            <h3>Image Previews:</h3>
            {previewImages.map((image, index) => (
              <Image key={index} src={image.url} width={100} style={{ marginRight: 8 }} />
            ))}
          </div>
        )}

        <Form.Item>
          <Button type="primary" onClick={showConfirmDialog}>
            Submit
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default StudentAdd;
