import React, { useEffect, useState } from "react";
import axios from "axios"; 
import { firebaseConfig } from "../../../firebaseConfig"; 
import { Table, Spin, Button, message, Modal, Form, Input, DatePicker } from "antd"; 
import { useNavigate } from "react-router-dom"; 
import { auth } from "../../../firebaseConfig"; 

const LoginManager = () => {
  const [users, setUsers] = useState([]);
  const [folders, setFolders] = useState([]);
  const [submissions, setSubmissions] = useState([]); // State for submissions
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedFolder, setSelectedFolder] = useState(null); 
  const navigate = useNavigate(); 

  const fetchData = async () => {
    try {
      // Fetch users
      const usersResponse = await axios.get(`${firebaseConfig.databaseURL}/account.json`);
      const usersData = usersResponse.data;
      if (usersData) {
        const userList = Object.entries(usersData).map(([key, value]) => ({
          id: key,
          username: value.username,
          email: value.email,
          role: value.role,
          department: value.department,
        }));
        setUsers(userList); 
      } else {
        setUsers([]);
      }

      // Fetch folders
      const foldersResponse = await axios.get(`${firebaseConfig.databaseURL}/folders.json`);
      const foldersData = foldersResponse.data;
      if (foldersData) {
        const folderList = Object.entries(foldersData).map(([key, value]) => ({
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

      // Fetch submissions
      const submissionsResponse = await axios.get(`${firebaseConfig.databaseURL}/submissions.json`);
      const submissionsData = submissionsResponse.data;
      if (submissionsData) {
        const submissionList = Object.entries(submissionsData).map(([key, value]) => ({
          id: key,
          title: value.title,
          folder_id: value.folder_id, // Ensure this is part of your submission structure
          submitted_date: value.submitted_date, // Đảm bảo lấy dữ liệu submitted_date
          file_word: value.file_word, // Changed from file_url to file_word
        }));
        setSubmissions(submissionList);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
      message.error("Failed to load data.");
    } finally {
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData(); 
  }, []);

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        console.log("User signed out");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error signing out: ", error);
      });
  };

  const handleAddAccount = () => {
    navigate("/loginadd");
  };

  const handleAddFolder = async (values) => {
    try {
      const folderData = {
        folder_name: values.folder_name,
        created_date: values.created_date.format('YYYY-MM-DD'),
        deadline: values.deadline.format('YYYY-MM-DD'),
        department_id: values.department_id,
      };

      await axios.post(`${firebaseConfig.databaseURL}/folders.json`, folderData);
      message.success("Folder created successfully!");
      setVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      console.error("Error creating folder: ", error);
      message.error("Failed to create folder.");
    }
  };

  const showAddFolderModal = () => {
    setVisible(true);
  };

  const handleCancel = () => {
    setVisible(false);
  };

  const handleViewFolderDetails = (folder) => {
    setSelectedFolder(folder); 
  };

  const handleCloseDetails = () => {
    setSelectedFolder(null);
  };

  const columns = [
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
  ];

  const folderColumns = [
    {
      title: 'Folder Name',
      dataIndex: 'folder_name',
      key: 'folder_name',
      render: (text, folder) => <a onClick={() => handleViewFolderDetails(folder)}>{text}</a>,
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
    {
      title: 'Department ID',
      dataIndex: 'department_id',
      key: 'department_id',
    },
  ];

  return (
    <div>
      <h1>Account List</h1>
      <Button type="primary" onClick={handleLogout} style={{ marginBottom: '16px', marginRight: '8px' }}>
        Logout
      </Button>
      <Button type="primary" onClick={handleAddAccount} style={{ marginBottom: '16px', marginRight: '8px' }}>
        Add Account
      </Button>
      <Button type="primary" onClick={showAddFolderModal} style={{ marginBottom: '16px' }}>
        Add Folder
      </Button>

      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <>
          <Table 
            dataSource={users} 
            columns={columns} 
            rowKey="id" 
            style={{ marginBottom: '32px' }} 
          />
          <h2>Folder List</h2>
          <Table 
            dataSource={folders} 
            columns={folderColumns} 
            rowKey="id" 
          />
        </>
      )}

      <Modal
        title="Create Folder"
        visible={visible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddFolder}
        >
          <Form.Item
            name="folder_name"
            label="Folder Name"
            rules={[{ required: true, message: 'Please input folder name!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="created_date"
            label="Created Date"
            rules={[{ required: true, message: 'Please select created date!' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="deadline"
            label="Deadline"
            rules={[{ required: true, message: 'Please select deadline!' }]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="department_id"
            label="Department ID"
            rules={[{ required: true, message: 'Please input department ID!' }]}
          >
            <Input type="number" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Create Folder
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal for folder details */}
      <Modal
        title="Folder Details"
        visible={selectedFolder !== null}
        onCancel={handleCloseDetails}
        footer={null}
      >
        {selectedFolder && (
          <div>
            <p><strong>Folder Name:</strong> {selectedFolder.folder_name}</p>
            <p><strong>Created Date:</strong> {selectedFolder.created_date}</p>
            <p><strong>Deadline:</strong> {selectedFolder.deadline}</p>
            <p><strong>Department ID:</strong> {selectedFolder.department_id}</p>
            <h3>Submissions</h3>
            <Table
  dataSource={submissions.filter(sub => sub.folder_id === selectedFolder.id)} // Lọc submissions theo folder ID
  columns={[
    {
      title: 'Submission Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Submitted Date', // Cột cho ngày nộp
      dataIndex: 'submitted_date',
      key: 'submitted_date',
      render: (text) => new Date(text).toLocaleDateString(), // Định dạng ngày
    },
    {
      title: 'File Word', // Changed from File URL to File Word
      dataIndex: 'file_word',
      key: 'file_word',
      render: (text) => <a href={text} target="_blank" rel="noopener noreferrer">View File</a>, // Render file link
    },
  ]}
  rowKey="id"
/>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LoginManager;
