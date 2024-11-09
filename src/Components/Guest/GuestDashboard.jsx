import React, { useEffect, useState } from 'react';
import { Table, message } from 'antd';
import axios from 'axios';
import { firebaseConfig } from '../../../firebaseConfig';

const GuestDashboard = () => {
  const [guests, setGuests] = useState([]);

  useEffect(() => {
    // Fetch all data from "guest" table in Firebase
    const fetchGuests = async () => {
      try {
        const response = await axios.get(`${firebaseConfig.databaseURL}/guests.json`);
        if (response.data) {
          // Transform data into an array of objects with keys
          const guestsArray = Object.keys(response.data).map(key => ({
            key, // Keep the Firebase key for further reference (if needed)
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
  ];

  return (
    <div>
      <h1>Guest Dashboard</h1>
      <Table
        columns={columns}
        dataSource={guests}
        rowKey="key"
      />
    </div>
  );
};

export default GuestDashboard;
