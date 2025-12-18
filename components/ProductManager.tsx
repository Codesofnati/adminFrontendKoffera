'use client';
import { useState, useEffect } from "react";
import { CubeIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Product {
  id: number;
  name: string;
  description: string;
}

export default function ProductManager() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editingProductName, setEditingProductName] = useState("");
  const [editingProductDesc, setEditingProductDesc] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null); // For mobile 3-dot menu

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

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
      {/* NOTIFICATION */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 p-4 rounded-lg shadow-lg transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Product Manager</h1>
          <p className="text-gray-600">Manage your products with ease—add, edit, and delete as needed.</p>
        </header>

        <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <CubeIcon className="w-6 h-6 text-orange-500" />
            Manage Products
          </h2>

          {/* ADD PRODUCT FORM */}
          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                aria-label="Product Name"
              />
              <textarea
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition col-span-1 md:col-span-2"
                placeholder="Description"
                value={productDesc}
                onChange={(e) => setProductDesc(e.target.value)}
                rows={3}
                aria-label="Product Description"
              />
            </div>
            <div className="flex justify-center">
              <button
                className="bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                    <PlusIcon className="w-5 h-5" />
                    Add Product
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PRODUCTS LIST */}
          <div className="space-y-4">
            {products.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No products added yet. Start by adding one above!</p>
            ) : (
              products.map((p) => (
                <div key={p.id} className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 group relative">
                  {editingProductId === p.id ? (
                    <div className="space-y-4">
                      <input
                        className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                        value={editingProductName}
                        onChange={(e) => setEditingProductName(e.target.value)}
                        placeholder="Product Name"
                      />
                      <textarea
                        className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
                        value={editingProductDesc}
                        onChange={(e) => setEditingProductDesc(e.target.value)}
                        placeholder="Description"
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                        <h3 className="text-lg font-semibold text-gray-800">{p.name}</h3>
                        <p className="text-gray-600 mt-1">{p.description}</p>
                      </div>

                      {/* Desktop buttons */}
                      <div className="hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                          onClick={() => {
                            setEditingProductId(p.id);
                            setEditingProductName(p.name);
                            setEditingProductDesc(p.description);
                          }}
                        >
                          <PencilIcon className="w-4 h-4" /> Edit
                        </button>
                        <button
                          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                          onClick={() => deleteProduct(p.id)}
                        >
                          <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                      </div>

                      {/* Mobile 3-dot menu */}
                      <div className="sm:hidden relative z-10">
                        <button
                          className="p-2 rounded-full hover:bg-gray-200 transition"
                          onClick={() => setMenuOpenId(menuOpenId === p.id ? null : p.id)}
                        >
                          ⋮
                        </button>
                        {menuOpenId === p.id && (
                          <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col z-10">
                            <button
                              className="px-4 py-2 text-left hover:bg-yellow-100 flex items-center gap-2"
                              onClick={() => {
                                setEditingProductId(p.id);
                                setEditingProductName(p.name);
                                setEditingProductDesc(p.description);
                                setMenuOpenId(null);
                              }}
                            >
                              <PencilIcon className="w-4 h-4" /> Edit
                            </button>
                            <button
                              className="px-4 py-2 text-left hover:bg-red-100 flex items-center gap-2"
                              onClick={() => {
                                deleteProduct(p.id);
                                setMenuOpenId(null);
                              }}
                            >
                              <TrashIcon className="w-4 h-4" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
