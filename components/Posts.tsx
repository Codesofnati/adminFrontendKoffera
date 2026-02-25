// components/Posts.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { postService, Post } from '@/services/postService';
import { PostCard } from '@/components/PostCard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { FiEdit3, FiBook, FiPlus, FiChevronLeft, FiChevronRight, FiChevronsLeft, FiChevronsRight } from 'react-icons/fi';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Add ref for the top of the content
  const topRef = useRef<HTMLDivElement>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const postsPerPage = 10;

  // Listen for custom event to open modal
  useEffect(() => {
    const handleOpenCreateModal = () => {
      setIsCreateModalOpen(true);
    };

    window.addEventListener('openCreatePostModal', handleOpenCreateModal);

    return () => {
      window.removeEventListener('openCreatePostModal', handleOpenCreateModal);
    };
  }, []);

  const loadPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      const { posts: paginatedPosts, total } = await postService.getPaginatedPosts(page, postsPerPage);
      setPosts(paginatedPosts);
      setTotalPosts(total);
      setTotalPages(Math.ceil(total / postsPerPage));
      
      // Scroll to top after posts are loaded
      setTimeout(() => {
        if (topRef.current) {
          topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      toast.error('Failed to load stories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(currentPage);
  }, [currentPage]);

  const handleDeletePost = async (id: number) => {
    try {
      await postService.deletePost(id);
      toast.success('Story deleted');
      if (posts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        loadPosts(currentPage);
      }
    } catch (error) {
      toast.error('Failed to delete story');
    }
  };

  const handleLikePost = async (id: number) => {
    try {
      const { likesCount } = await postService.likePost(id);
      setPosts(posts.map(post => 
        post.id === id ? { ...post, likesCount } : post
      ));
    } catch (error) {
      toast.error('Failed to like story');
    }
  };

  const handleAddComment = async (postId: number, name: string, comment: string) => {
    try {
      const newComment = await postService.addComment(postId, name, comment);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      ));
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      await postService.deleteComment(commentId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments.filter(c => c.id !== commentId) }
          : post
      ));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers
  const getPageNumbers = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50">
      {/* Hidden anchor at the top for scrolling */}
      <div ref={topRef} className="absolute top-0 left-0 w-0 h-0" />
      
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 10px 30px -10px rgba(0,0,0,0.2)',
            borderRadius: '12px',
          },
        }}
      />
      
      {/* Stories Feed */}
      <div className="container ">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiBook className="w-8 h-8 text-emerald-600 animate-pulse" />
              </div>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center bg-white rounded-3xl shadow-xl p-16 border border-emerald-100"
          >
            <div className="text-8xl mb-6">📖</div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">No Stories Yet</h3>
            <p className="text-gray-600 mb-8 text-lg">
              Every great story begins with a single word. Start writing your first post today.
            </p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <FiEdit3 className="w-5 h-5" />
              Begin Your Story
            </button>
          </motion.div>
        ) : (
          <>
            <div className="space-y-8 ">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={handleDeletePost}
                  onLike={handleLikePost}
                  onAddComment={handleAddComment}
                  onDeleteComment={handleDeleteComment}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-lg border border-emerald-100">
                  {/* First Page */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-xl transition-all ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <FiChevronsLeft className="w-5 h-5" />
                  </motion.button>

                  {/* Previous Page */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-xl transition-all ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </motion.button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 px-2">
                    {getPageNumbers().map((page, index) => (
                      <div key={index}>
                        {page === '...' ? (
                          <span className="px-3 py-2 text-gray-400">...</span>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => goToPage(page as number)}
                            className={`w-10 h-10 rounded-xl font-medium transition-all ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                          >
                            {page}
                          </motion.button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Next Page */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-xl transition-all ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </motion.button>

                  {/* Last Page */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-xl transition-all ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <FiChevronsRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Posts Counter */}
            <div className="text-center mt-4 text-sm text-emerald-600">
              Showing {posts.length} of {totalPosts} stories
            </div>
          </>
        )}
      </div>

      {/* Create Post Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          loadPosts(1);
          setCurrentPage(1);
        }}
      />
    </div>
  );
}