import React, { useState } from 'react';
import usePosts, { type PostsDisplayDto } from './hooks/usePosts'
import { useNavigate } from 'react-router-dom';
import api from '../auth/api/axios';
import CommentModal from './CommentModal';

const API_BASE_URL = "https://localhost:7035";
const IMAGE_PATH = "/content/achievements";

const Social = () => {
  const navigate = useNavigate();
  const { data, fetchNextPage,isError, error, hasNextPage, isFetchingNextPage, isLoading , refetch} = usePosts();
  const posts = data?.pages.flat() || [];

  const [selectedPost, setSelectedPost] = useState<PostsDisplayDto | null>(null);
  const [postToDelete, setPostToDelete] = useState<PostsDisplayDto | null>(null);
  const [viewerData, setViewerData] = useState<{ urls: string[], index: number } | null>(null);
  const [deletionReason, setDeletionReason] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  const currentUser = localStorage.getItem('role');
  const isHR = (currentUser === 'HR');

  const filteredPosts = posts?.filter(post => {
  
    const matchesSearch = 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      post.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTag = selectedTag === '' || post.tagNames.includes(selectedTag);

    const postDate = new Date(post.createdAt).setHours(0, 0, 0, 0);
    const start = startDate ? new Date(startDate).setHours(0, 0, 0, 0) : null;
    const end = endDate ? new Date(endDate).setHours(23, 59, 59, 999) : null;
    
    const matchesDate = (!start || postDate >= start) && (!end || postDate <= end);

    return matchesSearch && matchesTag && matchesDate;
  });

  const allTags = Array.from(new Set(posts?.flatMap(p => p.tagNames) || []));

  const handleDeletePost = async () => {
    if (!postToDelete || !deletionReason.trim()) return;
    const currentUserId = parseInt(localStorage.getItem('id') || '0', 10);
    try {
      await api.delete(`/Posts/${postToDelete.id}`, {
        params: { userId: currentUserId, reason: deletionReason }
      });
      alert("Post Deleted");
      setPostToDelete(null);
      setDeletionReason('');
      refetch();
    } catch (err) {
      alert("Failed to delete post.");
    }
  };

  const handleReaction = async (postId: number, reactionType: string) => {
    try {
      await api.post('/Posts/react', {
        postId: postId,
        reactionType: reactionType,
        isActive: true
      });
      refetch();
    } catch (err) {
      console.error("Reaction failed:", err);
    }
  };

  if (isLoading) return <div className="flex justify-center items-center min-h-screen text-gray-400 animate-pulse">Loading feed...</div>;
  if (isError) return <div className="text-red-500 text-center p-10 font-medium">Error: {error.message}</div>;

return (
  <div className="bg-gray-150 min-h-screen">
    <div className="w-full bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          
          <div className="flex items-center justify-between min-w-[200px]">
            <h1  className="text-2xl font-bold mb-4">
              Community Feed
            </h1>
            <div className="flex gap-2 lg:hidden">
              <button 
                onClick={() => navigate('create')} 
                className="p-2 bg-blue-600 text-white rounded-lg shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-1">
              <input 
                type="text" 
                placeholder="Search titles or descriptions..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              />
            </div>

            <select 
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white text-gray-600"
            >
              <option value="">All Tags</option>
              {allTags.map(tag => <option key={tag} value={tag}>#{tag}</option>)}
            </select>

            <div className="md:col-span-2 flex items-center gap-2">
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600"
              />
              <span className="text-gray-400 text-[10px] font-bold uppercase">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs border border-gray-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-600"
              />
            </div>
          </div>

          <div className="hidden lg:flex items-center space-x-2 border-l pl-4 border-gray-100">
            <button 
              onClick={() => navigate('myposts')} 
              className="whitespace-nowrap text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all font-medium shadow-sm"
            >
              My Posts
            </button>
             <button 
              onClick={() => navigate('mycomments')} 
              className="whitespace-nowrap text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all font-medium shadow-sm"
            >
              My Comments
            </button>
            <button 
              onClick={() => navigate('create')} 
              className="whitespace-nowrap text-sm bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all font-medium shadow-sm"
            >
              Create Post
            </button>
            {isHR && (
            <button 
              onClick={() => navigate('manage-violations')} 
              className="whitespace-nowrap text-sm bg-amber-500 text-white px-4 py-2 rounded-md hover:bg-amber-600 transition-all font-medium shadow-sm flex items-center gap-2"
            >
              Manage Violations
            </button>
          )}
          </div>
        </div>
        
        {(searchQuery || selectedTag || startDate || endDate) && (
          <button 
            onClick={() => { setSearchQuery(''); setSelectedTag(''); setStartDate(''); setEndDate(''); }}
            className="mt-3 text-[10px] text-blue-600 font-bold uppercase tracking-wider flex items-center gap-1"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>

    <div className="max-w-xl mx-auto px-4 py-10 space-y-8">
      {filteredPosts?.map((post) => (
        <div key={post.id} className="bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden p-3">
          
          <div className="flex items-center justify-between p-4 pb-2">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold border border-indigo-100">
                {post.authorName[0]?.toUpperCase()}
              </div>
              <div className="ml-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-gray-900">{post.authorName}</p>
                  {post.isSystemGenerated && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">System</span>
                  )}
                </div>
                <p className="text-[11px] text-gray-400 uppercase tracking-tight">{new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            
            {isHR && (
              <button onClick={() => setPostToDelete(post)} className="text-gray-300 hover:text-red-500 transition-colors p-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>

          <div className="px-4 py-2">
            <h3 className="font-bold text-gray-800 text-lg leading-tight">{post.title}</h3>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">{post.description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {post.tagNames.map((tag, idx) => (
                <span key={idx} className="text-blue-500 text-xs font-medium bg-blue-50/50 px-2 py-0.5 rounded">#{tag}</span>
              ))}
            </div>
          </div>

          {post.imageUrls.length > 0 && (
            <div className="mt-3 relative bg-gray-50 border-y border-gray-50">
              <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide gap-1">
                {post.imageUrls.map((url, index) => (
                  <div 
                    key={index} 
                    className="snap-center shrink-0 w-full cursor-zoom-in relative group"
                    onClick={() => setViewerData({ urls: post.imageUrls, index: index })}
                  >
                    <img 
                      src={`${API_BASE_URL}${IMAGE_PATH}/${url}`} 
                      alt="Post media" 
                      className="w-full h-80 object-cover group-hover:brightness-95 transition-all" 
                    />
                    {post.imageUrls.length > 1 && (
                      <div className="absolute top-4 right-4 bg-black/60 text-white px-2 py-1 rounded-full text-[10px] font-medium backdrop-blur-sm">
                        {index + 1} / {post.imageUrls.length}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-1 p-2 px-4 mt-2 border-t border-gray-50">
            <div className="flex items-center space-x-1">
              <ReactionBtn count={post.postInteraction?.likeCount} emoji="👍" onClick={() => handleReaction(post.id, "Like")} />
              <ReactionBtn count={post.postInteraction?.celebrateCount} emoji="👏" onClick={() => handleReaction(post.id, "Celebrate")} />
              <ReactionBtn count={post.postInteraction?.loveCount} emoji="❤️" onClick={() => handleReaction(post.id, "Love")} />
              <ReactionBtn count={post.postInteraction?.insightfulCount} emoji="💡" onClick={() => handleReaction(post.id, "Insightful")} />
            </div>
            
            <button 
              onClick={() => setSelectedPost(post)}
              className="flex items-center text-gray-400 hover:text-blue-500 transition-colors ml-auto p-2"
            >
              <span className="text-lg mr-1.5">💬</span>
              <span>{post.commentCount}</span>
            </button>
          </div>
        </div>
      ))}
      
      {filteredPosts?.length === 0 && (
        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-200 text-gray-400">
          No posts found matching those filters.
        </div>
      )}
    </div>

    {viewerData && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4" onClick={() => setViewerData(null)}>
        <button className="absolute top-8 right-8 text-white text-3xl font-light">&times;</button>
        {viewerData.index > 0 && (
          <button className="absolute left-4 text-white p-4 text-4xl" onClick={(e) => { e.stopPropagation(); setViewerData({...viewerData, index: viewerData.index - 1})}}>&#10094;</button>
        )}
        <img src={`${API_BASE_URL}${IMAGE_PATH}/${viewerData.urls[viewerData.index]}`} className="max-w-full max-h-full object-contain" alt="Preview" onClick={(e) => e.stopPropagation()} />
        {viewerData.index < viewerData.urls.length - 1 && (
          <button className="absolute right-4 text-white p-4 text-4xl" onClick={(e) => { e.stopPropagation(); setViewerData({...viewerData, index: viewerData.index + 1})}}>&#10095;</button>
        )}
      </div>
    )}

    {selectedPost && <CommentModal post={selectedPost} onClose={() => setSelectedPost(null)} isHR={isHR} />}

    {postToDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-[2px] p-4">
        <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
          <div className="p-6">
            <h2 className="font-bold text-gray-800 text-xl mb-2 text-center">Delete Post?</h2>
            <p className="text-gray-500 text-sm text-center mb-6">This action will notify the user and cannot be undone.</p>
            <textarea
              value={deletionReason}
              onChange={(e) => setDeletionReason(e.target.value)}
              placeholder="Reason for deletion..."
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:outline-none bg-gray-50"
              rows={3}
            />
          </div>
          <div className="flex border-t">
            <button onClick={() => { setPostToDelete(null); setDeletionReason(''); }} className="flex-1 px-4 py-3 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors">Keep Post</button>
            <button onClick={handleDeletePost} disabled={!deletionReason.trim()} className="flex-1 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors border-l disabled:opacity-30">Delete</button>
          </div>
        </div>
      </div>
    )}
     <div className="flex flex-col items-center pt-6 pb-12">
        {hasNextPage ? (
          <button  onClick={() => fetchNextPage()} disabled={isFetchingNextPage} className="flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-full hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50" >
            {isFetchingNextPage ? (
              <>
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                Loading...
              </>
            ) : (
              'Show More Posts'
            )}
          </button>
        ) : posts.length > 0 ? (
          <p className="text-gray-400 text-sm font-medium">You've reached the end of the feed.</p>
        ) : null}
      </div>
  </div>
);
};

const ReactionBtn = ({ emoji, count, onClick }: { emoji: string, count?: number, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="flex items-center px-2 py-1.5 rounded-md hover:bg-gray-50 transition-all active:scale-90 group"
  >
    <span className="text-lg mr-1 group-hover:scale-110 transition-transform">{emoji}</span>
    <span className="text-xs font-bold text-gray-500">{count || 0}</span>
  </button>
);

export default Social;