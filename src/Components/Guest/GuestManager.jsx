import React, { useEffect, useState } from 'react';
import { Table, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { firebaseConfig } from '../../../firebaseConfig';

const GuestManager = () => {
  const [guests, setGuests] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch all data from "guest" table in Firebase
    const fetchGuests = async () => {
      try {
        const response = await axios.get(`${firebaseConfig.databaseURL}/guest.json`);
        if (response.data) {
          // Transform data into an array of objects with keys
          const guestsArray = Object.keys(response.data).map(key => ({
            key, // Keep the Firebase key for update/delete actions
            ...response.data[key],
          }));
          setGuests(guestsArray);
        } else {
          message.info('No guests found.');
        }
      } catch (error) {
        console.error('Error fetching guests:', error);
        message.error('Failed to load guest data.');
      }
    };

    fetchGuests();
  }, []);

  // Delete guest by key
  const deleteGuest = async (key) => {
    try {
      await axios.delete(`${firebaseConfig.databaseURL}/guest/${key}.json`);
      message.success('Guest deleted successfully!');
      setGuests(prevGuests => prevGuests.filter(guest => guest.key !== key));
    } catch (error) {
      console.error('Error deleting guest:', error);
      message.error('Failed to delete guest.');
    }
  };

  // Columns for the Ant Design Table component
  const columns = [
    { title: 'Name', dataIndex: 'namestudent', key: 'namestudent', render: text => text || 'No Name' },
    { title: 'Paragraph', dataIndex: 'paragraph', key: 'paragraph', render: text => text || 'No Paragraph' },
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl) => (
        imageUrl ? <img src={imageUrl} alt="Guest" style={{ width: 100, height: 'auto' }} /> : 'No Image'
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (text, record) => (
        <>
          <Button
            type="link"
            onClick={() => navigate(`/guest-edit/${record.key}`)}
          >
            Update
          </Button>
          <Button
            type="link"
            danger
            onClick={() => deleteGuest(record.key)}
          >
            Delete
          </Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>Guest Manager</h1>
      <Button
        type="primary"
        onClick={() => navigate("/guestadd")}
        style={{ marginBottom: "16px" }}
      >
        Add New Guest
      </Button>
      <Table
        columns={columns}
        dataSource={guests}
        rowKey="key"
      />
    </div>
  );
};

export default GuestManager;
