"use client";
import { createSupabaseClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Image as ImageIcon,
  Video,
  Package,
  Wrench,
  Share2,
  Menu,
  X,
  Home,
  LogOut,
  Coffee,
  Globe,
  Users,
  Settings,
  Leaf,
} from "lucide-react";
import { FiPlus } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import AdminPostsPage from "../../components/Posts";
import ImageUploader from "../../components/ImageUploader";
import ProductManager from "../../components/ProductManager";
import VideoUploader from "../../components/VideoUploader";
import AdminSocial from "../../components/AdminSocial";

const menu = [
  { key: "images", label: "Images", icon: ImageIcon, color: "from-green-800 to-green-900" },
  { key: "videos", label: "Videos", icon: Video, color: "from-green-800 to-green-900" },
  { key: "products", label: "Products", icon: Package, color: "from-green-800 to-green-900" },
  { key: "posts", label: "Posts", icon: Leaf, color: "from-green-800 to-green-900" },
  { key: "social", label: "Social", icon: Share2, color: "from-green-800 to-green-900" },
  { key: "setting", label: "Setting", icon: Settings, color: "from-green-800 to-green-900" },
];

type Section = "images" | "videos" | "products" | "posts" | "social" | "setting";

export default function AdminPageContent() {
  const [section, setSection] = useState<Section>("images");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createSupabaseClient();
  const router = useRouter();

  // Fetch user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      router.push("/admin/login");
    } else {
      console.error(error.message);
    }
  };

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Auto-close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (sidebarOpen && isMobile && !target.closest('aside') && !target.closest('button[class*="p-2"]')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [sidebarOpen, isMobile]);

  const handleSectionChange = (newSection: Section) => {
    setSection(newSection);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  // Helper function to format section title
  const formatSectionTitle = (section: Section): string => {
    return section.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Function to open create post modal
  const openCreatePostModal = () => {
    window.dispatchEvent(new CustomEvent('openCreatePostModal'));
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-50 to-lime-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-200 border-t-green-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-green-700 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-50 to-lime-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-green-300/20 to-lime-400/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-tr from-lime-300/20 to-green-400/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky top-0 left-0 z-40 h-screen w-80 bg-white/90 backdrop-blur-xl border-r border-green-200/50 flex flex-col transition-all duration-300 ease-in-out shadow-2xl lg:shadow-none
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Sidebar Header */}
        <div className="flex-shrink-0 p-6 border-b border-green-200/50 bg-gradient-to-r from-green-50 to-lime-50">
          <div className="flex items-center justify-between">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="p-3 bg-gradient-to-br from-green-700 to-green-900 rounded-xl shadow-lg">
                <Coffee className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-green-900 to-green-700 bg-clip-text text-transparent">
                  MAB Coffee
                </h1>
                <p className="text-xs text-green-600 font-medium">Admin Dashboard</p>
              </div>
            </motion.div>
            
            <button
              className="lg:hidden p-2 hover:bg-green-100 rounded-lg transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5 text-green-700" />
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto min-h-0 py-4 px-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-green-600 uppercase tracking-wider px-4 py-2">
              Content Management
            </p>
            {menu.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleSectionChange(item.key as Section)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group
                    ${section === item.key
                      ? `bg-gradient-to-r ${item.color} text-white shadow-lg shadow-green-500/20`
                      : "text-gray-600 hover:bg-green-50 hover:text-green-700"
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-all duration-300
                    ${section === item.key 
                      ? "bg-white/20" 
                      : "bg-green-100 group-hover:bg-green-200"
                    }
                  `}>
                    <Icon className={`w-5 h-5 ${section === item.key ? "text-white" : "text-green-700"}`} />
                  </div>
                  <span className="font-medium flex-1 text-left">{item.label}</span>
                  {section === item.key && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 bg-white rounded-full"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="flex-shrink-0 p-4 border-t border-green-200/50 bg-gradient-to-r from-green-50 to-lime-50">
          <div className="lg:hidden mb-3 p-3 bg-white/50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-white font-semibold text-sm">
                  {user?.email?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-700 truncate">Admin</p>
                <p className="text-xs text-green-600 truncate">{user?.email || 'admin@mabcoffee.com'}</p>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 group"
          >
            <div className="p-2 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
              <LogOut className="w-5 h-5 text-red-600" />
            </div>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-screen overflow-y-auto relative">
        {/* Top Bar - Sticky */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-green-200/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="lg:hidden p-2 rounded-xl bg-gradient-to-r from-green-700 to-green-900 text-white shadow-lg hover:shadow-xl transition-all"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </motion.button>
              
              <div>
                <motion.h2 
                  key={section}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-2xl font-bold bg-gradient-to-r from-green-900 to-green-700 bg-clip-text text-transparent"
                >
                  {formatSectionTitle(section)} Management
                </motion.h2>
                <p className="text-sm text-green-600">
                  Manage your {formatSectionTitle(section)} content
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* New Post Button - Only visible when on posts section */}
              {section === "posts" && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openCreatePostModal}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all group"
                >
                  <FiPlus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  <span className="text-sm font-medium">New Story</span>
                </motion.button>
              )}

              {/* Desktop user info */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="hidden sm:flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-green-50 to-lime-50 rounded-full border border-green-200/50"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-700 to-green-900 flex items-center justify-center shadow-lg">
                  <span className="text-white font-semibold text-sm">
                    {user?.email?.charAt(0).toUpperCase() || 'A'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Admin</p>
                  <p className="text-xs text-green-600">{user?.email || 'admin@mabcoffee.com'}</p>
                </div>
              </motion.div>

              {/* Mobile logout button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="lg:hidden p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-300 border border-red-200/50 shadow-sm"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={section}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Content Section */}
              {section === "images" && <ImageUploader />}
              {section === "videos" && <VideoUploader />}
              {section === "products" && <ProductManager />}
              {section === "posts" && <AdminPostsPage />}
              {section === "social" && <AdminSocial />}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}