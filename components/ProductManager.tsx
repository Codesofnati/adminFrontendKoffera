'use client';
import { useState, useEffect, useRef } from "react";
import { CubeIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { 
  FiPackage, 
  FiEdit, 
  FiTrash2, 
  FiCheckCircle,
  FiAlertCircle,
  FiCoffee,
  FiPlus
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
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";

interface Product {
  id: number;
  name: string;
  description: string;
}

export default function ProductManager() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  
  /* REFS FOR ANIMATIONS */
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  
  const isFormInView = useInView(formRef, { once: true, amount: 0.3 });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProductName, setEditingProductName] = useState("");
  const [editingProductDesc, setEditingProductDesc] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null);
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);

  /* ANIMATION VARIANTS */
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(data);
    } catch {
      showNotification('error', 'Failed to fetch products.');
    }
  };

  const addProduct = async () => {
    if (!productName || !productDesc) {
      showNotification('error', 'Please fill all product fields.');
      return;
    }
    setIsAdding(true);
    const formData = new FormData();
    formData.append("name", productName);
    formData.append("description", productDesc);
    try {
      const res = await fetch(`${API}/products`, { method: "POST", body: formData });
      if (res.ok) {
        showNotification('success', 'Product added successfully!');
        setProductName("");
        setProductDesc("");
        fetchProducts();
      } else showNotification('error', 'Failed to add product.');
    } catch {
      showNotification('error', 'Error adding product.');
    } finally {
      setIsAdding(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      const res = await fetch(`${API}/products/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification('success', 'Product deleted successfully!');
        fetchProducts();
      } else showNotification('error', 'Failed to delete product.');
    } catch {
      showNotification('error', 'Error deleting product.');
    }
  };

  const updateProduct = async (id: number) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`${API}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingProductName, description: editingProductDesc }),
      });
      if (res.ok) {
        showNotification('success', 'Product updated successfully!');
        setEditingProductId(null);
        setEditingProductName("");
        setEditingProductDesc("");
        fetchProducts();
      } else showNotification('error', 'Failed to update product.');
    } catch {
      showNotification('error', 'Error updating product.');
    } finally {
      setIsUpdating(false);
    }
  };

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

  useEffect(() => {
    fetchProducts();
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
                <FiPackage className="w-8 h-8 text-emerald-600" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-bold text-gray-800 mb-4"
          >
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-green-600 bg-clip-text text-transparent bg-[length:200%] animate-gradient">
              Product Manager
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
            Manage your coffee products with elegance
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

        {/* MAIN SECTION */}
        <motion.div
          ref={formRef}
          variants={fadeInUp}
          initial="hidden"
          animate={isFormInView ? "visible" : "hidden"}
          className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-emerald-100 hover:shadow-3xl transition-all duration-500"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
            <div className="p-3 bg-emerald-500 rounded-xl shadow-lg">
              <CubeIcon className="w-5 h-5 text-white" />
            </div>
            <span className="bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
              Manage Products
            </span>
          </h2>

          {/* ADD PRODUCT FORM */}
          <div className="space-y-6 mb-8 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border-2 border-emerald-200 p-3 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition bg-white text-gray-700"
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                aria-label="Product Name"
              />
              <textarea
                className="border-2 border-emerald-200 p-3 rounded-xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition bg-white text-gray-700 col-span-1 md:col-span-2"
                placeholder="Description"
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                rows={3}
                aria-label="Product Description"
              />
            </div>
            <div className="flex justify-center">
              <button
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg hover:shadow-xl"
                onClick={addProduct}
                disabled={isAdding}
              >
                {isAdding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </>
                ) : (
                  <>
                    <FiPlus className="w-5 h-5" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PRODUCTS LIST */}
          <div className="space-y-4">
            {products.length === 0 ? (
              <motion.div
                variants={scaleIn}
                initial="hidden"
                animate="visible"
                className="text-center py-16"
              >
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-xl opacity-30" />
                  <div className="relative bg-white p-6 rounded-full shadow-xl mb-4">
                    <FiPackage className="w-12 h-12 text-emerald-400" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Products Yet</h3>
                <p className="text-gray-500">Add your first product using the form above</p>
              </motion.div>
            ) : (
              products.map((p, index) => (
                <motion.div
                  key={p.id}
                  variants={scaleIn}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                  onHoverStart={() => setHoveredItem(p.id)}
                  onHoverEnd={() => setHoveredItem(null)}
                  className="border-2 border-emerald-100 p-4 rounded-xl hover:bg-emerald-50/50 transition-all duration-300 relative group"
                >
                  {editingProductId === p.id ? (
                    <div className="space-y-4 p-2">
                      <input
                        className="border-2 border-emerald-200 p-2 rounded-xl w-full focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition bg-white"
                        value={editingProductName}
                        onChange={(e) => setEditingProductName(e.target.value)}
                        placeholder="Product Name"
                      />
                      <textarea
                        className="border-2 border-emerald-200 p-2 rounded-xl w-full focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition bg-white"
                        value={editingProductDesc}
                        onChange={(e) => setEditingProductDesc(e.target.value)}
                        placeholder="Description"
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                          onClick={() => updateProduct(p.id)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Saving...
                            </>
                          ) : (
                            <>
                              <CheckCircleIcon className="w-5 h-5" />
                              Save
                            </>
                          )}
                        </button>
                        <button
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300"
                          onClick={() => {
                            setEditingProductId(null);
                            setEditingProductName("");
                            setEditingProductDesc("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="flex-1 mb-4 sm:mb-0">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <FiPackage className="w-5 h-5 text-emerald-500" />
                          {p.name}
                        </h3>
                        <p className="text-gray-600 mt-1 ml-7">{p.description}</p>
                      </div>

                      {/* Desktop buttons - solid emerald */}
                      <div className="hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                          onClick={() => {
                            setEditingProductId(p.id);
                            setEditingProductName(p.name);
                            setEditingProductDesc(p.description);
                          }}
                        >
                          <FiEdit className="w-4 h-4" /> Edit
                        </button>
                        <button
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 shadow-md hover:shadow-lg transition-all"
                          onClick={() => deleteProduct(p.id)}
                        >
                          <FiTrash2 className="w-4 h-4" /> Delete
                        </button>
                      </div>

                      {/* Mobile 3-dot menu */}
                      <div className="sm:hidden relative z-10">
                        <button
                          className="p-2 rounded-full hover:bg-emerald-100 transition text-emerald-600 text-xl font-bold"
                          onClick={() => setMenuOpenId(menuOpenId === p.id ? null : p.id)}
                        >
                          ⋮
                        </button>
                        <AnimatePresence>
                          {menuOpenId === p.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute left-0 mt-2 w-40 bg-white border-2 border-emerald-100 rounded-xl shadow-xl flex flex-col z-10 overflow-hidden"
                            >
                              <button
                                className="px-4 py-3 text-left hover:bg-emerald-50 flex items-center gap-2 text-emerald-700"
                                onClick={() => {
                                  setEditingProductId(p.id);
                                  setEditingProductName(p.name);
                                  setEditingProductDesc(p.description);
                                  setMenuOpenId(null);
                                }}
                              >
                                <FiEdit className="w-4 h-4" /> Edit
                              </button>
                              <button
                                className="px-4 py-3 text-left hover:bg-red-50 flex items-center gap-2 text-red-600 border-t border-emerald-100"
                                onClick={() => {
                                  deleteProduct(p.id);
                                  setMenuOpenId(null);
                                }}
                              >
                                <FiTrash2 className="w-4 h-4" /> Delete
                              </button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))
            )}
          </div>
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
              ✦ Premium Coffee Products ✦
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