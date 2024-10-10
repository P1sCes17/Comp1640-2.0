import React, { useEffect, useState } from "react";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig"; // Import Firebase configuration
import { storage } from "../../../firebaseConfig"; // Import storage from Firebase config
import { Table, Spin, Button, Modal, Form, Input, Upload, message } from "antd";
import { UploadOutlined } from "@ant-design/icons"; // Import Upload icon
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import Firebase Storage functions

const StudentDashboard = () => {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedFolder, setSelectedFolder] = useState(null); // Folder selected for submission
  const [userId, setUserId] = useState("user_id_here"); // Replace with actual user ID logic

  const fetchFolders = async () => {
    try {
      const response = await axios.get(`${firebaseConfig.databaseURL}/folders.json`);
      const data = response.data;

      if (data) {
        const folderList = Object.entries(data).map(([key, value]) => ({
          id: key,
          folder_name: value.folder_name,
          created_date: value.created_date,
          deadline: value.deadline,
          department_id: value.department_id,
        }));
        setFolders(folderList);
      } else {
        setFolders([]);
      }
    } catch (error) {
      console.error("Error fetching folders: ", error);
      message.error("Failed to load folders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleOpenModal = (folder) => {
    setSelectedFolder(folder); // Set the selected folder
    setVisible(true); // Show modal
  };

  const handleCancel = () => {
    setVisible(false); // Close modal
    setSelectedFolder(null); // Reset selected folder
    form.resetFields(); // Reset form
  };

  const handleSubmit = async (values) => {
    const { files } = values;

    if (files && files.length > 0) {
      const submissionData = {
        user_id: userId, // Add user ID
        folder_id: selectedFolder.id,
        title: values.title,
        submission_date: new Date().toISOString(),
        files: [], // Array to hold file URLs and names
      };

      try {
        // Upload files and get their URLs and names
        for (const file of files.fileList) {
          console.log(`Uploading file: ${file.name}, type: ${file.type}`); // Log the file being uploaded
          const storageRef = ref(storage, `submissions/${file.name}`); // Create a reference to the file
          await uploadBytes(storageRef, file.originFileObj); // Upload the file

          // Get the download URL after successful upload
          const fileUrl = await getDownloadURL(storageRef);
          console.log(`Uploaded file URL: ${fileUrl}`); // Log the file URL
          submissionData.files.push({ name: file.name, url: fileUrl }); // Store file URL and name
        }

        // Save submission to Firebase Realtime Database
        await axios.post(`${firebaseConfig.databaseURL}/submissions.json`, submissionData);
        message.success("Submission successful!");
        handleCancel(); // Close modal
        fetchFolders(); // Refresh folder list
      } catch (error) {
        console.error("Error submitting files: ", error);
        message.error("Failed to submit files.");
      }
    } else {
      message.warning("Please upload at least one file.");
    }
  };

  const folderColumns = [
    {
      title: 'Folder Name',
      dataIndex: 'folder_name',
      key: 'folder_name',
      render: (text, folder) => <a onClick={() => handleOpenModal(folder)}>{text}</a>,
    },
    {
      title: 'Created Date',
      dataIndex: 'created_date',
      key: 'created_date',
    },
    {
      title: 'Deadline',
      dataIndex: 'deadline',
      key: 'deadline',
    },
  ];

  return (
    <div>
      <h1>Student Dashboard</h1>
      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <>
          <h2>Folder List</h2>
          <Table 
            dataSource={folders} 
            columns={folderColumns} 
            rowKey="id" 
          />
        </>
      )}

      {/* Modal for submitting files */}
      <Modal
        title={`Submit to ${selectedFolder?.folder_name}`}
        visible={visible}
        onCancel={handleCancel}
        footer={null}
      >
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
              beforeUpload={() => false} // Prevent auto upload
              multiple
              accept=".doc,.docx" // Accept only Word files
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
      </Modal>
    </div>
  );
};

export default StudentDashboard;
