import React, { useEffect, useState } from "react";
import { Form, Input, Upload, Button, message } from "antd";
import { useParams, useNavigate } from "react-router-dom";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../../../firebaseConfig";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig";

const GuestEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [guestData, setGuestData] = useState(null);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    const fetchGuestData = async () => {
      try {
        const response = await axios.get(`${firebaseConfig.databaseURL}/guests/${id}.json`);
        setGuestData(response.data);
        form.setFieldsValue(response.data);
      } catch (error) {
        message.error("Failed to load guest data");
        console.error(error);
      }
    };
    fetchGuestData();
  }, [id, form]);

  const handleImageUpload = (info) => {
    setFileList(info.fileList);
  };

  const handleSubmit = async (values) => {
    let imageUrl = guestData.imageUrl;  // Default to existing image

    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      const storageRef = ref(storage, `guests/${file.name}`);
      await uploadBytes(storageRef, file);
      imageUrl = await getDownloadURL(storageRef);
    }

    const updatedData = {
      namestudent: values.namestudent,
      paragraph: values.paragraph,
      imageUrl,
    };

    try {
      await axios.put(`${firebaseConfig.databaseURL}/guests/${id}.json`, updatedData);
      message.success("Guest data updated successfully!");
      navigate("/guestmanager");
    } catch (error) {
      message.error("Failed to update guest data");
      console.error(error);
    }
  };

  return (
    <div>
      <h1>Edit Guest</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="namestudent"
          label="Name"
          rules={[{ required: true, message: "Please enter the name" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="paragraph"
          label="Description"
          rules={[{ required: true, message: "Please enter a description" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="image"
          label="Upload New Image"
          valuePropName="fileList"
          getValueFromEvent={(e) => Array.isArray(e) ? e : e && e.fileList}
          onChange={handleImageUpload}
        >
          <Upload beforeUpload={() => false} accept=".png,.jpg,.jpeg" listType="picture-card">
            <div>
              <Button>Upload</Button>
            </div>
          </Upload>
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default GuestEdit;
