import React, { useEffect, useState } from "react";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig"; 
import { Table, Spin, message, Popconfirm } from "antd"; 
import { useNavigate } from "react-router-dom"; 

const StudentDashboard = () => {
  const [folders, setFolders] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(localStorage.getItem('userID')); // Lấy userID từ localStorage
  const navigate = useNavigate();

  const fetchFolders = async () => {
    try {
      const response = await axios.get(`${firebaseConfig.databaseURL}/folders.json`);
      const data = response.data;

      if (data) {
        const folderList = Object.entries(data).map(([key, value]) => ({
          folder_id: key,
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

  const fetchSubmissions = async (folder_id) => {
    try {
      const response = await axios.get(`${firebaseConfig.databaseURL}/submissions.json?orderBy="folder_id"&equalTo="${folder_id}"`);
      const data = response.data;

      if (data) {
        const submissionList = Object.entries(data)
          .map(([key, value]) => ({
            submission_id: key,
            ...value,
          }))
          .filter(submission => submission.user_id === userId); // Lọc submission theo user_id

        setSubmissions(submissionList);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error("Error fetching submissions: ", error);
      message.error("Failed to load submissions.");
    }
  };

  useEffect(() => {
    fetchFolders();
  }, []);

  const handleSubmit = (folder) => {
    navigate(`/student-add`, { state: { folder } });
  };

  const handleDelete = async (submission_id) => {
    try {
      await axios.delete(`${firebaseConfig.databaseURL}/submissions/${submission_id}.json`);
      message.success("Submission deleted successfully.");
      fetchSubmissions(submission_id.folder_id); // Reload submissions after deletion
    } catch (error) {
      console.error("Error deleting submission: ", error);
      message.error("Failed to delete submission.");
    }
  };

  const folderColumns = [
    {
      title: 'Folder Name',
      dataIndex: 'folder_name',
      key: 'folder_name',
      render: (text, folder) => (
        <a onClick={() => {
          handleSubmit(folder);
          fetchSubmissions(folder.folder_id); // Fetch submissions for the selected folder
        }}>
          {text}
        </a>
      ),
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

  const submissionColumns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Submission Date',
      dataIndex: 'submission_date',
      key: 'submission_date',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, submission) => (
        <span>
          <a onClick={() => navigate(`/student-add`, { state: { submission } })}>Edit</a>
          <Popconfirm
            title="Are you sure to delete this submission?"
            onConfirm={() => handleDelete(submission.submission_id)}
          >
            <a style={{ marginLeft: 16 }}>Delete</a>
          </Popconfirm>
        </span>
      ),
    },
  ];

  return (
    <div>
      <h1>Student Dashboard</h1>
      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <>
          <Table 
            dataSource={folders} 
            columns={folderColumns} 
            rowKey="folder_id"
          />
          <h2>Submissions</h2>
          <Table 
            dataSource={submissions} 
            columns={submissionColumns} 
            rowKey="submission_id"
          />
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
