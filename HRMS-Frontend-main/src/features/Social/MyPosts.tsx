import React, { useEffect, useState, useMemo } from 'react';
import api from '../auth/api/axios';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "https://localhost:7035";
const IMAGE_PATH = "/content/achievements";

const MyPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'visible' | 'hidden'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [postToDelete, setPostToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const fetchMyPosts = async () => {
    try {
      const response = await api.get('/Posts/user/history');
      setPosts(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Fetch error", err);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };
  const handleBack = () =>{
    navigate(-1);
  }

  const handleDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/Posts/my-post/${postToDelete}`);
      
      setPosts(prev => prev.filter(p => p.id !== postToDelete));
      
      setPostToDelete(null);
      alert("Post has been moved to your hidden history.");
    } catch (err) {
      alert("Error hiding post.");
    } finally {
      setIsDeleting(false);
    }
  };
const handleRestore = async (postId: number) => {
  try {
    await api.put(`/Posts/restore/${postId}`);
    setPosts(prev => prev.map(p => 
      p.id === postId ? { ...p, isVisible: true } : p
    ));
    
      alert("Post has been restored to the public feed.");
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert("Cannot Restore: This post was removed by HR for policy violations. Please contact the HR department.");
      } else if (err.response?.status === 404) {
        alert("Post not found.");
      } else {
        alert("An unexpected error occurred while restoring the post.");
      }
    console.error("Restore error info:", err);
  }
};

  useEffect(() => { fetchMyPosts(); }, []);

  const filteredPosts = useMemo(() => {
    if (activeFilter === 'visible') return posts.filter(p => p.isVisible);
    if (activeFilter === 'hidden') return posts.filter(p => !p.isVisible);
    return posts;
  }, [posts, activeFilter]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('Id', editingPost?.id?.toString() || '');
    formData.append('Title', editingPost?.title || '');
    formData.append('Description', editingPost?.description || '');
    selectedFiles.forEach(file => formData.append('Images', file));

    try {
      await api.post('/Posts/upsert', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setIsModalOpen(false);
      setSelectedFiles([]);
      fetchMyPosts();
      alert("Post updated successfully");
    } catch (err) { alert("Update failed"); }
  };

  if (loading) return <div className="p-10 text-center text-gray-400 animate-pulse">Loading your history...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-5 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Contributions</h1>
          <p className="text-sm text-gray-500">Manage and edit your published achievements</p>
        </div>
        <button onClick={() => handleBack()} className='underline text-blue-500'>Back</button>
        <div className="flex gap-2 bg-gray-50 p-1 rounded-md border border-gray-200">
          {(['all', 'visible', 'hidden'] as const).map((f) => (
            <button  key={f} onClick={() => setActiveFilter(f)} className={`px-4 py-1.5 rounded text-sm font-bold capitalize transition-all ${
                activeFilter === f ? 'bg-blue-600 text-white shadow-sm'  : 'text-gray-500 hover:text-gray-700'}`}> {f}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.length === 0 ? (
           <div className="col-span-full text-center py-20 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
             No posts found in this category.
           </div>
        ) : filteredPosts.map((post) => (
          <div key={post.id} className="group bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col">
            <div className="aspect-square w-full bg-gray-100 relative overflow-hidden">
              {post.imageUrls?.length > 0 ? (
                <img 
                  src={`${API_BASE_URL}${IMAGE_PATH}/${post.imageUrls[0]}`} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 italic text-xs">No Image</div>
              )}
              
              <div className="absolute top-3 left-3">
                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider shadow-sm ${
                  post.isVisible ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {post.isVisible ? 'Active' : 'Hidden'}
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <div className="mb-3">
                <h3 className="font-bold text-gray-800 line-clamp-1">{post.title}</h3>
                <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">{post.description}</p>
              </div>

              <div className="mt-auto pt-3 border-t border-gray-50 flex items-center justify-between">
                <div className="flex items-center gap-3 text-[11px] font-bold text-gray-400 uppercase">
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1">👍 {post.postInteraction?.likeCount || 0}</span>
                </div>
                
                <button onClick={() => { setEditingPost(post); setIsModalOpen(true); }} 
                  className="bg-white hover:bg-gray-50 text-blue-600 border border-blue-600 px-3 py-1 rounded text-xs font-bold transition-colors" >
                  Edit Post
                </button>

               {post.isVisible ? (
                   <button onClick={() => setPostToDelete(post.id)} className="bg-white hover:bg-red-50 text-red-500 border border-red-500 px-3 py-1 rounded text-xs font-bold transition-colors" > Delete </button>
                   ):(
                  <button onClick={() => handleRestore(post.id)} className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-bold transition-colors shadow-sm"> Restore </button>
                 )}

              </div>
            </div>

          </div>
        ))}
      </div>

      {postToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-2xl border border-gray-200 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Delete Achievement?</h3>
            <p className="text-gray-500 text-sm mt-2">
              This action cannot be undone. This post and all its images will be permanently removed.
            </p>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded shadow-sm disabled:bg-gray-400"
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button 
                onClick={() => setPostToDelete(null)}
                className="flex-1 bg-white text-gray-500 font-bold py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && editingPost && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-2xl border border-gray-200">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Edit Achievement</h2>
                <button onClick={() => setIsModalOpen(false)} className="bg-red-500 text-white px-4 py-1.5 rounded text-sm font-bold hover:bg-red-600 transition">Close</button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1">Post Title</label>
                <input 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" 
                    value={editingPost.title || ''} 
                    onChange={e => setEditingPost({...editingPost, title: e.target.value})} 
                    required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1">Description</label>
                <textarea 
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm h-32 focus:ring-1 focus:ring-blue-500 outline-none resize-none" 
                    value={editingPost.description || ''} 
                    onChange={e => setEditingPost({...editingPost, description: e.target.value})} 
                    required 
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 mb-1 ml-1">Add New Images</label>
                <input 
                    type="file" 
                    multiple 
                    onChange={e => setSelectedFiles(Array.from(e.target.files || []))} 
                    className="w-full border border-gray-300 rounded-md px-3 py-1.5 text-xs file:mr-4 file:py-1 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700" 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded shadow-sm transition-all">Save Changes</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-white text-gray-500 font-bold py-2 px-6 border border-gray-300 rounded hover:bg-gray-50">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyPosts;