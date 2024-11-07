import React, { useState, useEffect } from "react";
import { Table, Button, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import { fetchAllSubjects } from "../../service/Subject";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig";
import CommentSection from "./CommentSection";

const StudentDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const navigate = useNavigate();

  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData ? userData.userId : null;
  const userDepartment = userData ? userData.department : null;
  const userRole = userData ? userData.role : null; // Lấy role của user (student, teacher, admin)
  
  // In ra userId và userRole để kiểm tra
  console.log("Current User ID:", userId);
  console.log("Current User Role:", userRole);

  // Lấy danh sách khoa từ Firebase
  const fetchAllDepartments = async () => {
    const response = await axios.get(`${firebaseConfig.databaseURL}/departments.json`);
    return response.data;
  };

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const [data, departments] = await Promise.all([fetchAllSubjects(), fetchAllDepartments()]);
        if (data) {
          const subjectList = Object.keys(data).map((key) => {
            const subject = { id: key, ...data[key] };
            subject.departmentName = departments[subject.department]?.departmentName || "No Department";
            return subject;
          });
  
          // Nếu người dùng là admin hoặc teacher, không cần lọc theo department
          const filteredSubjects = subjectList.filter((subject) => 
            userRole === 'student' ? subject.department === userDepartment : true
          );
  
          setSubjects(filteredSubjects);
        } else {
          setSubjects([]);
        }
      } catch (error) {
        message.error("Failed to load subjects.");
      } finally {
        setLoadingSubjects(false);
      }
    };
    loadSubjects();
  }, [userDepartment, userRole]); // Chạy lại khi userRole hoặc userDepartment thay đổi
  

  const fetchSubmissions = async (subjectId) => {
    setLoadingSubmissions(true);
    try {
      const response = await axios.get(`${firebaseConfig.databaseURL}/submissions.json`);
      const data = response.data;

      if (data) {
        const filteredSubmissions = Object.entries(data)
          .map(([key, value]) => ({
            submission_id: key,
            ...value,
          }))
          .filter((submission) => {
            // If user is a student, filter by user_id; if user is a teacher or admin, allow all submissions
            return submission.subject_id === subjectId && 
                   (userRole === 'teacher' || userRole === 'admin' || submission.user_id === userId);
          });
        console.log("Filtered Submissions:", filteredSubmissions);
        setSubmissions(filteredSubmissions);
      } else {
        setSubmissions([]);
        console.log("No submissions data found.");
      }
    } catch (error) {
      console.error("Error fetching submissions:", error);
      message.error("Failed to load submissions.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    fetchSubmissions(subject.id);
  };

  const handleAddSubmission = (subjectId) => {
    navigate(`/student-add?subjectId=${subjectId}`);
  };

  const subjectColumns = [
    {
      title: "Name Subject",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <Button type="link" onClick={() => handleSubjectClick(record)}>
          {name}
        </Button>
      ),
    },
    {
      title: "Department",
      dataIndex: "departmentName",
      key: "departmentName",
      render: (departmentName) => departmentName || "No Department",
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (deadline) => (deadline ? new Date(deadline).toLocaleString() : "No deadline"),
    },
  ];

  const submissionColumns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Submission Date",
      dataIndex: "submission_date",
      key: "submission_date",
      render: (date) => (date ? new Date(date).toLocaleString() : "No Date"),
    },
    {
      title: "Files",
      dataIndex: "fileNames",
      key: "fileNames",
      render: (fileNames) =>
        Array.isArray(fileNames) && fileNames.length > 0 ? (
          fileNames.map((name, index) => <div key={index}>{name}</div>)
        ) : (
          "No Files"
        ),
    },
    
    {
      title: "Uploaded Images",
      dataIndex: "imageUrls",
      key: "imageUrls",
      render: (imageUrls, record) =>
        imageUrls && imageUrls.length > 0 ? (
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {imageUrls.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={record.imageNames[index] || `Image ${index + 1}`}
                style={{ width: '50px', height: '50px' }}
              />
            ))}
          </div>
        ) : (
          "No Images"
        ),
    },
    {
      title: "Comments",
      key: "comments",
      render: (_, record) => (
        <CommentSection 
          submissionId={record.submission_id}
          userId={userData.userId} 
          role={userData.role}
        />
      ),
    },
  ];

  return (
    <div>
      <h1>Student Dashboard</h1>

      {loadingSubjects ? (
        <Spin tip="Loading Subjects..." />
      ) : (
        <Table
          dataSource={subjects}
          columns={subjectColumns}
          rowKey="id"
          pagination={{ pageSize: 5 }}
        />
      )}

      {selectedSubject && (
        <div style={{ marginTop: 24 }}>
          <h2>Submissions for {selectedSubject.name}</h2>

          {loadingSubmissions ? (
            <Spin tip="Loading Submissions..." />
          ) : (
            <Table
              dataSource={submissions}
              columns={submissionColumns}
              rowKey="submission_id"
              pagination={{ pageSize: 5 }}
            />
          )}

          <Button
            type="primary"
            style={{ marginTop: 16 }}
            onClick={() => handleAddSubmission(selectedSubject.id)}
            disabled={selectedSubject.submissionsDisabled || new Date(selectedSubject.deadline) < new Date()}
          >
            Add New Submission
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
