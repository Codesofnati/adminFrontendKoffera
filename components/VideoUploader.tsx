'use client';
import { useState, useEffect, useRef } from "react";
import { VideoCameraIcon, CloudArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useDropzone } from "react-dropzone";
import { 
  FiVideo, 
  FiUpload,
  FiCheckCircle,
  FiAlertCircle,
  FiCoffee,
  FiClock,
  FiCalendar,
  FiRefreshCw
} from "react-icons/fi";
import { 
  FaLeaf, 
  FaSeedling,
  FaRegGem 
} from "react-icons/fa";
import { 
  GiCoffeeBeans, 
  GiCoffeeCup,
  GiCoffeeMug,
  GiSteam,
} from "react-icons/gi";
import { 
  User,
  Eye,
  Target,
  Compass
} from 'lucide-react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

interface VideoItem {
  id: number;
  url: string;
  createdAt: string;
}

export default function VideoUploader() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  
  /* REFS FOR ANIMATIONS */
  const sectionRef = useRef<HTMLDivElement>(null);
  const uploadRef = useRef<HTMLDivElement>(null);
  
  const isUploadInView = useInView(uploadRef, { once: true, amount: 0.3 });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  /* STATES */
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");
  const [latestVideo, setLatestVideo] = useState<VideoItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [hoveredVideo, setHoveredVideo] = useState(false);

  /* ANIMATION VARIANTS */
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  const slideInLeft = {
    hidden: { opacity: 0, x: -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  /* NOTIFICATION HELPER */
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  /* UPLOAD VIDEO */
const handleUploadVideo = async () => {
  if (!videoFile) {
    showNotification("error", "Please select a video");
    return;
  }

  setUploading(true);

  const formData = new FormData();
  formData.append("file", videoFile);

  try {
    const res = await fetch(
      "https://newsss.koffera.workers.dev/upload-video",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Upload failed");
    }

    // ✅ SAFE extraction
    const videoUrl = data.url || data.video?.url;

    if (!videoUrl) {
      throw new Error("Video URL missing in response");
    }

    const freshUrl = `${videoUrl}?t=${Date.now()}`;

    setUploadedVideoUrl(freshUrl);
    setLatestVideo({ ...data.video, url: freshUrl, createdAt: data.video?.created_at || new Date().toISOString() });

    showNotification("success", "Video uploaded successfully!");
  } catch (err) {
    console.error("Upload error:", err);
    showNotification("error", "Error uploading video");
  } finally {
    setUploading(false);
  }
};

  /* FETCH LATEST VIDEO */
  const fetchLatestVideo = async () => {
    try {
      const res = await fetch(`${API}/videos/latest`);
      if (!res.ok) {
        setLatestVideo(null);
        return;
      }
      const data = await res.json();
      setLatestVideo(data);
    } catch {
      setLatestVideo(null);
    }
  };

  /* DRAG-AND-DROP HANDLER */
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setVideoFile(acceptedFiles[0]);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/*': [] },
    maxFiles: 1,
    maxSize: 104857600, // 100MB
  });

  /* EFFECTS */
  useEffect(() => {
    fetchLatestVideo();
  }, []);
  
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

      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 p-4 rounded-xl shadow-2xl border-l-4 ${
              notification.type === 'success' 
                ? 'bg-white border-emerald-500 text-emerald-700' 
                : 'bg-white border-red-500 text-red-700'
            }`}
          >
            {notification.type === 'success' 
              ? <FiCheckCircle className="w-5 h-5 text-emerald-500" /> 
              : <FiAlertCircle className="w-5 h-5 text-red-500" />
            }
            <span className="text-sm font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative max-w-6xl mx-auto z-10">
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
                <FiVideo className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-4"
          >
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 bg-clip-text text-transparent bg-[length:200%] animate-gradient">
              Video Gallery
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
            Upload and showcase your coffee story videos with elegance
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

        {/* VIDEO UPLOAD SECTION */}
        <motion.div
          ref={uploadRef}
          variants={slideInLeft}
          initial="hidden"
          animate={isUploadInView ? "visible" : "hidden"}
          className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-emerald-100 hover:shadow-3xl transition-all duration-500"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
              <VideoCameraIcon className="w-5 h-5 text-white" />
            </div>
            <span className="text-emerald-700 font-bold">Upload New Video</span>
          </h2>

          {/* DRAG-AND-DROP AREA */}
          <div
            {...getRootProps()}
            className={`border-3 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 mb-8 ${
              isDragActive 
                ? 'border-emerald-500 bg-emerald-50/50' 
                : 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/30'
            }`}
          >
            <input {...getInputProps()} />
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30" />
              <VideoCameraIcon className="relative w-16 h-16 text-emerald-500 mx-auto mb-4" />
            </div>
            <p className="text-gray-700 font-medium mb-2">
              {isDragActive ? 'Drop your video here...' : 'Drag & drop a video, or click to browse'}
            </p>
            <p className="text-sm text-gray-500">Supports MP4, MOV, AVI (max 100MB)</p>
            {videoFile && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-emerald-600 mt-4 font-medium bg-emerald-100 inline-block px-4 py-2 rounded-full"
              >
                ✓ Selected: {videoFile.name}
              </motion.p>
            )}
          </div>

          {/* UPLOAD BUTTON - SOLID COLOR */}
          <div className="flex justify-center">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleUploadVideo}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FiUpload className="w-5 h-5" />
                  <span>Upload Video</span>
                </>
              )}
            </motion.button>
          </div>

          {/* UPLOADED VIDEO PREVIEW */}
          <AnimatePresence>
            {uploadedVideoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-8 text-center p-6 bg-emerald-50 rounded-2xl"
                onMouseEnter={() => setHoveredVideo(true)}
                onMouseLeave={() => setHoveredVideo(false)}
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <FiCheckCircle className="w-5 h-5 text-emerald-600" />
                  <p className="text-emerald-700 font-semibold">Upload Successful!</p>
                </div>
                <div className="relative inline-block">
                  <motion.div 
                    className="absolute -inset-4 bg-emerald-200 rounded-full blur-xl opacity-50"
                    animate={{ scale: hoveredVideo ? 1.3 : 1 }}
                  />
                  <video
                    key={uploadedVideoUrl}
                    controls
                    className="relative w-full max-w-md mx-auto rounded-2xl shadow-2xl border-4 border-white hover:scale-105 transition-transform duration-300"
                  >
                    <source src={uploadedVideoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                <p className="text-sm text-gray-500 mt-4">
                  Uploaded {new Date().toLocaleString()}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* LATEST VIDEO */}
          <AnimatePresence>
            {latestVideo && !uploadedVideoUrl && (
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, scale: 0.9 }}
                className="mt-8 text-center p-6 bg-emerald-50/50 rounded-2xl"
                onMouseEnter={() => setHoveredVideo(true)}
                onMouseLeave={() => setHoveredVideo(false)}
              >
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center justify-center gap-2">
                  <FiCoffee className="w-5 h-5 text-emerald-600" />
                  Latest Video
                  <FiCoffee className="w-5 h-5 text-emerald-600" />
                </h3>
                <div className="relative inline-block">
                  <motion.div 
                    className="absolute -inset-4 bg-emerald-200 rounded-full blur-xl opacity-50"
                    animate={{ scale: hoveredVideo ? 1.3 : 1 }}
                  />
                  <video
                    key={latestVideo.url}
                    controls
                    className="relative w-full max-w-md mx-auto rounded-2xl shadow-2xl border-4 border-white hover:scale-105 transition-transform duration-300"
                  >
                    <source src={latestVideo.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
                {latestVideo.createdAt && (
                  <div className="mt-4 flex items-center justify-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <FiCalendar className="w-4 h-4 text-emerald-500" />
                      <span>{new Date(latestVideo.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FiClock className="w-4 h-4 text-emerald-500" />
                      <span>{new Date(latestVideo.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {!latestVideo && !uploadedVideoUrl && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 mt-4"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-400 rounded-full blur-xl opacity-30" />
                <div className="relative bg-white p-6 rounded-full shadow-xl mb-4">
                  <FiVideo className="w-12 h-12 text-emerald-500" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Videos Yet</h3>
              <p className="text-gray-500">Upload your first video to see it here</p>
            </motion.div>
          )}
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
              ✦ Capturing Coffee Stories on Video ✦
            </span>
            <GiCoffeeBeans className="w-5 h-5 text-amber-600/60" />
          </div>
        </motion.div>
      </div>

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