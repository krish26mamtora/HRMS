import React, { useEffect, useState, useMemo } from 'react';
import api from '../auth/api/axios';
import { useNavigate } from 'react-router-dom';

const MyComments = () => {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'deleted'>('all');

  const fetchMyComments = async () => {
    try {
      const response = await api.get('/Comment/user/history');
      setComments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Comment fetch error", err);
    } finally {
      setLoading(false);
    }
  };
  const navigate = useNavigate();
  useEffect(() => { fetchMyComments(); }, []);

  const filteredComments = useMemo(() => {
    if (activeFilter === 'active') return comments.filter(c => c.isDeleted === 0);
    if (activeFilter === 'deleted') return comments.filter(c => c.isDeleted === 1);
    return comments;
  }, [comments, activeFilter]);

  if (loading) return <div className="p-10 text-center text-gray-400">Loading comments...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 bg-white p-5 rounded-lg shadow-sm border border-gray-100 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Comments</h1>
          <p className="text-sm text-gray-500">View and manage your comment history</p>
          <button onClick={()=>{navigate(-1)}} className='underline text-blue-500'>Back</button>
        </div>
        <div className="flex gap-2 bg-gray-50 p-1 rounded-md border border-gray-200">
          {(['all', 'active', 'deleted'] as const).map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)} 
              className={`px-4 py-1.5 rounded text-sm font-bold capitalize transition-all ${
                activeFilter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}> {f}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredComments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
            No comments found.
          </div>
        ) : (
          filteredComments.map((comment) => (
            <CommentRow key={comment.id} item={comment} refresh={fetchMyComments} />
          ))
        )}
      </div>
    </div>
  );
};

const CommentRow = ({ item, refresh }: { item: any, refresh: () => void }) => {
  const [post, setPost] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(item.comment);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/Posts/${item.postId}`);
        setPost(response.data);
      } catch (err) { setPost({ title: "Unknown Post" }); }
    };
    fetchPost();
  }, [item.postId]);

  const handleUpdate = async () => {
    try {
      await api.post('/Comment', { id: item.id, comment: editedText, postId: item.postId });
      setIsEditing(false);
      refresh();
    } catch (err) { alert("Update failed"); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Move this comment to deleted history?")) return;
    try {
      const response = await api.delete(`/Comment/my-comment/${item.id}`);
      console.log(response.data);
      if (response.status === 200 || response.status === 204) {
        refresh();
      }
    } catch (err) { 
      console.error("Delete error:", err);
      alert("Error deleting comment. Check console for details."); 
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm flex justify-between items-center transition-all">
      <div className="flex-1">
        <div className="mb-2 flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
            Post: {post?.title || "Loading..."}
          </span>
          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
            item.isDeleted === 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          }`}>
            {item.isDeleted === 0 ? 'Active' : 'Deleted'}
          </span>
        </div>

        {isEditing ? (
          <div className="flex gap-2 items-center">
            <input 
              className="flex-1 border-b-2 border-blue-500 py-1 text-gray-800 italic outline-none bg-blue-50/30 px-2"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              autoFocus
            />
            <button onClick={handleUpdate} className="text-blue-600 text-xs font-bold px-2">Save</button>
            <button onClick={() => setIsEditing(false)} className="text-gray-400 text-xs font-bold px-2">Cancel</button>
          </div>
        ) : (
          <h2 className={`text-gray-800 font-medium italic ${item.isDeleted === 1 ? 'opacity-50' : ''}`}>
            "{item.comment}"
          </h2>
        )}
        
        <div className="mt-3 text-[10px] text-gray-400 font-bold uppercase">
          {new Date(item.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex gap-2 ml-6 shrink-0">
        {item.isDeleted === 0 && (
          <>
            <button onClick={() => setIsEditing(true)} className="text-blue-600 border border-blue-600 px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-50">
              Edit
            </button>
            <button onClick={handleDelete} className="text-red-500 border border-red-500 px-3 py-1.5 rounded text-xs font-bold hover:bg-red-50">
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default MyComments;