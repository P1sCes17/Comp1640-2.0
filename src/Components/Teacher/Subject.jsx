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
  const [searchTerm, setSearchTerm] = useState("");
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
      setLoading(true);
      try {
        const data = await fetchAllSubjects();
        if (data) {
          const subjectList = Object.keys(data).map((key) => {
            const subject = data[key];
            return {
              id: key,
              name: subject.name || "Unknown", 
              departmentId: subject.department || "Unknown", 
              deadline: subject.deadline || null, 
            };
          });

          // Sắp xếp danh sách môn học theo tên phòng ban
          const sortedSubjects = subjectList.sort((a, b) => {
            const departmentA = departments[a.departmentId]?.departmentName || "";
            const departmentB = departments[b.departmentId]?.departmentName || "";
            return departmentA.localeCompare(departmentB);
          });

          setSubjects(sortedSubjects);
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
  }, [currentUser, departments]); // Giữ currentUser và departments trong mảng phụ thuộc

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

  // Hàm để tìm kiếm môn học
  const handleSearch = (value) => {
    setSearchTerm(value.toLowerCase());
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
      dataIndex: "departmentId", // Sử dụng departmentId ở đây
      key: "departmentId",
      render: (departmentId) =>
        departments[departmentId]?.departmentName || "Unknown",
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
          <Button type="link" style={{ color: "green" }} onClick={() => navigate(`/view-subject/${record.id}`)}>
            View
          </Button>
          <Button type="link" style={{ color: "blue" }} onClick={() => navigate(`/edit-subject/${record.id}`)}>
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

  // Lọc môn học theo từ khóa tìm kiếm
  const filteredSubjects = subjects.filter(subject => subject.name.toLowerCase().includes(searchTerm));

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
          onSearch={handleSearch}
          onChange={(e) => handleSearch(e.target.value)}
          style={{ width: 300 }}
        />
      </div>
      <Table dataSource={filteredSubjects} columns={columns} rowKey="id" loading={loading} />
    </div>
  );
};

export default Subject;
