"use client";

import React, { useState, useEffect } from "react";
import {
  VideoCameraIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  PhotoIcon,
  XMarkIcon,
  PlayIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { Upload, Check, X, Video, AlertCircle, Loader2, Play, Eye, Calendar, FileText, RefreshCw, Leaf, Award, Image as ImageIcon } from 'lucide-react';

interface VideoItem {
  id: number;
  url: string;
  createdAt: string;
  category_name?: 'video1' | 'video2' | 'video3' | 'hero';
  title?: string;
  created_at?: string;
  file_name?: string;
}

interface HeroVideo {
  id: number;
  url: string;
  title: string;
  created_at: string;
}

interface NotificationType {
  type: "success" | "error";
  message: string;
}

export default function VideoUploader() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  
  // State for first uploader (hero section)
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");
  const [latestVideo, setLatestVideo] = useState<VideoItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isFetchingLatest, setIsFetchingLatest] = useState(false);
  
  // State for second uploader (story videos)
  const [category, setCategory] = useState<'video1' | 'video2' | 'video3'>('video1');
  const [title, setTitle] = useState('');
  const [storyFile, setStoryFile] = useState<File | null>(null);
  const [storyUploading, setStoryUploading] = useState(false);
  
  // Shared state
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [previewVideo, setPreviewVideo] = useState<VideoItem | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [heroVideo, setHeroVideo] = useState<HeroVideo | null>(null);
  const [loadingHero, setLoadingHero] = useState(true);
  
  const [notification, setNotification] = useState<NotificationType | null>(null);

  const categories = [
    { id: 'video1', name: 'Video 1', description: 'First video in sequence', color: 'bg-green-100 text-green-800' },
    { id: 'video2', name: 'Video 2', description: 'Second video in sequence', color: 'bg-green-100 text-green-800' },
    { id: 'video3', name: 'Video 3', description: 'Third video in sequence', color: 'bg-green-100 text-green-800' },
  ];

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  /* FETCH LATEST HERO VIDEO */
  const fetchLatestHeroVideo = async () => {
    setLoadingHero(true);
    try {
      const res = await fetch(`${API}/videos/latest`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setHeroVideo({
          ...data,
          url: `${data.url}?t=${Date.now()}`,
        });
      }
    } catch (e) {
      console.error("Error fetching hero video:", e);
    } finally {
      setLoadingHero(false);
    }
  };

  /* FETCH ALL STORY VIDEOS */
  const fetchStoryVideos = async () => {
    setLoadingVideos(true);
    try {
      const response = await fetch(`${API}/story/videos/all`, {
        cache: 'no-store',
      });
      
      if (response.ok) {
        const result = await response.json();
        
        if (result.success && Array.isArray(result.videos)) {
          const sortedVideos = result.videos.sort((a: VideoItem, b: VideoItem) => {
            if (a.category_name === b.category_name) {
              return new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime();
            }
            return (a.category_name || '').localeCompare(b.category_name || '');
          });
          
          setVideos(sortedVideos);
        }
      }
    } catch (error) {
      console.error('Error fetching videos:', error);
    } finally {
      setLoadingVideos(false);
    }
  };

  /* UPLOAD HERO VIDEO */
  const handleUploadHeroVideo = async () => {
    if (!videoFile) {
      showNotification("error", "Please select a video");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("file", videoFile);

    try {
      const res = await fetch(`${API}/upload-video`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error();

      const videoUrl = data.url || data.video?.url;
      if (!videoUrl) throw new Error();

      const freshUrl = `${videoUrl}?t=${Date.now()}`;
      setUploadedVideoUrl(freshUrl);
      setHeroVideo({ ...data.video, url: freshUrl, title: 'Hero Video', created_at: new Date().toISOString() });

      showNotification("success", "Hero video uploaded successfully");
      setVideoFile(null);
    } catch {
      showNotification("error", "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* UPLOAD STORY VIDEO */
  const handleUploadStoryVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!storyFile) {
      showNotification('error', 'Please select a video file');
      return;
    }
    
    if (!title.trim()) {
      showNotification('error', 'Please enter a title');
      return;
    }
    
    setStoryUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('video', storyFile);
      formData.append('title', title);
      
      const response = await fetch(`${API}/story/videos/upload/${category}`, {
        method: 'POST',
        body: formData,
      });
      
      const responseText = await response.text();
      
      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }
      
      const result = JSON.parse(responseText);
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed');
      }
      
      showNotification('success', `✅ Video uploaded to ${category}`);
      
      // Reset form
      setTitle('');
      setStoryFile(null);
      
      // Refresh video list
      await fetchStoryVideos();
      
    } catch (error: any) {
      console.error('Upload error:', error);
      showNotification('error', error.message || 'Upload failed');
    } finally {
      setStoryUploading(false);
    }
  };

  /* DROPZONE for hero video */
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (files) => files[0] && setVideoFile(files[0]),
    accept: { "video/*": [] },
    multiple: false,
  });

  /* Get latest video for each category */
  const getLatestVideos = () => {
    const latest: Record<string, VideoItem> = {};
    
    videos.forEach(video => {
      if (video.category_name && (!latest[video.category_name] || 
          new Date(video.created_at || '') > new Date(latest[video.category_name].created_at || ''))) {
        latest[video.category_name] = video;
      }
    });
    
    return latest;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'video1': return 'bg-green-100 text-green-800';
      case 'video2': return 'bg-green-100 text-green-800';
      case 'video3': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    fetchLatestHeroVideo();
    fetchStoryVideos();
  }, []);

  const latestVideos = getLatestVideos();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-white"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-green-300/40 to-lime-400/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-lime-300/35 to-green-400/25 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        
        {/* NOTIFICATION - FIXED: Changed from top-25 to top-24 */}
        <AnimatePresence>
          {notification && (
            <motion.div
              key="notification"
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className={`fixed top-24 right-6 z-50 px-4 py-3 rounded-xl shadow-lg flex gap-2 items-center text-white ${
                notification.type === "success"
                  ? "bg-gradient-to-r from-green-700 to-green-900"
                  : "bg-gradient-to-r from-red-600 to-red-800"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircleIcon className="w-5" />
              ) : (
                <ExclamationTriangleIcon className="w-5" />
              )}
              {notification.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Header - Moved outside AnimatePresence */}
        <motion.div
          className="text-center mb-12 mt-10"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-2 bg-gradient-to-r from-green-100 to-lime-100 rounded-full border border-green-300/50 shadow-sm">
            <Award className="w-5 h-5 text-green-800" />
            <span className="text-sm font-medium text-green-900">
              Video Management Dashboard
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-900 via-green-800 to-lime-900 bg-clip-text text-transparent">
              Video Gallery
            </span>
          </h1>

          <div className="w-32 h-1.5 bg-gradient-to-r from-green-600 via-green-500 to-lime-600 mx-auto rounded-full mb-8 shadow-md"></div>

          <p className="text-lg text-gray-800 max-w-3xl mx-auto font-medium">
            Upload, manage, and organize video for your website sections
          </p>
        </motion.div>

        {/* PREVIEW MODAL */}
        <AnimatePresence>
          {showPreview && previewVideo && (
            <motion.div
              key="preview-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50"
              onClick={() => setShowPreview(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="max-w-4xl w-full bg-gray-900 rounded-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 flex justify-between items-center bg-black/50">
                  <div>
                    <h3 className="text-white font-bold text-lg">{previewVideo.title || 'Hero Video'}</h3>
                    <p className="text-gray-300 text-sm">
                      {previewVideo.category_name || 'hero'} • {formatDate(previewVideo.created_at || previewVideo.createdAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="text-white hover:text-gray-300"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="p-4">
                  <video
                    src={previewVideo.url}
                    controls
                    autoPlay
                    className="w-full h-auto rounded-lg"
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* HERO SECTION VIDEO CARD */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-white to-green-50 rounded-3xl overflow-hidden shadow-xl border border-green-200/60 p-8 backdrop-blur-sm bg-white/80"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-700 to-green-900 rounded-xl">
              <PhotoIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Hero Section Video</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Hero Video */}
            <div>
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-300 backdrop-blur-sm ${
                  isDragActive
                    ? "border-green-500 bg-green-50"
                    : "border-green-200 hover:border-green-400 hover:bg-green-50/50"
                }`}
              >
                <input {...getInputProps()} />
                <VideoCameraIcon className="w-16 h-16 mx-auto text-green-400" />
                <p className="mt-4 text-gray-700 font-medium">
                  {isDragActive ? "Drop your video here" : "Drag & drop hero video or click to browse"}
                </p>
                <p className="mt-2 text-sm text-gray-500">Supports: MP4, WebM, MOV (Max 100MB)</p>
                {videoFile && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-green-100 rounded-xl"
                  >
                    <p className="text-sm font-medium text-green-900">Selected: {videoFile.name}</p>
                    <p className="text-xs text-green-700">Size: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </motion.div>
                )}
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleUploadHeroVideo}
                  disabled={uploading || !videoFile}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-green-700 to-green-900 text-white font-semibold hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {uploading ? (
                    <div className="flex items-center justify-center gap-2">
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    "Upload Hero Video"
                  )}
                </button>
              </div>
            </div>

            {/* Latest Hero Video Display */}
            <div className="bg-white rounded-2xl p-4 border border-green-200/60 backdrop-blur-sm bg-white/80">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <PlayIcon className="w-4 h-4 text-green-600" />
                Current Hero Video
              </h3>
              
              {loadingHero ? (
                <div className="flex flex-col items-center gap-3 py-6 text-gray-400">
                  <ArrowPathIcon className="w-8 h-8 animate-spin" />
                  <p className="text-sm">Loading hero video...</p>
                </div>
              ) : heroVideo ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <video
                    key={heroVideo.url}
                    controls
                    className="w-full rounded-xl shadow border border-green-200 mb-3"
                  >
                    <source src={heroVideo.url} type="video/mp4" />
                  </video>
                  <div className="flex justify-between items-center text-sm text-gray-500">
                    <span>Uploaded: {formatDate(heroVideo.created_at)}</span>
                    <button
                      onClick={() => {
                        setPreviewVideo({
                          ...heroVideo,
                          id: heroVideo.id,
                          url: heroVideo.url,
                          createdAt: heroVideo.created_at,
                          title: heroVideo.title
                        });
                        setShowPreview(true);
                      }}
                      className="text-green-600 hover:text-green-800 flex items-center gap-1"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="flex items-center gap-4 py-6">
                  <div className="w-16 h-16 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Video className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No hero video uploaded yet</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* STORY VIDEOS SECTION */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white to-green-50 rounded-3xl overflow-hidden shadow-xl border border-green-200/60 p-8 backdrop-blur-sm bg-white/80"
        >
           <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-r from-green-700 to-green-900 rounded-xl">
              <PhotoIcon className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Story Video</h2>
          </div>
          {/* Category Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {categories.map((cat, index) => {
              const latestVideo = latestVideos[cat.id];
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-lg p-4 border border-green-200/60 hover:shadow-xl transition-shadow backdrop-blur-sm bg-white/80"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-r from-green-700 to-green-900 text-white`}>
                      <span className="font-bold">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">{cat.name}</div>
                      <div className="text-sm text-gray-500">{cat.description}</div>
                    </div>
                  </div>
                  
                  {latestVideo ? (
                    <div className="space-y-2">
                      <div className="text-sm text-gray-700 truncate">{latestVideo.title}</div>
                      <div className="text-xs text-gray-500">
                        Uploaded: {formatDate(latestVideo.created_at || '')}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setPreviewVideo(latestVideo);
                            setShowPreview(true);
                          }}
                          className="flex-1 py-1.5 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition-colors"
                        >
                          Preview
                        </button>
                       
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Video className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">No video uploaded yet</p>
                      <button
                        onClick={() => setCategory(cat.id as any)}
                        className="mt-2 text-sm text-green-600 hover:text-green-800"
                      >
                        Upload first video
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Upload Form */}
          <div className="border-t border-green-200/60 pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Upload New Story Video</h3>
            
            <form onSubmit={handleUploadStoryVideo} className="space-y-6">
              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Category
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id as any)}
                      className={`p-4 rounded-lg border-2 transition-all backdrop-blur-sm ${
                        category === cat.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-green-200 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-r from-green-700 to-green-900 text-white mx-auto mb-2`}>
                        <span className="font-bold">{cat.id.charAt(cat.id.length - 1)}</span>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-gray-900 text-sm">{cat.name}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter video title..."
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 text-black border-green-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                />
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Video File *
                </label>
                <div className="border-2 border-dashed border-green-200 rounded-2xl p-6 text-center hover:border-green-400 transition-colors backdrop-blur-sm">
                  <input
                    type="file"
                    id="video-file"
                    accept="video/*"
                    onChange={(e) => {
                      const selectedFile = e.target.files?.[0] || null;
                      if (selectedFile) {
                        if (!selectedFile.type.startsWith('video/')) {
                          showNotification('error', 'Please select a video file');
                          return;
                        }
                        if (selectedFile.size > 100 * 1024 * 1024) {
                          showNotification('error', 'File size must be less than 100MB');
                          return;
                        }
                        setStoryFile(selectedFile);
                        
                        if (!title) {
                          const cat = categories.find(c => c.id === category);
                          setTitle(`${cat?.name} - ${new Date().toLocaleDateString()}`);
                        }
                      }
                    }}
                    className="hidden"
                    disabled={storyUploading}
                  />
                  
                  <label htmlFor="video-file" className={`cursor-pointer block ${storyUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {storyFile ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-4 p-3 bg-green-50 rounded-xl"
                      >
                        <Video className="w-8 h-8 text-green-600 flex-shrink-0" />
                        <div className="text-left flex-1">
                          <p className="font-medium text-gray-900 truncate">{storyFile.name}</p>
                          <p className="text-sm text-gray-500">
                            {(storyFile.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <Upload className="w-12 h-12 text-green-400 mx-auto mb-3" />
                        <p className="text-gray-700 font-medium">Click to select video</p>
                        <p className="text-gray-500 text-sm mt-1">MP4, WebM, or MOV • Max 100MB</p>
                      </>
                    )}
                  </label>
                </div>
                
                {storyFile && (
                  <button
                    type="button"
                    onClick={() => setStoryFile(null)}
                    className="mt-2 text-sm text-red-600 hover:text-red-800"
                    disabled={storyUploading}
                  >
                    Remove file
                  </button>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={storyUploading || !storyFile}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-green-700 to-green-900 text-white font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {storyUploading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Upload to {category.toUpperCase()}
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setTitle('');
                    setStoryFile(null);
                  }}
                  className="px-6 py-3 text-gray-600 hover:text-gray-800 text-sm border-2 border-green-200 rounded-xl hover:border-green-300 transition-all backdrop-blur-sm"
                  disabled={storyUploading}
                >
                  Clear
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}