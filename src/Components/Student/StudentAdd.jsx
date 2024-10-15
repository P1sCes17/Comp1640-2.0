// src/pages/student/StudentAdd.jsx

import React, { useState } from "react";
import { storage } from "../../../firebaseConfig"; 
import { Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons"; 
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig"; 

const StudentAdd = ({ folder, userId, onSubmissionSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    const { files } = values;

    if (files && files.length > 0) {
      const submissionData = {
        user_id: userId, 
        folder_id: folder.id,
        title: values.title,
        submission_date: new Date().toISOString(),
        files: [], 
      };

      try {
        for (const file of files.fileList) {
          const storageRef = ref(storage, `submissions/${file.name}`);
          await uploadBytes(storageRef, file.originFileObj);

          const fileUrl = await getDownloadURL(storageRef);
          submissionData.files.push({ name: file.name, url: fileUrl });
        }

        await axios.post(`${firebaseConfig.databaseURL}/submissions.json`, submissionData);
        message.success("Submission successful!");
        form.resetFields();
        onSubmissionSuccess();
      } catch (error) {
        console.error("Error submitting files: ", error);
        message.error("Failed to submit files.");
      }
    } else {
      message.warning("Please upload at least one file.");
    }
  };

  return (
    <div>
      <h1>Submit to {folder?.folder_name}</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
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
            accept=".doc,.docx"
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
