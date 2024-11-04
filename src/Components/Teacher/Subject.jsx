  import React, { useState, useEffect } from "react";
  import { Table, Button, Input, message, Popconfirm } from "antd";
  import { useNavigate } from "react-router-dom";
  import { fetchAllSubjects } from "../../service/Subject"; 
  import axios from "axios";
  import { getAuth } from "firebase/auth";

  const Subject = () => {
    const [subjects, setSubjects] = useState([]);
    const [departments, setDepartments] = useState({});
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    // Hàm để lấy danh sách departments từ Firebase
    useEffect(() => {
      const fetchDepartments = async () => {
        try {
          const response = await axios.get(
            "https://comp1640-448f0-default-rtdb.asia-southeast1.firebasedatabase.app/departments.json"
          );
          setDepartments(response.data || {});
        } catch (error) {
          message.error("Failed to load departments.");
        }
      };
      fetchDepartments();
    }, []);

    // Hàm để lấy danh sách môn học từ Firebase
    useEffect(() => {
      const loadSubjects = async () => {
        try {
          const data = await fetchAllSubjects();
          if (data) {
            const subjectList = Object.keys(data).map((key) => {
              const subject = data[key];
              return {
                id: key,
                name: subject.name || "Unknown", 
                department: subject.department || "Unknown", 
                deadline: subject.deadline || null, 
              };
            });

            // Không lọc theo vai trò hay phòng ban, chỉ hiển thị tất cả môn học
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

    // Hàm để xóa một môn học
    const handleDelete = async (id) => {
      try {
        await axios.delete(
          `https://comp1640-448f0-default-rtdb.asia-southeast1.firebasedatabase.app/subjects/${id}.json`
        );
        setSubjects(subjects.filter((subject) => subject.id !== id));
        message.success("Subject deleted successfully.");
      } catch (error) {
        message.error("Failed to delete subject.");
      }
    };

    // Cấu trúc các cột của bảng
    const columns = [
      {
        title: "Name Subject",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Department",
        dataIndex: "department",
        key: "department",
        render: (departmentId) =>
          departments[departmentId]?.username || "Unknown",
      },
      {
        title: "Deadline",
        dataIndex: "deadline",
        key: "deadline",
        render: (deadline) =>
          deadline ? new Date(deadline).toLocaleString() : "No deadline",
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
            <Popconfirm
              title="Are you sure to delete this subject?"
              onConfirm={() => handleDelete(record.id)}
              okText="Yes"
              cancelText="No"
            >
              <Button type="link" style={{ color: "red" }}>
                Delete
              </Button>
            </Popconfirm>
          </>
        ),
      },
    ];

    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
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
