'use client';

import { useState, useEffect, useRef } from 'react';
import { Post } from '@/services/postService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, 
  FiMessageCircle, 
  FiBookmark, 
  FiShare2, 
  FiMoreHorizontal, 
  FiX, 
  FiYoutube, 
  FiTrash2, 
  FiEdit2, 
  FiUser,
  FiClock,
  FiFilm,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiCamera,
  FiVideo,
  FiAlertTriangle,
  FiCheckCircle
} from 'react-icons/fi';
import { FaPlay, FaRegSmile, FaRegHeart, FaHeart, FaRegBookmark, FaBookmark } from 'react-icons/fa';
import { GiCoffeeBeans } from 'react-icons/gi';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import toast from 'react-hot-toast';

interface PostCardProps {
  post: Post;
  onDelete: (id: number) => void;
  onLike: (id: number) => void;
  onAddComment: (postId: number, name: string, comment: string) => void;
  onDeleteComment: (postId: number, commentId: number) => void;
}

// User profile data
const USER = {
  name: "Firaol K. Reggasa",
  image: "https://udyjiyiuzaxognnkzxjg.supabase.co/storage/v1/object/public/images/founder/founder-1769290259573.jpg",
  role: "Founder"
};

export const PostCard = ({ post, onDelete, onLike, onAddComment }: PostCardProps) => {
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getYoutubeEmbedUrl = (url: string): string | undefined => {
    if (!url) return undefined;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
    }
    return undefined;
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    
    // Optimistic update
    const wasLiked = post.likesCount > 0;
    
    try {
      await onLike(post.id);
      toast.success(
        <div className="flex items-center gap-2">
          <FiHeart className="w-4 h-4 text-red-500" />
          <span>Post {wasLiked ? 'unliked' : 'liked'} successfully!</span>
        </div>,
        {
          icon: '❤️',
          style: {
            background: 'linear-gradient(to right, #fecaca, #fee2e2)',
            color: '#991b1b',
            border: '1px solid #fecaca',
          },
        }
      );
    } catch (error) {
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentName.trim() || !commentText.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      await onAddComment(post.id, commentName, commentText);
      setCommentName('');
      setCommentText('');
      
      toast.success(
        <div className="flex items-center gap-2">
          <FiMessageCircle className="w-4 h-4 text-emerald-600" />
          <span>Comment added successfully!</span>
        </div>,
        {
          icon: '💬',
          style: {
            background: 'linear-gradient(to right, #d1fae5, #a7f3d0)',
            color: '#065f46',
            border: '1px solid #a7f3d0',
          },
        }
      );
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDelete = async () => {
    try {
      await onDelete(post.id);
      setShowDeleteModal(false);
      toast.success(
        <div className="flex items-center gap-2">
          <FiTrash2 className="w-4 h-4 text-red-500" />
          <span>Post deleted successfully!</span>
        </div>,
        {
          icon: '🗑️',
          style: {
            background: 'linear-gradient(to right, #fee2e2, #fecaca)',
            color: '#991b1b',
            border: '1px solid #fecaca',
          },
        }
      );
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  // Build media array
  const allMedia = [
    ...(post.youtubeUrl ? [{ type: 'video' as const, url: post.youtubeUrl, caption: post.videoCaption }] : []),
    ...(post.videoUrl ? [{ type: 'video' as const, url: post.videoUrl, caption: post.videoCaption }] : []),
    ...(post.images?.map(img => ({ type: 'image' as const, url: img.url })) || [])
  ];

  const totalMedia = allMedia.length;
  const hasMedia = totalMedia > 0;

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % totalMedia);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
  };

  const UserProfile = () => (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 rounded-full blur-md opacity-70" />
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 ring-white shadow-xl">
          <Image
            src={USER.image}
            alt={USER.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg" />
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <h3 className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">
            {USER.name}
          </h3>
          <span className="self-start sm:self-auto px-3 py-1 text-[10px] sm:text-xs bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-full font-medium shadow-sm border border-emerald-200">
            {USER.role}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <FiClock className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );

  const MediaGallery = () => {
    if (!hasMedia) return null;

    return (
      <div className="px-3 sm:px-4">
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl border border-gray-200/20 group">
          <div className="relative aspect-[4/3] sm:aspect-video w-full">
            {allMedia[activeImageIndex].type === 'video' ? (
              <div className="relative w-full h-full">
                {allMedia[activeImageIndex].url.includes('youtube.com') || allMedia[activeImageIndex].url.includes('youtu.be') ? (
                  <>
                    <img
                      src={`https://img.youtube.com/vi/${allMedia[activeImageIndex].url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || ''}/maxresdefault.jpg`}
                      alt="Video thumbnail"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div 
                      onClick={() => setSelectedMedia(allMedia[activeImageIndex])}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                    >
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                        <div className="relative w-14 h-14 sm:w-20 sm:h-20 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                          <FaPlay className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600 ml-1" />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <video 
                    src={allMedia[activeImageIndex].url} 
                    className="w-full h-full object-cover"
                    onClick={() => setSelectedMedia(allMedia[activeImageIndex])}
                  />
                )}
              </div>
            ) : (
              <>
                <Image
                  src={allMedia[activeImageIndex].url}
                  alt="Post media"
                  fill
                  className="object-cover cursor-pointer"
                  onClick={() => setSelectedMedia(allMedia[activeImageIndex])}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </>
            )}

            {totalMedia > 1 && (
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 shadow-lg flex items-center gap-1">
                <FiCamera className="w-3 h-3" />
                {activeImageIndex + 1} / {totalMedia}
              </div>
            )}

            {allMedia[activeImageIndex].type === 'video' && (
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 shadow-lg flex items-center gap-1">
                <FiVideo className="w-3 h-3" />
                Video
              </div>
            )}

            {totalMedia > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/20 shadow-xl ${
                    isMobile ? 'flex' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/20 shadow-xl ${
                    isMobile ? 'flex' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </div>

          {totalMedia > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide bg-gradient-to-r from-gray-50 to-white border-t border-gray-200/50">
              {allMedia.map((media, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all ${
                    idx === activeImageIndex 
                      ? 'ring-3 ring-emerald-500 shadow-xl scale-105' 
                      : 'opacity-60 hover:opacity-100 ring-1 ring-gray-300'
                  }`}
                >
                  {media.type === 'video' ? (
                    <div className="relative w-full h-full bg-gray-900">
                      {media.url.includes('youtube.com') || media.url.includes('youtu.be') ? (
                        <img
                          src={`https://img.youtube.com/vi/${media.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || ''}/default.jpg`}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                          <FiFilm className="w-5 h-5 text-white/70" />
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <div className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center">
                          <FaPlay className="w-2.5 h-2.5 text-emerald-600 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={media.url}
                      alt="Thumbnail"
                      fill
                      className="object-cover"
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <motion.article
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onHoverStart={() => setHoveredCard(true)}
        onHoverEnd={() => setHoveredCard(false)}
        className="relative max-w-3xl mx-auto bg-white/90 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl mb-4 sm:mb-6 border-2 border-emerald-100 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
      >
        {/* Decorative corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-emerald-200/50 to-transparent transform rotate-12 translate-x-8 -translate-y-8" />
        </div>

        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 relative z-10">
          <UserProfile />
        </div>

        {/* Media Gallery with padding */}
        {hasMedia && <MediaGallery />}

        {/* Content */}
        <div className="p-4 sm:p-6 pt-3 sm:pt-4 relative z-10">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight group-hover:text-emerald-700 transition-colors">
            {post.title}
          </h2>

          <div className="mb-4">
            <p className={`text-sm sm:text-base text-gray-600 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
              {post.description}
            </p>
            {post.description.length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2 inline-flex items-center gap-1 group"
              >
                {isExpanded ? 'Show less' : 'Read more'}
                <FiChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-emerald-100">
            <div className="flex items-center gap-4 sm:gap-6">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleLike}
                disabled={isLiking}
                className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors group"
              >
                <div className="relative">
                  <FiHeart className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${
                    post.likesCount > 0 ? 'fill-red-500 text-red-500' : ''
                  }`} />
                  {post.likesCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
                    />
                  )}
                </div>
                <span className="text-sm sm:text-base font-semibold">{post.likesCount}</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setShowComments(!showComments);
                  setTimeout(() => commentInputRef.current?.focus(), 100);
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors group"
              >
                <FiMessageCircle className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
                <span className="text-sm sm:text-base font-semibold">{post.comments?.length || 0}</span>
              </motion.button>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 text-gray-400 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
              >
                <FiShare2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="p-2 text-gray-400 hover:text-emerald-600 rounded-xl hover:bg-emerald-50 transition-all"
              >
                <FiBookmark className={`w-4 h-4 sm:w-5 sm:h-5 ${isBookmarked ? 'fill-emerald-600 text-emerald-600' : ''}`} />
              </motion.button>

              <div className="relative" ref={menuRef}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-all"
                >
                  {isMobile ? (
                    <FiMoreVertical className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <FiMoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </motion.button>

                <AnimatePresence>
                  {showMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 bottom-3 mt-2 w-36 sm:w-40 bg-white rounded-xl shadow-xl border-2 border-emerald-100 overflow-hidden z-50"
                    >
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowDeleteModal(true);
                        }}
                        className="w-full px-4 py-3 text-left flex items-center gap-2 hover:bg-red-50 transition-colors text-sm text-red-600"
                      >
                        <FiTrash2 className="w-4 h-4" />
                        <span>Delete</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-emerald-100 bg-gradient-to-b from-emerald-50/30 to-white"
            >
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                    <FiMessageCircle className="text-emerald-600" />
                    Responses ({post.comments?.length || 0})
                  </h4>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowComments(false)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <FiX className="w-4 h-4 text-gray-500" />
                  </motion.button>
                </div>

                <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {post.comments && post.comments.length > 0 ? (
                    post.comments.map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-emerald-100"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-md">
                              {comment.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="font-semibold text-gray-800 text-xs sm:text-sm">
                                {comment.name}
                              </span>
                              <span className="text-[10px] sm:text-xs text-gray-400 ml-2">
                                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 text-xs sm:text-sm ml-9 sm:ml-10">
                          {comment.comment}
                        </p>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mb-3">
                        <FaRegSmile className="w-8 h-8 text-emerald-500" />
                      </div>
                      <p className="text-gray-500 font-medium">No comments yet</p>
                      <p className="text-xs text-gray-400 mt-1">Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmitComment} className="space-y-3 bg-white p-4 rounded-xl shadow-sm border-2 border-emerald-100">
                  <input
                    type="text"
                    placeholder="Your name"
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border-2 border-emerald-200 rounded-lg focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition bg-white"
                    required
                  />
                  <div className="relative">
                    <textarea
                      ref={commentInputRef}
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={2}
                      className="w-full px-3 sm:px-4 py-2 sm:py-2.5 text-sm border-2 border-emerald-200 rounded-lg focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition bg-white pr-12"
                      required
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="submit"
                      className="absolute right-2 bottom-2 px-3 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-md hover:shadow-lg"
                    >
                      Post
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border-2 border-red-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FiAlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Post</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this post? All data including comments and likes will be permanently removed.
              </p>
              
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-medium"
                >
                  Delete
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-6xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.type === 'video' ? (
                selectedMedia.url.includes('youtube.com') || selectedMedia.url.includes('youtu.be') ? (
                  <iframe
                    src={getYoutubeEmbedUrl(selectedMedia.url)}
                    className="w-full aspect-video rounded-2xl shadow-2xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    controls
                    autoPlay
                    className="w-full max-h-[90vh] rounded-2xl shadow-2xl"
                  />
                )
              ) : (
                <Image
                  src={selectedMedia.url}
                  alt="Full size"
                  width={1920}
                  height={1080}
                  className="object-contain max-h-[90vh] rounded-2xl shadow-2xl"
                />
              )}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all border border-white/20"
              >
                <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #059669);
          border-radius: 4px;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};