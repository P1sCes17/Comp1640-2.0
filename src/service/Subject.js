import { database } from "../../firebaseConfig";
import { ref, set, get, child, push } from "firebase/database";

// Hàm để tạo môn học mới
export const createSubject = async (subjectData) => {
  try {
    // Tạo một khóa mới cho môn học
    const newSubjectKey = push(child(ref(database), 'subjects')).key;
    
    // Tạo dữ liệu môn học với khóa mới
    const subjectRef = ref(database, `subjects/${newSubjectKey}`);
    await set(subjectRef, subjectData);

    return { success: true, id: newSubjectKey };
  } catch (error) {
    console.error("Error creating subject:", error);
    return { success: false, error };
  }
};

// Hàm để lấy danh sách các môn học
export const fetchAllSubjects = async () => {
  try {
    const subjectsRef = ref(database, "subjects");
    const snapshot = await get(subjectsRef);

    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return null; // Không có môn học nào
    }
  } catch (error) {
    console.error("Error fetching subjects:", error);
    throw new Error("Failed to fetch subjects.");
  }
};
