import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'antd';

// Bạn có thể thay đổi URL của ảnh theo nhu cầu
const Home = () => {
  const navigate = useNavigate(); // Hook để điều hướng trang

  const handleLoginClick = () => {
    navigate('/login'); // Chuyển hướng đến trang login
  };

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      {/* Tấm hình */}
      <img 
        src="https://greenwich.edu.vn/wp-content/uploads/2023/07/dai-hoc-greenwich-viet-nam-diem-chuan-2-1024x684-1.jpg" // Đổi link ảnh theo yêu cầu
        alt="Placeholder" 
        style={{ width: '100%', maxWidth: '1440px', marginBottom: '1270px' }}
      />
      
      {/* Button Login */}
      <Button 
        type="primary" 
        size="large" 
        onClick={handleLoginClick} 
        style={{ marginTop: '20px' }}
      >
        Login
      </Button>
    </div>
  );
};

export default Home;
