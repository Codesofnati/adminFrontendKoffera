'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { postService } from '@/services/postService';
import toast from 'react-hot-toast';
import { 
  FiX, 
  FiUpload, 
  FiVideo, 
  FiYoutube,
  FiImage,
  FiFilm,
  FiLink,
  FiType,
  FiAlignLeft,
  FiCheckCircle
} from 'react-icons/fi';
import { FaPlay, FaYoutube } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormData {
  title: string;
  description: string;
  videoCaption: string;
  youtubeUrl: string;
}

export const CreatePostModal = ({ isOpen, onClose, onSuccess }: CreatePostModalProps) => {
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoType, setVideoType] = useState<'upload' | 'youtube' | null>(null);
  const [uploading, setUploading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      title: '',
      description: '',
      videoCaption: '',
      youtubeUrl: ''
    }
  });

  const youtubeUrl = watch('youtubeUrl');

  if (!isOpen) return null;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (images.length + files.length > 7) {
      toast.error('You can only upload up to 7 images');
      return;
    }

    const newImages = [...images, ...files];
    setImages(newImages);

    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    
    URL.revokeObjectURL(imagePreviews[index]);
    
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Video size should be less than 100MB');
      return;
    }

    if (!file.type.startsWith('video/')) {
      toast.error('Please upload a valid video file');
      return;
    }

    setVideo(file);
    setVideoPreview(URL.createObjectURL(file));
    setVideoType('upload');
    setValue('youtubeUrl', '');
  };

  const handleYoutubeUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setValue('youtubeUrl', url);
    if (url) {
      setVideoType('youtube');
      setVideo(null);
      setVideoPreview(null);
    }
  };

  const removeVideo = () => {
    if (videoPreview) {
      URL.revokeObjectURL(videoPreview);
    }
    setVideo(null);
    setVideoPreview(null);
    setValue('youtubeUrl', '');
    setVideoType(null);
    if (videoInputRef.current) {
      videoInputRef.current.value = '';
    }
  };

  const getYoutubeThumbnail = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://img.youtube.com/vi/${match[2]}/maxresdefault.jpg` : null;
  };

  const onSubmit = async (data: FormData) => {
    if (!data.title || !data.description) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setUploading(true);
  const postData = {
  title: data.title,
  description: data.description,
  images: images,
  video: video || undefined,
  youtubeUrl: data.youtubeUrl || undefined,   // camelCase
  videoCaption: data.videoCaption || undefined
};
      
      await postService.createPost(postData);
      
      toast.success('Story created successfully!');
      
      imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      
      reset();
      setImages([]);
      setImagePreviews([]);
      setVideo(null);
      setVideoPreview(null);
      setVideoType(null);
      setCurrentStep(1);
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create story');
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    imagePreviews.forEach(preview => URL.revokeObjectURL(preview));
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setImages([]);
    setImagePreviews([]);
    setVideo(null);
    setVideoPreview(null);
    setVideoType(null);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-white rounded-3xl max-w-3xl w-full my-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Gradient */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-green-600 p-6 flex justify-between items-center rounded-t-3xl">
              <div>
                <h2 className="text-2xl font-bold text-white">Write a New Story</h2>
                <p className="text-emerald-100 text-sm mt-1">Share your thoughts with the world</p>
              </div>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleClose}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors text-white"
              >
                <FiX className="w-6 h-6" />
              </motion.button>
            </div>

            {/* Progress Steps */}
            <div className="px-6 pt-6">
              <div className="flex items-center justify-between mb-8">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center flex-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm
                      ${currentStep >= step 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-gray-200 text-gray-600'
                      }`}>
                      {currentStep > step ? <FiCheckCircle className="w-5 h-5" /> : step}
                    </div>
                    {step < 3 && (
                      <div className={`flex-1 h-1 mx-2 rounded-full
                        ${currentStep > step ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* Step 1: Basic Info */}
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FiType className="text-emerald-600" />
                        Story Title
                      </label>
                      <input
                        {...register('title', { required: 'Title is required' })}
                        type="text"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="Give your story a captivating title..."
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                      )}
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FiAlignLeft className="text-emerald-600" />
                        Your Story
                      </label>
                      <textarea
                        {...register('description', { required: 'Description is required' })}
                        rows={6}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                        placeholder="Once upon a time..."
                      />
                      {errors.description && (
                        <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Media */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Video Selection Tabs */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Add Video (Optional)
                      </label>
                      
                      <div className="flex gap-3 mb-4">
                        <button
                          type="button"
                          onClick={() => {
                            setVideoType('upload');
                            setValue('youtubeUrl', '');
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                            videoType === 'upload' 
                              ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <FiVideo className="w-5 h-5" />
                          Upload Video
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setVideoType('youtube');
                            setVideo(null);
                            setVideoPreview(null);
                          }}
                          className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                            videoType === 'youtube' 
                              ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg' 
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <FiYoutube className="w-5 h-5" />
                          YouTube URL
                        </button>
                      </div>

                      {/* YouTube URL Input */}
                      {videoType === 'youtube' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-xl border-2 border-dashed border-red-200"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <FaYoutube className="w-6 h-6 text-red-600" />
                            <span className="font-medium text-gray-700">YouTube Link</span>
                          </div>
                          <input
                            type="url"
                            {...register('youtubeUrl')}
                            onChange={handleYoutubeUrlChange}
                            placeholder="https://www.youtube.com/watch?v=..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500"
                          />
                          
                          {youtubeUrl && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="mt-4 relative aspect-video rounded-lg overflow-hidden bg-black group"
                            >
                              <img
                                src={getYoutubeThumbnail(youtubeUrl) || 'https://img.youtube.com/vi/default/maxresdefault.jpg'}
                                alt="YouTube thumbnail"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center">
                                  <FaPlay className="w-6 h-6 text-white ml-1" />
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </motion.div>
                      )}

                      {/* Video Upload */}
                      {videoType === 'upload' && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-dashed border-purple-200"
                        >
                          {!video ? (
                            <div
                              onClick={() => videoInputRef.current?.click()}
                              className="cursor-pointer text-center py-8 px-4 rounded-lg hover:bg-white/50 transition-colors"
                            >
                              <div className="w-20 h-20 mx-auto bg-purple-100 rounded-full flex items-center justify-center mb-4">
                                <FiFilm className="w-10 h-10 text-purple-600" />
                              </div>
                              <p className="text-gray-600 mb-2 font-medium">Click to upload a video</p>
                              <p className="text-sm text-gray-400">MP4, WebM, or MOV (Max 100MB)</p>
                            </div>
                          ) : (
                            <div className="relative rounded-lg overflow-hidden bg-black group">
                              <video
                                src={videoPreview!}
                                className="w-full max-h-96 object-contain"
                                controls
                              />
                              <button
                                type="button"
                                onClick={removeVideo}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <FiX className="w-4 h-4" />
                              </button>
                            </div>
                          )}

                          <input
                            ref={videoInputRef}
                            type="file"
                            accept="video/*"
                            onChange={handleVideoUpload}
                            className="hidden"
                          />
                        </motion.div>
                      )}

                      {/* Video Caption */}
                      {videoType && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4"
                        >
                          <input
                            {...register('videoCaption')}
                            type="text"
                            placeholder="Add a caption for your video..."
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                          />
                        </motion.div>
                      )}
                    </div>

                    {/* Image Upload Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                        <FiImage className="text-emerald-600" />
                        Story Images (Max 7)
                      </label>
                      
                      <div className="grid grid-cols-4 gap-4 mb-4">
                        {imagePreviews.map((preview, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="relative aspect-square rounded-xl overflow-hidden group shadow-md"
                          >
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 25vw, 150px"
                              className="object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <FiX className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))}
                        
                        {images.length < 7 && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-emerald-500 hover:bg-emerald-50 transition-colors"
                          >
                            <FiUpload className="w-6 h-6 text-gray-400" />
                            <span className="text-xs text-gray-500">Add Image</span>
                          </motion.button>
                        )}
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Review */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Review Your Story</h3>
                      
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-emerald-600 font-medium">Title</p>
                          <p className="text-gray-800">{watch('title')}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-emerald-600 font-medium">Description</p>
                          <p className="text-gray-600 line-clamp-3">{watch('description')}</p>
                        </div>
                        
                        <div className="flex gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <FiImage className="text-emerald-600" />
                            <span>{images.length} images</span>
                          </div>
                          {videoType && (
                            <div className="flex items-center gap-2">
                              {videoType === 'upload' ? (
                                <FiVideo className="text-emerald-600" />
                              ) : (
                                <FiYoutube className="text-red-600" />
                              )}
                              <span>1 video</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Navigation Buttons */}
              <div className="flex justify-between gap-4 pt-4 border-t border-gray-200">
                {currentStep > 1 && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium"
                  >
                    Previous
                  </motion.button>
                )}
                
                {currentStep < 3 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="ml-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                  >
                    Next
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={uploading}
                    className="ml-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Publishing...
                      </>
                    ) : (
                      'Publish Story'
                    )}
                  </motion.button>
                )}
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};