// app/admin/posts/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiMessageCircle, 
  FiHeart, 
  FiClock,
  FiUser,
  FiMail,
  FiSend,
  FiCheck,
  FiAlertCircle
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { postService, Post } from '@/services/postService';
import toast from 'react-hot-toast';

interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  name: string;
  email?: string;
  comment: string;
  created_at: string;
  is_admin_reply?: boolean;
  parent_comment_id?: number;
  replies?: Comment[];
}

export default function AdminPostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const commentId = searchParams.get('comment');
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  useEffect(() => {
    loadPostAndComments();
  }, [id]);

  const loadPostAndComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First try to load the post
      let postData = null;
      try {
        postData = await postService.getPost(Number(id));
        setPost(postData);
      } catch (postError: any) {
        console.error('Error loading post:', postError);
        if (postError.response?.status === 404) {
          setError('This post may have been deleted or does not exist.');
        } else {
          setError('Failed to load post. Please try again.');
        }
        // Still try to load comments even if post is missing
      }
      
      // Try to load comments
      try {
        const commentsData = await postService.getPostComments(Number(id));
        setComments(commentsData.comments || []);
      } catch (commentsError) {
        console.error('Error loading comments:', commentsError);
        if (!postData) {
          // If both post and comments fail, show error
          setError('Unable to load post data. It may have been deleted.');
        }
      }
      
      // Scroll to comment if commentId is provided
      if (commentId) {
        setTimeout(() => {
          const element = document.getElementById(`comment-${commentId}`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.classList.add('ring-2', 'ring-green-500', 'ring-offset-2');
            setTimeout(() => {
              element.classList.remove('ring-2', 'ring-green-500', 'ring-offset-2');
            }, 3000);
          } else {
            toast.error('Comment not found in this post');
          }
        }, 500);
      }
    } catch (error) {
      console.error('Error in loadPostAndComments:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (commentId: number) => {
    if (!replyText[commentId]?.trim()) {
      toast.error('Please write a reply');
      return;
    }

    try {
      await postService.replyToComment(commentId, replyText[commentId]);
      toast.success('Reply sent successfully');
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      setReplyingTo(null);
      loadPostAndComments(); // Reload to show new reply
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const CommentComponent = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => (
    <motion.div
      id={`comment-${comment.id}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-4 transition-all duration-300 ${depth > 0 ? 'ml-8' : ''}`}
    >
      <div className={`bg-white rounded-xl p-4 shadow-sm border ${
        comment.is_admin_reply 
          ? 'border-green-200 bg-green-50/30' 
          : 'border-gray-100'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md ${
              comment.is_admin_reply 
                ? 'bg-gradient-to-r from-green-700 to-green-900' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}>
              {comment.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800 text-sm">
                  {comment.name}
                </span>
                {comment.is_admin_reply && (
                  <span className="px-2 py-0.5 text-[10px] bg-green-100 text-green-700 rounded-full font-medium">
                    Admin
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                <FiClock className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                {comment.email && (
                  <>
                    <span>•</span>
                    <FiMail className="w-3 h-3" />
                    <span className="truncate max-w-[150px]">{comment.email}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <p className="text-gray-700 text-sm ml-11">
          {comment.comment}
        </p>

        {/* Reply button and form */}
        {!comment.is_admin_reply && (
          <div className="mt-3 ml-11">
            {replyingTo === comment.id ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={replyText[comment.id] || ''}
                  onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                  placeholder="Write your reply..."
                  className="flex-1 text-black px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  autoFocus
                />
                <button
                  onClick={() => handleReply(comment.id)}
                  className="px-3 py-2 bg-gradient-to-r from-green-700 to-green-900 text-white text-sm rounded-lg hover:shadow-lg transition-all flex items-center gap-1"
                >
                  <FiSend className="w-4 h-4" />
                  Send
                </button>
                <button
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText(prev => ({ ...prev, [comment.id]: '' }));
                  }}
                  className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-xs text-green-600 hover:text-green-700 font-medium flex items-center gap-1"
              >
                <FiMessageCircle className="w-3 h-3" />
                Reply as Admin
              </button>
            )}
          </div>
        )}

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-3">
            {comment.replies.map((reply) => (
              <CommentComponent key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-green-200 border-t-green-700 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FiMessageCircle className="w-8 h-8 text-green-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || (!post && comments.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FiAlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The post you are looking for does not exist or may have been deleted.'}
          </p>
          
          {comments.length > 0 && (
            <div className="mb-6 p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-yellow-700">
                <strong>Note:</strong> This post has {comments.length} comment(s) but the post itself is missing.
                You can still view and reply to comments below.
              </p>
            </div>
          )}
          
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push('/admin')}
              className="px-4 py-2 bg-gradient-to-r from-green-700 to-green-900 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FiArrowLeft /> Back to Dashboard
            </button>
            {comments.length > 0 && (
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                View Comments
              </button>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-green-600 transition-colors"
        >
          <FiArrowLeft /> Back
        </button>

        {/* Post Info - Only show if post exists */}
        {post && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
          >
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h1>
            <p className="text-gray-600 mb-4">{post.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FiHeart className="text-red-500" /> {post.likesCount} likes
              </span>
              <span className="flex items-center gap-1">
                <FiMessageCircle className="text-green-500" /> {comments.length} comments
              </span>
              <span className="flex items-center gap-1">
                <FiClock className="text-gray-400" /> Posted {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
            </div>
          </motion.div>
        )}

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiMessageCircle className="text-green-600" />
            Comments ({comments.length})
          </h2>

          {comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <FiMessageCircle className="w-10 h-10 text-green-500" />
              </div>
              <p className="text-gray-500">No comments yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentComponent key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}