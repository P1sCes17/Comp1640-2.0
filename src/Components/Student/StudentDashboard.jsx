// src/pages/student/StudentDashboard.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig"; // Import Firebase configuration
import { Table, Spin, message } from "antd"; // Import Ant Design components
import { useNavigate } from "react-router-dom"; // Import useNavigate for routing

const StudentDashboard = () => {
  const [folders, setFolders] = useState([]); // State to store folder list
  const [loading, setLoading] = useState(true); // State to handle loading
  const [userId, setUserId] = useState("user_id_here"); // Dummy user ID, replace with actual logic
  const navigate = useNavigate(); // Hook for navigating to other pages

  // Function to fetch folders from the database
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
        setFolders([]); // If no data, set folders to an empty array
      }
    } catch (error) {
      console.error("Error fetching folders: ", error); // Log error in case of failure
      message.error("Failed to load folders."); // Show error message
    } finally {
      setLoading(false); // Stop loading after data fetch
    }
  };

  // Fetch folders when the component mounts
  useEffect(() => {
    fetchFolders();
  }, []);

  // Function to handle submission and navigate to StudentAdd page
  const handleSubmit = (folder) => {
    navigate(`/student-add`, { state: { folder, userId } }); // Navigate with folder and userId as state
  };

  // Define table columns for folder data
  const folderColumns = [
    {
      title: 'Folder Name',
      dataIndex: 'folder_name',
      key: 'folder_name',
      render: (text, folder) => <a onClick={() => handleSubmit(folder)}>{text}</a>, // Link to submit page
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

  // Render the dashboard
  return (
    <div>
      <h1>Student Dashboard</h1>
      {loading ? (
        <Spin tip="Loading..." /> // Show loading spinner while data is being fetched
      ) : (
        <Table 
          dataSource={folders} 
          columns={folderColumns} 
          rowKey="id" 
        />
      )}
    </div>
  );
};

export default StudentDashboard;
