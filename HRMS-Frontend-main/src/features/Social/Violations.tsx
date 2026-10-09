import React, { useEffect, useState } from 'react';
import api from '../auth/api/axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "https://localhost:7035";
const IMAGE_PATH = "/content/achievements";

const Violations = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
  const fetchModeratedHistory = async () => {
    try {
      const response = await api.get('/Posts/moderated-history');
      setPosts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching violations:", err);
    } finally {
      setLoading(false);
    }
  };
    const handleBack = () =>{
    navigate(-1);
  }

    const handleRestore = async (postId: number) => {
    try {
        const response = await api.put(`/Posts/hr-restore/${postId}`);
        
        if (response.status === 200) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        alert(response.data); 
        }
    } catch (err) {
        console.error("Restore error", err);
        alert("Failed to restore post.");
    }
    };

  useEffect(() => {
    fetchModeratedHistory();
  }, []);

  if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse">Loading moderation logs...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Moderation Logs</h1>
        <p className="text-sm text-gray-500">History of posts you have hidden due to violations</p>
          <button onClick={() => handleBack()} className='underline text-blue-500'>Back</button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
          No moderated posts found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
              <div className="aspect-video w-full bg-gray-100 relative">
                {post.imageUrls?.length > 0 ? (
                  <img 
                    src={`${API_BASE_URL}${IMAGE_PATH}/${post.imageUrls[0]}`} 
                    alt={post.title} 
                    className="w-full h-full object-cover grayscale" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-xs">No Image</div>
                )}
                <div className="absolute top-3 right-3">
                  <span className="px-2 py-1 rounded bg-red-100 text-red-700 text-[10px] font-bold uppercase">Hidden by You</span>
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <div className="mb-3">
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-tight bg-blue-50 px-2 py-0.5 rounded">
                    Author: {post.authorName || 'Unknown'}
                  </span>
                  <h3 className="font-bold text-gray-800 mt-1 line-clamp-1">{post.title}</h3>
                  <p className="text-gray-500 text-xs mt-1 line-clamp-2">{post.description}</p>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-400 uppercase">
                    Removed on {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                  
                  <button 
                    onClick={() => handleRestore(post.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-xs font-bold transition-all shadow-sm"
                  >
                    Restore Post
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Violations;