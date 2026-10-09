import React, { useState, useEffect, useCallback } from 'react';
import api from '../auth/api/axios';

interface CommentModalProps {
  post: { id: number; title: string };
  onClose: () => void;
  isHR: boolean;
}

interface CommentsDisplayDto {
  id: number;
  comment: string;
  authorName: string;
  createdAt: string;
  replies: CommentsDisplayDto[];
}

const CommentModal = ({ post, onClose, isHR }: CommentModalProps) => {
  const [commentInput, setCommentInput] = useState('');
  const [comments, setComments] = useState<CommentsDisplayDto[]>([]);
  const [loading, setLoading] = useState(false);
  
  // States for Deletion Modal
  const [commentToDelete, setCommentToDelete] = useState<CommentsDisplayDto | null>(null);
  const [deletionReason, setDeletionReason] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      const res = await api.get(`/Comment/post/${post.id}`);
      setComments(res.data);
    } catch (err) {
      console.error("Failed to load comments:", err);
    }
  }, [post.id]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handlePostComment = async () => {
    if (!commentInput.trim()) return;
    setLoading(true);
    try {
      await api.post('/Comment', {
        postId: post.id,
        comment: commentInput,
        parentCommentId: null
      });
      setCommentInput('');
      fetchComments();
    } catch (err) {
      alert("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!commentToDelete || !deletionReason.trim()) return;

    try {
      // Axios DELETE with Body (data property)
      await api.delete(`/Comment/${commentToDelete.id}`, {
        data: {
          reason: deletionReason 
        }
      });

      // Cleanup and Refresh
      fetchComments();
      setCommentToDelete(null);
      setDeletionReason('');
      alert("Comment deleted and user notified.");
    } catch (err: any) {
      console.error("Delete failed:", err.response?.data);
      const errorMsg = err.response?.data || "Failed to delete comment";
      alert(errorMsg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] relative">
        
        {/* Header */}
        <div className="p-4 border-b flex justify-between items-center bg-white">
          <h2 className="font-bold text-lg truncate text-gray-800">Comments on "{post.title}"</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-black text-2xl px-2 transition-colors">&times;</button>
        </div>

        {/* Comments List */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-3">
          {comments.length > 0 ? (
            comments.map((c) => (
              <div key={c.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm group">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-blue-600">{c.authorName}</span>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {new Date(c.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {isHR && (
                    <button 
                      onClick={() => setCommentToDelete(c)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1 rounded-md hover:bg-red-50"
                      title="Delete Comment"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">{c.comment}</p>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <span className="text-3xl block mb-2">💬</span>
              <p className="text-gray-400 text-sm">No comments yet. Start the conversation!</p>
            </div>
          )}
        </div>

        {/* Footer / Input */}
        <div className="p-4 bg-white border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-gray-100 border border-transparent rounded-full px-4 py-2.5 text-sm focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all outline-none"
              onKeyPress={(e) => e.key === 'Enter' && handlePostComment()}
            />
            <button 
              onClick={handlePostComment}
              disabled={loading || !commentInput.trim()}
              className="bg-blue-600 text-white rounded-full px-6 py-2 text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95 shadow-md shadow-blue-100"
            >
              {loading ? '...' : 'Post'}
            </button>
          </div>
        </div>

        {/* Internal Reason Modal for HR */}
        {commentToDelete && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-6">
                <h2 className="font-bold text-gray-800 text-xl text-center mb-2">Delete Comment?</h2>
                <p className="text-gray-500 text-xs text-center mb-6">
                  Provide a reason. The user will be notified via email.
                </p>
                
                <textarea
                  autoFocus
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                  placeholder="Reason for removal (e.g. Inappropriate language)..."
                  className="w-full p-3 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none bg-gray-50 transition-all resize-none"
                  rows={3}
                />
              </div>

              <div className="flex border-t border-gray-100">
                <button 
                  onClick={() => { setCommentToDelete(null); setDeletionReason(''); }} 
                  className="flex-1 px-4 py-4 text-sm font-bold text-gray-400 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteComment} 
                  disabled={!deletionReason.trim()} 
                  className="flex-1 px-4 py-4 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors border-l border-gray-100 disabled:opacity-30"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentModal;