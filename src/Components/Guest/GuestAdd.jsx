import React, { useState } from "react";
import { storage } from "../../../firebaseConfig";
import { Form, Input, Upload, Button, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { firebaseConfig } from "../../../firebaseConfig";

const GuestAdd = () => {
  const [form] = Form.useForm();
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (info) => {
    const file = info.fileList[0];
    if (file && file.originFileObj) {
      setImagePreview(URL.createObjectURL(file.originFileObj));
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (values) => {
    const { namestudent, paragraph, image } = values;

    if (image && image.length > 0) {
      const imageFile = image[0].originFileObj;

      try {
        // Upload image to Firebase Storage
        const imageRef = ref(storage, `guest/${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        const imageUrl = await getDownloadURL(imageRef);

        // Prepare guest data for submission
        const guestData = {
          namestudent: namestudent,
          paragraph: paragraph,
          imageUrl: imageUrl,
          timestamp: new Date().toISOString(),
        };

        // Save guest data to Realtime Database
        const response = await axios.post(`${firebaseConfig.databaseURL}/guests.json`, guestData);
        if (response.status === 200) {
          message.success("Guest added successfully!");
          form.resetFields();
          setImagePreview(null);
        } else {
          throw new Error(`Failed to add guest: ${response.statusText}`);
        }
      } catch (error) {
        console.error("Error adding guest:", error);
        message.error(`Failed to add guest: ${error.message || error}`);
      }
    } else {
      message.warning("Please upload an image.");
    }
  };

  return (
    <div>
      <h1>Add Guest Information</h1>
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onFinishFailed={(errorInfo) => {
          console.log("Failed:", errorInfo);
        }}
      >
        <Form.Item
          name="namestudent"
          label="Student Name"
          rules={[{ required: true, message: "Please enter the student's name!" }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="paragraph"
          label="Paragraph"
          rules={[{ required: true, message: "Please enter a paragraph!" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        <Form.Item
          name="image"
          label="Upload Image"
          valuePropName="fileList"
          getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
          onChange={handleImageChange}
          rules={[{ required: true, message: "Please upload an image!" }]}
        >
          <Upload beforeUpload={() => false} accept=".png,.jpg,.jpeg">
            <Button icon={<UploadOutlined />}>Select Image</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>

      {imagePreview && (
        <div>
          <h2>Image Preview:</h2>
          <img src={imagePreview} alt="Preview" style={{ width: "200px", margin: "10px 0" }} />
        </div>
      )}
    </div>
  );
};

export default GuestAdd;
