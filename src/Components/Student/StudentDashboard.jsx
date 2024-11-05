import React, { useEffect, useState } from "react";
import { Avatar, Form, List, Input, Table, Button, Spin, message, Modal } from "antd"; // Import Comment here
import { useNavigate } from "react-router-dom";
import { fetchAllSubjects } from "../../service/Subject";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig";
import moment from "moment";

const { TextArea } = Input;

const CommentList = ({ comments }) => (
  <List
    dataSource={comments}
    header={`${comments.length} ${comments.length > 1 ? 'replies' : 'reply'}`}
    itemLayout="horizontal"
    renderItem={props => <Comment {...props} />}
  />
);

const Editor = ({ onChange, onSubmit, submitting, value }) => (
  <div>
    <Form.Item>
      <TextArea rows={4} onChange={onChange} value={value} />
    </Form.Item>
    <Form.Item>
      <Button htmlType="submit" loading={submitting} onClick={onSubmit} type="primary">
        Add Comment
      </Button>
    </Form.Item>
  </div>
);  


const StudentDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [modalText, setModalText] = useState('Content of the modal');
  const [visible, setVisible] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [comments, setComments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [value, setValue] = useState('');
  const navigate = useNavigate();


  

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [clickedRow, setClickedRow] = useState(null);


  const handleSubmit = () => {
    if (!value) {
      return;
    }

    setSubmitting(true);

    setTimeout(() => {
      setComments([
        {
          author: 'Han Solo',
          avatar: 'https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png',
          content: <p>{value}</p>,
          datetime: moment().fromNow(),
        },
        ...comments,
      ]);
      setSubmitting(false);
      setValue('');
    }, 1000);
  };
  const handleChange = (e) => {
    setValue(e.target.value);
  };


  const showModal = (rowIndex) => {
    setClickedRow("LSKdjflaksdjflkasjdflkajskdlf"); 
    console.log(submissions[rowIndex]);
    // Store the clicked row index
    setIsModalVisible(true); // Open the modal
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };


  
  // Lấy userId từ localStorage
  const userData = JSON.parse(localStorage.getItem("user"));
  const userId = userData ? userData.userId : null;

  // In ra userId để kiểm tra
  console.log("Current User ID:", userId);

  // Lấy danh sách khoa từ Firebase
  const fetchAllDepartments = async () => {
    const response = await axios.get(`${firebaseConfig.databaseURL}/departments.json`);
    return response.data;
  };

  // Lấy danh sách môn học từ Firebase
  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const [data, departments] = await Promise.all([fetchAllSubjects(), fetchAllDepartments()]);

        if (data) {
          const subjectList = Object.keys(data).map((key) => {
            const subject = { id: key, ...data[key] };
            // Ánh xạ tên khoa từ department ID
            subject.departmentName = departments[subject.department]?.departmentName || "No Department";
            return subject;
          });
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

      console.log("Fetched Submissions Data:", data); // In ra toàn bộ dữ liệu bài nộp

      if (data) {
        const filteredSubmissions = Object.entries(data)
          .map(([key, value]) => {
            console.log("Submission Entry:", key, value); // In ra từng bài nộp
            return {
              submission_id: key,
              ...value,
            };
          })
          .filter((submission) => submission.subject_id === subjectId && submission.user_id === userId); // Lọc theo subjectId và userId

        console.log("Filtered Submissions:", filteredSubmissions); // In ra các bài nộp đã lọc

        setSubmissions(filteredSubmissions);
      } else {
        setSubmissions([]);
        console.log("No submissions data found."); // Thông báo nếu không có dữ liệu bài nộp
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
  

  return (
    <div>
       
       <Modal
        title={`Row ${clickedRow + 1} Details`}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div>
      {comments.length > 0 && <CommentList comments={comments} />}
      <Comment
        avatar={
          <Avatar
            src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
            alt="Han Solo"
          />
        }
        content={
          <Editor
            onChange={handleChange}
            onSubmit={handleSubmit}
            submitting={submitting}
            value={value}
          />
        }
      />
    </div>
      </Modal>


      <div>
      <Modal
        title={`Row ${clickedRow + 1} Details`}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <div>
          {comments.length > 0 && <CommentList comments={comments} />}
          <Comment
            avatar={
              <Avatar
                src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                alt="Han Solo"
              />
            }
            content={
              <Editor
                onChange={handleChange}
                onSubmit={handleSubmit}
                submitting={submitting}
                value={value}
              />
            }
          />
        </div>
      </Modal>

      {/* Existing content for Student Dashboard... */}
    </div>



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
              onRow={(record, rowIndex) => {
                return {
                  onClick: () => showModal(rowIndex),
                };
              }}
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
            disabled={new Date(selectedSubject.deadline) < new Date()} // Không cho phép nộp bài sau thời hạn
          >
            Add New Submission
          </Button>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;