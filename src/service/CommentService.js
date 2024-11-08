import { database } from "../../firebaseConfig";
import { ref, set, get, child, push, update, remove } from "firebase/database";

// Function to add a new comment
export const addComment = async ({ content, submissionId, userId }) => {
  try {
    // Generate a unique key for the new comment
    const newCommentKey = push(child(ref(database), 'comments')).key;

    // Define the comment data
    const newComment = {
      content,
      submissionId,
      userId,
      createdAt: Date.now(),
    };

    // Reference to the new comment in the database
    const commentRef = ref(database, `comments/${newCommentKey}`);
    await set(commentRef, newComment);

    return { success: true, id: newCommentKey };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, error };
  }
};

// Function to fetch all comments for a specific submission
export const getComments = async (submissionId) => {
    try {
      const commentsRef = ref(database, "comments");
      const snapshot = await get(query(commentsRef, orderByChild("submissionId"), equalTo(submissionId)));
  
      if (snapshot.exists()) {
        const allComments = snapshot.val();
        return Object.entries(allComments).map(([id, comment]) => ({ id, ...comment }));
      } else {
        return []; // No comments found
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw new Error("Failed to fetch comments.");
    }
  };
  

// Function to update an existing comment
export const updateComment = async (commentId, updatedData) => {
  try {
    const commentRef = ref(database, `comments/${commentId}`);
    await update(commentRef, updatedData);
    return { success: true };
  } catch (error) {
    console.error("Error updating comment:", error);
    return { success: false, error };
  }
};

// Function to delete a comment
export const deleteComment = async (commentId) => {
  try {
    const commentRef = ref(database, `comments/${commentId}`);
    await remove(commentRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error };
  }
};
