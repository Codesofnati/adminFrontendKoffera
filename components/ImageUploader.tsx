'use client';
import { useState, useEffect, useRef } from "react";
import { CloudArrowUpIcon, PhotoIcon, MagnifyingGlassIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useDropzone } from "react-dropzone";

interface ImageItem {
  id: number;
  url: string;
  category: string;
  createdAt: string;
}
import { 
  FiImage, 
  FiUpload,
  FiCheckCircle,
  FiAlertCircle,
  FiCoffee,
  FiEye,
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
  GiSteam
} from "react-icons/gi";
import { 
  User,
  Eye,
  Target,
  Compass
} from 'lucide-react';
import { motion, useScroll, useTransform } from "framer-motion";

export default function ImageUploader() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  /* STATES */
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState("");
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [latestImage, setLatestImage] = useState<ImageItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  
  // ✅ FIX: Only initialize useScroll when ref exists
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  const categories = ["founder", "vision", "mission"];

  /* NOTIFICATION HELPER */
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };
  
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  /* FETCH LATEST IMAGE */
 const fetchLatestImage = async (category: string) => {
  try {
    const res = await fetch(`${API}/images/latest/${category}`);
    const data = await res.json();

    if (!res.ok) return;

    setLatestImage({
      ...data,
      url: `${data.url}?t=${Date.now()}`,
    });
  } catch (err) {
    console.error(err);
  }
};

  /* IMAGE UPLOAD */
const handleUpload = async () => {
  if (!file || !category) {
    showNotification("error", "Please select an image and category");
    return;
  }

  setIsUploading(true);

  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  try {
    const res = await fetch(
      "https://newsss.koffera.workers.dev/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Upload failed");
    }

    const imageUrl = data.url || data.image?.url;

    if (!imageUrl) {
      throw new Error("Image URL missing in response");
    }

    const freshUrl = `${imageUrl}?t=${Date.now()}`;

    setUploadedUrl(freshUrl);

    showNotification("success", "Image uploaded successfully!");

    if (category === selectedCategory) {
      fetchLatestImage(category);
    }

  } catch (err) {
    console.error("Upload error:", err);
    showNotification("error", "Error uploading image");
  } finally {
    setIsUploading(false);
  }
};

  /* DRAG-AND-DROP HANDLER */
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  /* EFFECTS */
  useEffect(() => {
    fetchLatestImage("founder");
    setSelectedCategory("founder");
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
    // ✅ FIX: Attach the ref to the top-level div
    <div ref={sectionRef} className="min-h-screen bg-gradient-to-br bg-gradient-to-b from-white via-emerald-50/20 to-white p-6">
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
      
      {/* NOTIFICATION TOAST - CHANGED TO SOLID EMERALD */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
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
                <FiImage className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-4"
          >
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 bg-clip-text text-transparent bg-[length:200%] animate-gradient">
              Image Gallery
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
            Upload and manage your coffee story images with elegance
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
        
        {/* IMAGE UPLOAD SECTION - UPDATED COLORS */}
        <section className="bg-white p-8 rounded-2xl shadow-xl border border-emerald-100 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <CloudArrowUpIcon className="w-6 h-6 text-emerald-600" />
            Upload Image
          </h2>
          <div className="space-y-6">
            {/* DRAG-AND-DROP AREA */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive ? 'border-emerald-500 bg-emerald-50' : 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/30'
              }`}
            >
              <input {...getInputProps()} />
              <PhotoIcon className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {isDragActive ? 'Drop the image here...' : 'Drag & drop an image here, or click to select'}
              </p>
              {file && <p className="text-sm text-emerald-600 mt-2">Selected: {file.name}</p>}
            </div>

            {/* CATEGORY SELECT AND UPLOAD BUTTON */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <select
                className="flex-1 border text-black border-emerald-200 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                aria-label="Select category"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-5 h-5" />
                    Upload
                  </>
                )}
              </button>
            </div>

            {/* UPLOADED IMAGE PREVIEW */}
            {uploadedUrl && (
              <div className="mt-6 text-center">
                <p className="text-emerald-600 font-medium mb-4 flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />
                  Upload Successful!
                </p>
                <img
                  src={uploadedUrl}
                  alt="Uploaded"
                  className="w-32 h-32 object-cover rounded-lg shadow-lg mx-auto hover:scale-105 transition-transform duration-300 border-2 border-emerald-200"
                />
              </div>
            )}
          </div>
        </section>

        {/* LATEST IMAGE SECTION - UPDATED COLORS */}
        <section className="bg-white p-8 rounded-2xl shadow-xl border border-emerald-100 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <MagnifyingGlassIcon className="w-6 h-6 text-emerald-600" />
            Latest Image by Category
          </h2>
          <div className="space-y-6">
            {/* CATEGORY SELECT AND FETCH BUTTON */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <select
                className="flex-1 border text-black border-emerald-200 p-3 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Select category to fetch"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg"
                onClick={() => fetchLatestImage(selectedCategory)}
                disabled={isFetching}
              >
                {isFetching ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Fetching...
                  </>
                ) : (
                  <>
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    Get Latest
                  </>
                )}
              </button>
            </div>

            {/* LATEST IMAGE DISPLAY */}
            {latestImage && (
              <div className="mt-6 text-center animate-fade-in">
                <img
                  src={latestImage.url}
                  alt={`Latest ${latestImage.category}`}
                  className="w-40 h-40 object-cover rounded-lg shadow-lg mx-auto hover:scale-110 transition-transform duration-300 border-2 border-emerald-200"
                />
                <p className="text-sm text-gray-500 mt-4">
                  Category: <span className="font-medium text-emerald-600">{latestImage.category}</span> | Uploaded: {new Date(latestImage.createdAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}