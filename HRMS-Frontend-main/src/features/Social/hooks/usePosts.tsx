import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import api from '../../auth/api/axios';

export interface PostInteractionDisplayDto {
  postId: number;
  likeCount: number;
  celebrateCount: number;
  loveCount: number;
  insightfulCount: number;
  commentCount: number;
  lastUpdatedAt: string;
}

export interface PostsDisplayDto {
  id: number;
  title: string;
  description: string;
  isSystemGenerated: boolean;
  authorName: string;
  imageUrls: string[];
  tagNames: string[];
  likeCount: number;
  commentCount: number;
  createdAt: string;
   interactions: PostInteractionDisplayDto | null;
}
const fetchPostsFeed = async ({ pageParam = 1 }): Promise<PostsDisplayDto[]> => {
  
  console.log('fetching page: ',pageParam);
  const response = await api.get<PostsDisplayDto[]>(`/Posts/feed`, {
    params: {
      pageNumber: pageParam,
      pageSize: 10,
    },
  });
  const posts = response.data;

 const postsWithCommentCounts = await Promise.all(
    posts.map(async (post) => {
      try {
        const countRes = await api.get<number>(`/Comment/commentcount/${post.id}`);
        
        return {
          ...post,
          commentCount: countRes.data 
        };
      } catch (error) {
        console.error(`Failed to fetch count for post ${post.id}`, error);
        return { ...post, commentCount: 0 }; 
      }
    })
  );

  return postsWithCommentCounts;
};

 const usePosts = () => {
  return useInfiniteQuery<PostsDisplayDto[], Error>({
    queryKey: ['posts-feed'],
    queryFn: fetchPostsFeed,
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === 10 ? allPages.length + 1 : undefined;
    },
  });
};

export default usePosts;