"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseClient } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  KeyIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";
import { Award, Leaf } from 'lucide-react';

export default function AdminLogin() {
  const supabase = createSupabaseClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Specific error messages based on error type
  const getErrorMessage = (errorMessage: string): string => {
    if (errorMessage.includes("Invalid login credentials")) {
      return "Incorrect email or password. Please try again.";
    }
    if (errorMessage.includes("Email not confirmed")) {
      return "Please verify your email address before logging in.";
    }
    if (errorMessage.includes("Invalid email")) {
      return "Please enter a valid email address.";
    }
    if (errorMessage.includes("Password should be at least 6 characters")) {
      return "Password must be at least 6 characters long.";
    }
    if (errorMessage.includes("rate limit")) {
      return "Too many login attempts. Please try again later.";
    }
    if (errorMessage.includes("network")) {
      return "Network error. Please check your connection.";
    }
    return errorMessage || "An unexpected error occurred. Please try again.";
  };

  const validateForm = (): boolean => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!email.includes('@') || !email.includes('.')) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!password) {
      setError("Password is required");
      return false;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return false;
    }
    return true;
  };

  const handleLogin = async () => {
    setError("");
    
    // Client-side validation first
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ 
      email: email.trim(), 
      password 
    });

    setLoading(false);

    if (error) {
      setError(getErrorMessage(error.message));
      setPassword(""); // Clear password for security
    } else {
      router.push("/admin");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements - Same as other components */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-white"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-green-300/40 to-lime-400/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-lime-300/35 to-green-400/25 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md z-10"
      >
        <div className="bg-gradient-to-br from-white to-green-50 rounded-3xl overflow-hidden shadow-xl border border-green-200/60 backdrop-blur-sm bg-white/80">
          
          {/* Header with Logo */}
          <div className="p-8 bg-gradient-to-r from-green-700 to-green-900 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex justify-center mb-4"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl"></div>
                <div className="relative w-24 h-24 bg-white/10 rounded-2xl p-4 backdrop-blur-sm border-2 border-white/30">
                  <img 
                    src="/navlogo.png" 
                    alt="Koffera Coffee Logo" 
                    className="w-full h-full object-contain filter brightness-0 invert" 
                  />
                </div>
              </div>
            </motion.div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Admin Login</h2>
            <p className="text-green-100 text-sm">Welcome back! Please enter your details</p>
          </div>

          {/* Form */}
          <div className="p-8">
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                >
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 flex-1">{error}</p>
                  <button 
                    onClick={() => setError("")}
                    className="text-red-400 hover:text-red-600"
                  >
                    <span className="text-lg leading-none">×</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <input
                    type="email"
                    placeholder="admin@mabcoffee.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-4 py-4 border-2 border-green-200 bg-white/80 backdrop-blur-sm text-gray-900 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <KeyIcon className="h-5 w-5 text-green-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full pl-12 pr-12 py-4 border-2 border-green-200 bg-white/80 backdrop-blur-sm text-gray-900 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-green-600 transition-colors" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-green-600 transition-colors" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password Hint */}
              <div className="text-right">
                <button 
                  type="button"
                  className="text-sm text-green-600 hover:text-green-800 font-medium"
                  onClick={() => {
                    setError("Please contact your administrator to reset your password.");
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogin}
              disabled={loading}
              className="w-full mt-8 py-4 bg-gradient-to-r from-green-700 to-green-900 text-white font-semibold rounded-xl hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <Leaf className="w-5 h-5" />
                  Sign In
                </>
              )}
            </motion.button>

            {/* Security Note */}
            <div className="mt-6 pt-6 border-t border-green-200/60">
              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Award className="w-4 h-4 text-green-600" />
                <span>Secured by Koffera Coffee Export</span>
              </div>
            </div>
          </div>
        </div>

        
      </motion.div>
    </div>
  );
}