import React, { useState, useEffect } from "react"; 
import { Table, Button, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import { fetchAllSubjects } from "../../service/Subject"; 

const Subject = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Hàm để lấy danh sách môn học từ Firebase
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
        setLoading(false);
      }
    };
    loadSubjects();
  }, []);

  // Cấu trúc các cột của bảng
  const columns = [
    {
      title: "Name Subject",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (deadline) => deadline ? new Date(deadline).toLocaleString() : "No deadline",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <>
          <Button type="link" style={{ color: "green" }}>
            View
          </Button>
          <Button type="link" style={{ color: "blue" }}>
            Edit
          </Button>
          <Button type="link" style={{ color: "red" }}>
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        {/* Khi bấm nút này sẽ điều hướng sang trang NewSubject */}
        <Button
          type="primary"
          style={{ backgroundColor: "#1890ff" }}
          onClick={() => navigate("/new-subject")}
        >
          Add New Subject
        </Button>
        <Input.Search
          placeholder="Search by Subject Name"
          onSearch={(value) => console.log(value)}
          style={{ width: 300 }}
        />
      </div>
      <Table dataSource={subjects} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
};

export default Subject;
