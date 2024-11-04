// Import các module Firebase cần thiết
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Import Firebase Storage

// Cấu hình Firebase với các thông tin cần thiết
const firebaseConfig = {
  apiKey: "AIzaSyBa94axfNYBPd_RHNyovO68axJhF8nw198",
  authDomain: "comp1640-448f0.firebaseapp.com",
  databaseURL: "https://comp1640-448f0-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "comp1640-448f0",
  storageBucket: "comp1640-448f0.appspot.com", // Đảm bảo đã cấu hình đúng
  messagingSenderId: "388081080962",
  appId: "1:388081080962:web:824fc63f98c7c63c24b29b",
  measurementId: "G-SKL2LMFGLL"
};

// Khởi tạo ứng dụng Firebase
const app = initializeApp(firebaseConfig);

// Khởi tạo các dịch vụ Firebase
const database = getDatabase(app);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const storage = getStorage(app); // Khởi tạo Firebase Storage

// Xuất các dịch vụ Firebase để sử dụng ở các phần khác của ứng dụng
export { database, analytics, auth, storage, firebaseConfig };
