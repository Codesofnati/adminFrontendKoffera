'use client';
import { useState, useEffect } from "react";
import { CloudArrowUpIcon, PhotoIcon, MagnifyingGlassIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline"; // Install @heroicons/react if needed
import { useDropzone } from "react-dropzone"; // Optional: Install react-dropzone for drag-and-drop

interface ImageItem {
  id: number;
  url: string;
  category: string;
  createdAt: string;
}

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

  const categories = ["founder", "vision", "mission"];

  /* NOTIFICATION HELPER */
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5s
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

    // ✅ SAFE URL extraction
    const imageUrl = data.url || data.image?.url;

    if (!imageUrl) {
      throw new Error("Image URL missing in response");
    }

    const freshUrl = `${imageUrl}?t=${Date.now()}`;

    setUploadedUrl(freshUrl);

    showNotification("success", "Image uploaded successfully!");

    // ✅ auto refresh latest image
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




  /* DRAG-AND-DROP HANDLER (OPTIONAL) */
  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) setFile(acceptedFiles[0]);
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  /* EFFECTS */
  useEffect(() => {
    fetchLatestImage("founder");
    setSelectedCategory("founder");
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* HEADER */}
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Image Uploader</h1>
          <p className="text-gray-600">Upload and manage images by category with ease.</p>
        </header>

        {/* IMAGE UPLOAD SECTION */}
        <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <CloudArrowUpIcon className="w-6 h-6 text-blue-500" />
            Upload Image
          </h2>
          <div className="space-y-6">
            {/* DRAG-AND-DROP AREA */}
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              <input {...getInputProps()} />
              <PhotoIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {isDragActive ? 'Drop the image here...' : 'Drag & drop an image here, or click to select'}
              </p>
              {file && <p className="text-sm text-green-600 mt-2">Selected: {file.name}</p>}
            </div>

            {/* CATEGORY SELECT AND UPLOAD BUTTON */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <select
                className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
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
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                <p className="text-green-600 font-medium mb-4">Upload Successful!</p>
                <img
                  src={uploadedUrl}
                  alt="Uploaded"
                  className="w-32 h-32 object-cover rounded-lg shadow-lg mx-auto hover:scale-105 transition-transform duration-300"
                />
              </div>
            )}
          </div>
        </section>

        {/* LATEST IMAGE SECTION */}
        <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <MagnifyingGlassIcon className="w-6 h-6 text-purple-500" />
            Latest Image by Category
          </h2>
          <div className="space-y-6">
            {/* CATEGORY SELECT AND FETCH BUTTON */}
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <select
                className="flex-1 border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
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
                className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                  className="w-40 h-40 object-cover rounded-lg shadow-lg mx-auto hover:scale-110 transition-transform duration-300"
                />
                <p className="text-sm text-gray-500 mt-4">
                  Category: <span className="font-medium">{latestImage.category}</span> | Uploaded: {new Date(latestImage.createdAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}