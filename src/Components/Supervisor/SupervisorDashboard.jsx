// SupervisorDashboard.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Spin, message } from "antd";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig";

const SupervisorDashboard = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await axios.get(`${firebaseConfig.databaseURL}/subjects.json`);
        const data = response.data;
        const subjectList = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
        }));
        setSubjects(subjectList);
      } catch (error) {
        message.error("Failed to load subjects.");
      } finally {
        setLoading(false);
      }
    };
    fetchSubjects();
  }, []);

  const toggleSubmissionStatus = async (subjectId, currentStatus) => {
    try {
      await axios.patch(`${firebaseConfig.databaseURL}/subjects/${subjectId}.json`, {
        submissionsDisabled: !currentStatus,
      });
      message.success("Submission status updated successfully.");
      setSubjects((prevSubjects) =>
        prevSubjects.map((subject) =>
          subject.id === subjectId
            ? { ...subject, submissionsDisabled: !currentStatus }
            : subject
        )
      );
    } catch (error) {
      message.error("Failed to update submission status.");
    }
  };

  const columns = [
    { title: "Subject Name", dataIndex: "name", key: "name" },
    {
      title: "Deadline",
      dataIndex: "deadline",
      key: "deadline",
      render: (deadline) => (deadline ? new Date(deadline).toLocaleString() : "No deadline"),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, subject) => (
        <Button
          type="primary"
          danger={subject.submissionsDisabled}
          onClick={() => toggleSubmissionStatus(subject.id, subject.submissionsDisabled)}
        >
          {subject.submissionsDisabled ? "Enable Submissions" : "Disable Submissions"}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1>Supervisor Dashboard</h1>
      {loading ? (
        <Spin size="large" />
      ) : (
        <Table dataSource={subjects} columns={columns} rowKey="id" pagination={{ pageSize: 5 }} />
      )}
    </div>
  );
};

export default SupervisorDashboard;
