import React, { useEffect, useState } from "react";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig"; 
import { Table, Spin, message, Button, Image } from "antd"; 
import { useNavigate } from "react-router-dom"; 

const StudentDashboard = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userID'); 
  const navigate = useNavigate();

  const fetchSubmissions = async () => {
    try {
      const response = await axios.get(`${firebaseConfig.databaseURL}/submissions.json`);
      const data = response.data;

      if (data) {
        const submissionList = Object.entries(data)
          .map(([key, value]) => ({
            submission_id: key,
            ...value,
          }))
          .filter(submission => submission.user_id === userId);

        setSubmissions(submissionList);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error("Error fetching submissions: ", error);
      message.error("Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleAddSubmission = () => {
    navigate(`/student-add`);
  };

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
      title: 'Images',
      dataIndex: 'imageUrls',
      key: 'imageUrls',
      render: (imageUrls) =>
        Array.isArray(imageUrls) && imageUrls.length > 0 ? (
          imageUrls.map((url, index) => (
            <Image key={index} src={url} width={50} style={{ marginRight: 8 }} />
          ))
        ) : (
          "No Images"
        ),
    },
    {
      title: 'Files',
      dataIndex: 'fileNames',
      key: 'fileNames',
      render: (fileNames) =>
        Array.isArray(fileNames) && fileNames.length > 0 ? (
          fileNames.map((name, index) => (
            <div key={index}>{name}</div>
          ))
        ) : (
          "No Files"
        ),
    }
  ];

  return (
    <div>
      <h1>Student Dashboard</h1>
      {loading ? (
        <Spin tip="Loading..." />
      ) : (
        <>
          <Button type="primary" onClick={handleAddSubmission} style={{ marginBottom: 16 }}>
            Add Submission
          </Button>
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
