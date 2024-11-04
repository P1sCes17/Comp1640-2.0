import React, { useEffect, useState } from "react";
import { Table, Button, Spin, message } from "antd";
import { useNavigate } from "react-router-dom";
import { fetchAllSubjects } from "../../service/Subject";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig";
import { Modal } from "antd";

const StudentDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userID");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
const [selectedSubmissionDetail, setSelectedSubmissionDetail] = useState(null);

const handleViewSubmission = (submission) => {
  setSelectedSubmissionDetail(submission);
  setIsModalVisible(true);
};

const handleCloseModal = () => {
  setIsModalVisible(false);
};

 

  
  // Lấy danh sách môn học từ Firebase
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const data = await fetchAllSubjects();
        if (data) {
          const subjectList = Object.keys(data).map((key) => ({ id: key, ...data[key] }));
          setSubjects(subjectList);
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
  }, []);
  
  

  // Lấy danh sách bài nộp cho môn học đã chọn
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
          .filter((submission) => submission.user_id === userId && submission.subject_id === subjectId);
        setSubmissions(filteredSubmissions);
      } else {
        setSubmissions([]);
      }
    } catch (error) {
      console.error("Error fetching submissions: ", error);
      message.error("Failed to load submissions.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Khi chọn một môn học
  const handleSubjectClick = (subject) => {
    setSelectedSubject(subject);
    fetchSubmissions(subject.id); // Lấy bài nộp cho môn học này
  };

  // Điều hướng đến trang thêm bài nộp mới
  const handleAddSubmission = (subjectId) => {
    navigate(`/student-add?subjectId=${subjectId}`);
  };

  // Định nghĩa cấu trúc bảng cho môn học
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
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (deadline) => deadline ? new Date(deadline).toLocaleString() : "No deadline",
    },
  ];

  // Định nghĩa cấu trúc bảng cho bài nộp
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
      render: (date) => date ? new Date(date).toLocaleString() : "No Date",
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
      title: "Images",
      dataIndex: "imageUrls",
      key: "imageUrls",
      render: (imageUrls) =>
        Array.isArray(imageUrls) && imageUrls.length > 0 ? (
          imageUrls.map((url, index) => (
            <img key={index} src={url} alt={`submission-image-${index}`} style={{ width: 50, height: 50, marginRight: 5 }} />
          ))
        ) : (
          "No Images"
        ),
    },
  ];
  const fetchComments = async (submissionId) => {
    setLoadingComments(true);
    try {
      const response = await axios.get(`${firebaseConfig.databaseURL}/submissions/${submissionId}/comments.json`);
      const data = response.data;
      if (data) {
        const commentList = Object.entries(data).map(([key, value]) => ({
          comment_id: key,
          ...value,
        }));
        setComments(commentList);
      } else {
        setComments([]);
      }
    } catch (error) {
      message.error("Failed to load comments.");
    } finally {
      setLoadingComments(false);
    }
  };
  const addComment = async (submissionId, content) => {
    try {
      const newComment = {
        user_id: userId,
        content,
        timestamp: new Date().toISOString(),
      };
      await axios.post(`${firebaseConfig.databaseURL}/submissions/${submissionId}/comments.json`, newComment);
      message.success("Comment added!");
      fetchComments(submissionId);
    } catch (error) {
      message.error("Failed to add comment.");
    }
  };
  const editComment = async (submissionId, commentId, newContent) => {
    try {
      await axios.put(`${firebaseConfig.databaseURL}/submissions/${submissionId}/comments/${commentId}.json`, {
        content: newContent,
        timestamp: new Date().toISOString(),
      });
      message.success("Comment edited!");
      fetchComments(submissionId);
    } catch (error) {
      message.error("Failed to edit comment.");
    }
  };
  
  const deleteComment = async (submissionId, commentId) => {
    try {
      await axios.delete(`${firebaseConfig.databaseURL}/submissions/${submissionId}/comments/${commentId}.json`);
      message.success("Comment deleted!");
      fetchComments(submissionId);
    } catch (error) {
      message.error("Failed to delete comment.");
    }
  };
  
  

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
            disabled={new Date(selectedSubject.deadline) < new Date()} // Không cho phép nộp nếu quá hạn
          >
            Add New Submission
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
