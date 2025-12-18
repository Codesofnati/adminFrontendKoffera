'use client';
import { useState, useEffect } from "react";
import { VideoCameraIcon, CloudArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useDropzone } from "react-dropzone";

interface VideoItem {
  id: number;
  url: string;
  createdAt: string;
}

export default function VideoUploader() {
    const API = process.env.NEXT_PUBLIC_API_URL;

  /* STATES */
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState("");
  const [latestVideo, setLatestVideo] = useState<VideoItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  /* NOTIFICATION HELPER */
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000); // Auto-hide after 5s
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
    setLatestVideo({ ...data.video, url: freshUrl });

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
  });

  useEffect(() => {
    fetchLatestVideo();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Video Uploader</h1>
          <p className="text-gray-600">Upload and showcase your latest videos effortlessly.</p>
        </header>

        {/* VIDEO UPLOAD SECTION */}
        <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <VideoCameraIcon className="w-6 h-6 text-green-500" />
            Upload Video
          </h2>
          <p className="text-gray-600 mb-6">Drag & drop or select a video file to upload.</p>

          {/* DRAG-AND-DROP AREA */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-300 mb-6 ${
              isDragActive ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:border-green-400'
            }`}
          >
            <input {...getInputProps()} />
            <VideoCameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {isDragActive ? 'Drop the video here...' : 'Drag & drop a video here, or click to select'}
            </p>
            {videoFile && <p className="text-sm text-green-600 mt-2">Selected: {videoFile.name}</p>}
          </div>

          {/* UPLOAD BUTTON */}
          <div className="flex justify-center">
            <button
              onClick={handleUploadVideo}
              className={`bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                uploading ? 'cursor-not-allowed' : ''
              }`}
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <CloudArrowUpIcon className="w-5 h-5" />
                  Upload Video
                </>
              )}
            </button>
          </div>

          {/* UPLOADED VIDEO PREVIEW */}
          {uploadedVideoUrl && (
            <div className="mt-8 text-center animate-fade-in">
              <h3 className="font-semibold text-lg text-green-800 mb-4">Uploaded Video Preview</h3>
              <video
                key={uploadedVideoUrl} // Force re-render on new URL
                controls
                className="w-full max-w-md mx-auto rounded-xl shadow-lg border border-green-300 hover:scale-105 transition-transform duration-300"
              >
                <source src={uploadedVideoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* LATEST VIDEO */}
          {latestVideo && !uploadedVideoUrl && (
            <div className="mt-8 text-center">
              <h3 className="font-semibold text-lg text-gray-800 mb-4">Latest Video</h3>
              <video
                key={latestVideo.url} // Force re-render
                controls
                className="w-full max-w-md mx-auto rounded-xl shadow-lg border border-gray-300 hover:scale-105 transition-transform duration-300"
              >
                <source src={latestVideo.url} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
