import axios from 'axios';

const API_URL = 'https://backend.koffera.workers.dev';

export interface PostImage {
  id: number;
  postId: number;
  url: string;
  order: number;
  created_at: string;
}

// services/postService.ts or types/post.ts

export interface Comment {
  id: number;
  post_id: number;
  name: string;
  email?: string;
  comment: string;
  created_at: string;
  user_id?: string; // Add this optional field
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
      const response = await axios.get(`${API_URL}/posts`);
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
      const response = await axios.get(`${API_URL}/posts`);
      return response.data;
    } catch (error) {
      console.error("Error in getAllPosts:", error);
      throw error;
    }
  },

  // Get single post
  async getPost(id: number): Promise<Post> {
    try {
      const response = await axios.get(`${API_URL}/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error in getPost:", error);
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
  formData.append('video_caption', data.videoCaption); // FIXED
}

if (data.youtubeUrl) {
  formData.append('youtube_url', data.youtubeUrl); // FIXED
}
      
      if (data.video) {
        formData.append('video', data.video);
      }
      
      data.images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      const response = await axios.post(`${API_URL}/posts`, formData, {
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

      await axios.put(`${API_URL}/posts/${id}`, formData, {
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
      await axios.delete(`${API_URL}/posts/${id}`);
    } catch (error) {
      console.error("❌ Error in deletePost:", error);
      throw error;
    }
  },

  // Like post
  async likePost(id: number): Promise<{ likesCount: number }> {
    try {
      const response = await axios.post(`${API_URL}/posts/${id}/like`);
      return response.data;
    } catch (error) {
      console.error("❌ Error in likePost:", error);
      throw error;
    }
  },

  // Add comment
  async addComment(postId: number, name: string, comment: string): Promise<Comment> {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/comments`, {
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
      await axios.delete(`${API_URL}/comments/${commentId}`);
    } catch (error) {
      console.error("❌ Error in deleteComment:", error);
      throw error;
    }
  },
};