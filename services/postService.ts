// services/postService.ts
import axios from 'axios';
import { createSupabaseClient } from '@/lib/supabase';

const API_URL = process.env.NEXT_PUBLIC_API_URL;
// Create axios instance
const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests automatically
api.interceptors.request.use(
  async (config) => {
    const supabase = createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const supabase = createSupabaseClient();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        error.config.headers.Authorization = `Bearer ${session.access_token}`;
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);

export interface PostImage {
  id: number;
  postId: number;
  url: string;
  order: number;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  name: string;
  email?: string;
  comment: string;
  created_at: string;
  user_id?: string;
}

export interface Post {
  id: number;
  title: string;
  description: string;
  created_at: string;
  images?: { url: string }[];
  videoUrl?: string;
  youtubeUrl?: string;
  videoCaption?: string;
  likesCount: number;
  comments: Comment[];
}

export interface CreatePostData {
  title: string;
  description: string;
  images: File[];
  video?: File;
  youtubeUrl?: string;
  videoCaption?: string;
}

export const postService = {
  // Get paginated posts
  async getPaginatedPosts(page: number = 1, limit: number = 10): Promise<{ posts: Post[], total: number }> {
    try {
      const response = await api.get('/posts');
      const allPosts = response.data as Post[];
      
      const sortedPosts = allPosts.sort((a: Post, b: Post) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = sortedPosts.slice(startIndex, endIndex);
      const total = sortedPosts.length;
      
      return {
        posts: paginatedPosts,
        total
      };
    } catch (error) {
      console.error("Error in getPaginatedPosts:", error);
      throw error;
    }
  },

  // Get all posts
  async getAllPosts(): Promise<Post[]> {
    try {
      const response = await api.get('/posts');
      return response.data;
    } catch (error) {
      console.error("Error in getAllPosts:", error);
      throw error;
    }
  },

  // Get single post
  // services/postService.ts
// Update the getPost method with better error handling

async getPost(id: number): Promise<Post> {
  try {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  } catch (error: any) {
    console.error("Error in getPost:", error);
    if (error.response?.status === 404) {
      throw new Error('Post not found');
    }
    throw error;
  }
},

  // Create post
  async createPost(data: CreatePostData): Promise<Post> {
    try {
      console.log("=== Creating Post ===");
      
      const formData = new FormData();
      
      formData.append('title', data.title);
      formData.append('description', data.description);
      
      if (data.videoCaption) {
        formData.append('video_caption', data.videoCaption);
      }

      if (data.youtubeUrl) {
        formData.append('youtube_url', data.youtubeUrl);
      }
      
      if (data.video) {
        formData.append('video', data.video);
      }
      
      data.images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.post;
      
    } catch (error) {
      console.error("❌ Error in createPost:", error);
      throw error;
    }
  },

  // Update post
  async updatePost(id: number, data: Partial<CreatePostData>): Promise<void> {
    try {
      const formData = new FormData();
      
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.videoCaption) formData.append('video_caption', data.videoCaption);
      if (data.youtubeUrl) formData.append('youtube_url', data.youtubeUrl);
      if (data.video) formData.append('video', data.video);
      
      if (data.images) {
        data.images.forEach((image, index) => {
          formData.append(`image${index}`, image);
        });
      }

      await api.put(`/posts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
    } catch (error) {
      console.error("❌ Error in updatePost:", error);
      throw error;
    }
  },

  // Delete post
  async deletePost(id: number): Promise<void> {
    try {
      await api.delete(`/posts/${id}`);
    } catch (error) {
      console.error("❌ Error in deletePost:", error);
      throw error;
    }
  },

  // Like post
  async likePost(id: number): Promise<{ likesCount: number }> {
    try {
      const response = await api.post(`/posts/${id}/like`);
      return response.data;
    } catch (error) {
      console.error("❌ Error in likePost:", error);
      throw error;
    }
  },

  // Add comment
  async addComment(postId: number, name: string, comment: string): Promise<Comment> {
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        name,
        comment,
      });
      return response.data.comment;
    } catch (error) {
      console.error("❌ Error in addComment:", error);
      throw error;
    }
  },

  // Delete comment
  async deleteComment(commentId: number): Promise<void> {
    try {
      await api.delete(`/comments/${commentId}`);
    } catch (error) {
      console.error("❌ Error in deleteComment:", error);
      throw error;
    }
  },

  // Admin: Get notifications
 // services/postService.ts

// Admin: Get notifications

async getAdminNotifications(): Promise<{ notifications: any[] }> {
  try {
    // Don't manually add token here - the interceptor handles it
    const response = await api.get('/admin/notifications');
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
},
  // Admin: Mark notification as read
  async markNotificationAsRead(id: number): Promise<void> {
    try {
      await api.patch(`/admin/notifications/${id}/read`);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  },

  // Admin: Mark all notifications as read
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await api.patch('/admin/notifications/read-all');
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  },

  // Admin: Get post comments with replies
  async getPostComments(postId: number): Promise<{ comments: any[] }> {
    try {
      const response = await api.get(`/admin/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw error;
    }
  },

  // Admin: Reply to comment
  async replyToComment(commentId: number, reply: string): Promise<any> {
    try {
      const response = await api.post(`/admin/comments/${commentId}/reply`, 
        { reply },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error replying to comment:", error);
      throw error;
    }
  },
};