"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { 
  LockClosedIcon, 
  KeyIcon, 
  CheckCircleIcon, 
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon 
} from "@heroicons/react/24/outline";
import { Shield, Key } from 'lucide-react';
import { createSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const Setting = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  const supabase = createSupabaseClient();
  const router = useRouter();

  // Get current user email on component mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) {
        setUserEmail(user.email);
      }
    };
    getUser();
  }, [supabase]);

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: 'No password', color: 'bg-gray-200' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.match(/[A-Z]/)) score++;
    if (password.match(/[0-9]/)) score++;
    if (password.match(/[^A-Za-z0-9]/)) score++;
    
    const strengths = [
      { score: 1, label: 'Weak', color: 'bg-red-500' },
      { score: 2, label: 'Fair', color: 'bg-orange-500' },
      { score: 3, label: 'Good', color: 'bg-yellow-500' },
      { score: 4, label: 'Strong', color: 'bg-green-500' },
    ];
    
    return strengths[score - 1] || { score: 0, label: 'Too weak', color: 'bg-red-500' };
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const passwordsMatch = newPassword === confirmPassword && newPassword !== '';
  const isFormValid = currentPassword && newPassword && confirmPassword && passwordsMatch && passwordStrength.score >= 2;

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      showNotification("error", "Please fix the errors before submitting");
      return;
    }

    if (!userEmail) {
      showNotification("error", "User email not found. Please try again.");
      return;
    }

    setLoading(true);
    
    try {
      // First, verify the current password by trying to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: userEmail,
        password: currentPassword,
      });

      if (signInError) {
        showNotification("error", "Current password is incorrect");
        setLoading(false);
        return;
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        showNotification("error", updateError.message || "Failed to update password");
        setLoading(false);
        return;
      }

      // Success!
      showNotification("success", "Password changed successfully! Please log in with your new password.");
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Sign out after password change (security best practice)
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/admin/login");
      }, 3000);

    } catch (error: any) {
      showNotification("error", error.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-white"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-green-300/40 to-lime-400/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tr from-lime-300/35 to-green-400/25 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      <div className="max-w-4xl mx-auto space-y-8 relative z-10">
        
        {/* Header */}
        <motion.div
          className="text-center mb-12 mt-10"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-2 bg-gradient-to-r from-green-100 to-lime-100 rounded-full border border-green-300/50 shadow-sm">
            <Shield className="w-5 h-5 text-green-800" />
            <span className="text-sm font-medium text-green-900">
              Security Settings
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-green-900 via-green-800 to-lime-900 bg-clip-text text-transparent">
              Change Password
            </span>
          </h1>

          <div className="w-32 h-1.5 bg-gradient-to-r from-green-600 via-green-500 to-lime-600 mx-auto rounded-full mb-8 shadow-md"></div>

          <p className="text-lg text-gray-800 max-w-3xl mx-auto font-medium">
            Update your password to keep your account secure
          </p>
        </motion.div>

        {/* Notification */}
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

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-white to-green-50 rounded-3xl overflow-hidden shadow-xl border border-green-200/60 backdrop-blur-sm bg-white/80"
        >
          {/* Card Header */}
          <div className="p-8 bg-gradient-to-r from-green-700 to-green-900">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Key className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Password Settings</h2>
                <p className="text-green-100 text-sm mt-1">Choose a strong password that you don't use elsewhere</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Email Display (read-only) */}
            {userEmail && (
              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <p className="text-sm text-gray-600">Updating password for:</p>
                <p className="font-medium text-green-800">{userEmail}</p>
              </div>
            )}

            {/* Current Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-green-500" />
                </div>
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 border-2 border-green-200 bg-white/80 backdrop-blur-sm text-gray-900 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                  placeholder="Enter current password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showCurrentPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-green-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-green-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyIcon className="h-5 w-5 text-green-500" />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 border-2 border-green-200 bg-white/80 backdrop-blur-sm text-gray-900 rounded-xl focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all duration-300"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showNewPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-green-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-green-600 transition-colors" />
                  )}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Password strength:</span>
                    <span className={`text-sm font-medium ${passwordStrength.color.replace('bg-', 'text-')}`}>
                      {passwordStrength.label}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(passwordStrength.score / 4) * 100}%` }}
                      className={`h-full ${passwordStrength.color}`}
                    />
                  </div>
                  <ul className="text-xs text-gray-500 space-y-1 mt-2">
                    <li className={newPassword.length >= 8 ? 'text-green-600' : ''}>
                      • At least 8 characters
                    </li>
                    <li className={newPassword.match(/[A-Z]/) ? 'text-green-600' : ''}>
                      • At least one uppercase letter
                    </li>
                    <li className={newPassword.match(/[0-9]/) ? 'text-green-600' : ''}>
                      • At least one number
                    </li>
                    <li className={newPassword.match(/[^A-Za-z0-9]/) ? 'text-green-600' : ''}>
                      • At least one special character
                    </li>
                  </ul>
                </motion.div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <CheckCircleIcon className="h-5 w-5 text-green-500" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full pl-12 pr-12 py-4 border-2 bg-white/80 backdrop-blur-sm text-gray-900 rounded-xl focus:ring-2 transition-all duration-300 ${
                    confirmPassword && !passwordsMatch
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                      : confirmPassword && passwordsMatch
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-200'
                      : 'border-green-200 focus:border-green-500 focus:ring-green-200'
                  }`}
                  placeholder="Confirm new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-green-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-green-600 transition-colors" />
                  )}
                </button>
              </div>
              
              {/* Password Match Indicator */}
              {confirmPassword && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm mt-1 ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}
                >
                  {passwordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                </motion.div>
              )}
            </div>

            {/* Password Tips Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-green-50 to-lime-50 rounded-xl p-6 border border-green-200/60"
            >
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                Password Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  Use a mix of letters, numbers, and symbols
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  Avoid using personal information like your name or birthdate
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  Don't reuse passwords from other websites
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  Change your password regularly for better security
                </li>
              </ul>
            </motion.div>

            {/* Important Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
              <p className="text-sm text-yellow-800 flex items-start gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <span>
                  <strong>Important:</strong> After changing your password, you'll be signed out and need to log in again with your new password for security reasons.
                </span>
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-6 border-t border-green-200/60">
              <button
                type="submit"
                disabled={loading || !isFormValid}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-green-700 to-green-900 text-white font-semibold hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 min-w-[200px]"
              >
                {loading ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <KeyIcon className="w-5 h-5" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

       
      </div>
    </div>
  );
};

export default Setting;