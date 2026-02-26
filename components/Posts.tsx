'use client';

import { useState, useEffect, useRef } from 'react';
import { postService, Post } from '@/services/postService';
import { PostCard } from '@/components/PostCard';
import { CreatePostModal } from '@/components/CreatePostModal';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { 
  FiEdit3, 
  FiBook, 
  FiPlus, 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronsLeft, 
  FiChevronsRight,
  FiCoffee
} from 'react-icons/fi';
import { 
  GiCoffeeBeans, 
  GiCoffeeCup 
} from 'react-icons/gi';
import { useScroll, useTransform } from 'framer-motion';

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Add ref for the top of the content
  const topRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const postsPerPage = 10;

  // Scroll animations
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  // Generate particles
  const [particles, setParticles] = useState<{ id: number; x: number; y: number; size: number; duration: number; delay: number }[]>([]);
  
  useEffect(() => {
    const generated = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 8 + 2,
      duration: Math.random() * 15 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(generated);
  }, []);

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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div
      ref={sectionRef}
      className="relative w-full min-h-screen bg-gradient-to-b from-white via-emerald-50/20 to-white py-24 px-5 md:px-16 overflow-hidden"
    >
      {/* Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-gradient-to-r from-emerald-200/20 to-green-200/20"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              x: [0, 30, -30, 0],
              y: [0, -30, 30, 0],
              scale: [1, 1.5, 0.8, 1],
              opacity: [0.1, 0.3, 0.1, 0.1],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
            y: [0, -20, 0]
          }}
          transition={{ duration: 15, repeat: Infinity }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-96 h-96 bg-green-100 rounded-full blur-3xl opacity-20"
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -30, 0],
            y: [0, 20, 0]
          }}
          transition={{ duration: 18, repeat: Infinity }}
        />
        
        {/* Coffee Elements */}
        <div className="absolute top-40 right-1/4 opacity-[0.03] rotate-12">
          <GiCoffeeBeans className="w-48 h-48 text-emerald-800" />
        </div>
        <div className="absolute bottom-40 left-1/4 opacity-[0.03] -rotate-12">
          <GiCoffeeCup className="w-48 h-48 text-green-800" />
        </div>
      </div>

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
      
      <div className="relative max-w-7xl mx-auto z-10">
        {/* Header Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          className="text-center mb-16"
          style={{ y: backgroundY }}
        >
          {/* Icon Badge */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex justify-center mb-6"
          >
            <div className="relative group">
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-xl"
                animate={{ 
                  scale: [1, 1.3, 1],
                  opacity: [0.4, 0.6, 0.4]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              <div className="relative bg-white p-5 rounded-2xl shadow-xl group-hover:shadow-2xl transition-shadow">
                <FiBook className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-4"
          >
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 bg-clip-text text-transparent bg-[length:200%] animate-gradient">
              Posts
            </span>
          </motion.h1>

          {/* Animated Underline */}
          <motion.div 
            className="w-24 h-1 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-400 mx-auto mb-6 rounded-full"
            animate={{ 
              x: [-10, 10, -10],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          />

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="text-gray-600 text-lg max-w-2xl mx-auto relative"
          >
            <motion.span
              className="absolute -left-8 top-1/2 -translate-y-1/2 text-emerald-300"
              animate={{ x: [-5, 0, -5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦
            </motion.span>
            Discover and share the finest coffee experiences
            <motion.span
              className="absolute -right-8 top-1/2 -translate-y-1/2 text-green-300"
              animate={{ x: [5, 0, 5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✦
            </motion.span>
          </motion.p>

          {/* Decorative Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 h-1 bg-emerald-300 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
              />
            ))}
          </div>
        </motion.div>
      
        {/* Stories Feed */}
        <div className="container mx-auto">
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
              className="max-w-2xl mx-auto text-center bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-16 border border-emerald-100"
            >
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-xl opacity-30" />
                <div className="relative text-8xl">📖</div>
              </div>
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
              <div className="space-y-8">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PostCard
                      post={post}
                      onDelete={handleDeletePost}
                      onLike={handleLikePost}
                      onAddComment={handleAddComment}
                      onDeleteComment={handleDeleteComment}
                    />
                  </motion.div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-12 flex justify-center"
                >
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl shadow-xl border border-emerald-100">
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
                              className={`relative w-10 h-10 rounded-xl font-medium transition-all ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
                                  : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                              }`}
                            >
                              {currentPage === page && (
                                <motion.div
                                  className="absolute inset-0 rounded-xl bg-white/20"
                                  layoutId="paginationActive"
                                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                              )}
                              <span className="relative">{page}</span>
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
                </motion.div>
              )}

              {/* Posts Counter */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center mt-8 text-sm text-emerald-600 flex items-center justify-center gap-2"
              >
                <FiCoffee className="w-4 h-4 text-amber-600/60" />
                <span>Showing {posts.length} of {totalPosts} stories</span>
                <FiCoffee className="w-4 h-4 text-amber-600/60" />
              </motion.div>

              {/* Decorative Bottom Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 text-center"
              >
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/50 backdrop-blur-sm rounded-full shadow-lg border border-emerald-100">
                  <GiCoffeeBeans className="w-5 h-5 text-amber-600/60" />
                  <span className="text-sm text-emerald-700/80 font-medium">
                    ✦ Ethiopian Coffee Culture ✦
                  </span>
                  <GiCoffeeBeans className="w-5 h-5 text-amber-600/60" />
                </div>
              </motion.div>
            </>
          )}
        </div>
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

      <style jsx>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
          background-size: 200% 200%;
        }
      `}</style>
    </div>
  );
}