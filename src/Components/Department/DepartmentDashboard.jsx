import React, { useState, useEffect } from "react";
import { Table, Button, message } from "antd";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import { useLocation } from "react-router-dom";

const DepartmentDashboard = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
      fetchDepartments();
  }, []);

  useEffect(() => {
      if (location.state && location.state.refresh) {
          fetchDepartments();
      }
  }, [location.state]);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://comp1640-448f0-default-rtdb.asia-southeast1.firebasedatabase.app/departments.json');
      const departmentsData = response.data ? Object.keys(response.data).map(key => ({ ...response.data[key], id: key })) : [];
      setDepartments(departmentsData);
    } catch (error) {
      message.error("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (id) => {
    navigate(`/department-edit/${id}`);
  };

  const handleAdd = () => {
    navigate("/department-add");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://comp1640-448f0-default-rtdb.asia-southeast1.firebasedatabase.app/departments/${id}.json`);
      message.success("Department deleted successfully.");
      fetchDepartments();
    } catch (error) {
      message.error("Failed to delete department.");
    }
  };

  const columns = [
    // { title: 'Department ID', dataIndex: 'id', key: 'id' },
    { title: 'Department Name', dataIndex: 'username', key: 'username' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button onClick={() => handleEdit(record.id)}>Edit</Button>
          <Button onClick={() => handleDelete(record.id)} style={{ marginLeft: '8px' }}>Delete</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>Department List</h1>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: '16px' }}>Add Department</Button>
      <Table
        dataSource={departments}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default DepartmentDashboard;
