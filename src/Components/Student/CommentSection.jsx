import React, { useState, useEffect } from 'react';
import { Input, Button, List, message } from 'antd';
import axios from 'axios';
import { firebaseConfig, database } from '../../../firebaseConfig';
import { getDatabase, ref, get, query, orderByChild, equalTo } from "firebase/database";

const CommentSection = ({ submissionId, userId, role }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [editCommentId, setEditCommentId] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');

  useEffect(() => {
    // Fetch comments for the given submissionId
    const fetchComments = async () => {
      if (!submissionId) {
        console.error("Invalid submissionId:", submissionId);
        return; // Dừng lại nếu submissionId không hợp lệ
      }
    
      try {
        const commentsRef = ref(database, "comments");
        const q = query(commentsRef, orderByChild("submission_id"), equalTo(submissionId));
    
        const snapshot = await get(q);
        if (snapshot.exists()) {
          const commentsData = snapshot.val();
          const commentsList = Object.keys(commentsData).map(key => ({
            comment_id: key,
            ...commentsData[key]
          }));
          setComments(commentsList); // Cập nhật state với các comment lấy từ Firebase
        } else {
          console.log("No comments found.");
          setComments([]); // Nếu không có comment, set danh sách comment trống
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    
    fetchComments();
  }, [submissionId]);

  // Add a new comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await axios.post(`${firebaseConfig.databaseURL}/comments.json`, {
        submission_id: submissionId,
        user_id: userId,
        content: newComment,
        timestamp: new Date().toISOString(),
      });

      const commentId = response.data.name;

      // Update the state by adding the new comment
      const newCommentObj = {
        comment_id: commentId,
        content: newComment,
        user_id: userId,
        timestamp: new Date().toISOString(),
      };

      setComments(prevComments => [newCommentObj, ...prevComments]);

      setNewComment('');
      message.success("Comment added successfully.");
    } catch (error) {
      message.error("Failed to add comment.");
    }
  };

  // Edit an existing comment
  const handleEditComment = async () => {
    if (!editCommentContent.trim()) return;

    try {
      // Update the comment in Firebase
      await axios.put(`${firebaseConfig.databaseURL}/comments/${editCommentId}.json`, {
        content: editCommentContent,
        timestamp: new Date().toISOString(),
      });

      // Update the state by modifying the edited comment and keeping previous comments intact
      setComments(prevComments =>
        prevComments.map(comment =>
          comment.comment_id === editCommentId
            ? { ...comment, content: editCommentContent }
            : comment
        )
      );

      setEditCommentId(null);
      setEditCommentContent('');
      message.success("Comment updated successfully.");
    } catch (error) {
      message.error("Failed to update comment.");
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${firebaseConfig.databaseURL}/comments/${commentId}.json`);
      message.success("Comment deleted successfully.");
      setComments(comments.filter(comment => comment.comment_id !== commentId));
    } catch (error) {
      message.error("Failed to delete comment.");
    }
  };

  return (
    <div>
      {/* Display comments in a list */}
      <List
        bordered
        dataSource={comments}
        renderItem={(comment) => (
          <List.Item
            actions={role !== 'student' ? [
              <Button type="link" onClick={() => setEditCommentId(comment.comment_id)}>Edit</Button>,
              <Button type="link" onClick={() => handleDeleteComment(comment.comment_id)}>Delete</Button>
            ] : []}
          >
            {editCommentId === comment.comment_id ? (
              <Input.TextArea
                value={editCommentContent}
                onChange={(e) => setEditCommentContent(e.target.value)}
                rows={4}
              />
            ) : (
              comment.content
            )}
          </List.Item>
        )}
      />

      {/* Input field and button to add a new comment */}
      {role !== 'student' && (
        <div style={{ marginTop: 16 }}>
          <Input.TextArea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment"
            rows={4}
          />
          <Button
            type="primary"
            onClick={handleAddComment}
            style={{ marginTop: 8 }}
          >
            Add Comment
          </Button>
        </div>
      )}

      {/* Show Save button when editing a comment */}
      {editCommentId && (
        <Button
          type="primary"
          onClick={handleEditComment}
          style={{ marginTop: 8 }}
        >
          Save Changes
        </Button>
      )}
    </div>
  );
};

export default CommentSection;
