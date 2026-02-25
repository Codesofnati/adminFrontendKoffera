'use client';
import { useState, useEffect } from "react";
import { WrenchScrewdriverIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

interface Service {
  id: number;
  title: string;
  description: string;
}

export default function ServiceManager() {
  const API = process.env.NEXT_PUBLIC_API_URL;

  const [services, setServices] = useState<Service[]>([]);
  const [serviceTitle, setServiceTitle] = useState("");
  const [serviceDesc, setServiceDesc] = useState("");
  const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
  const [editingServiceTitle, setEditingServiceTitle] = useState("");
  const [editingServiceDesc, setEditingServiceDesc] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<number | null>(null); // mobile menu

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API}/services`);
      const data = await res.json();
      setServices(data);
    } catch {
      showNotification('error', 'Failed to fetch services.');
    }
  };

  const addService = async () => {
    if (!serviceTitle || !serviceDesc) {
      showNotification('error', 'Please fill all service fields.');
      return;
    }
    setIsAdding(true);
    const formData = new FormData();
    formData.append("title", serviceTitle);
    formData.append("description", serviceDesc);

    try {
      const res = await fetch(`${API}/services`, { method: "POST", body: formData });
      if (res.ok) {
        showNotification('success', 'Service added successfully!');
        setServiceTitle("");
        setServiceDesc("");
        fetchServices();
      } else showNotification('error', 'Failed to add service.');
    } catch {
      showNotification('error', 'Error adding service.');
    } finally {
      setIsAdding(false);
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm("Are you sure you want to delete this service?")) return;
    try {
      const res = await fetch(`${API}/services/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotification('success', 'Service deleted successfully!');
        fetchServices();
      } else showNotification('error', 'Failed to delete service.');
    } catch {
      showNotification('error', 'Error deleting service.');
    }
  };

  const updateService = async (id: number) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`${API}/services/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editingServiceTitle, description: editingServiceDesc }),
      });
      if (res.ok) {
        showNotification('success', 'Service updated successfully!');
        setEditingServiceId(null);
        setEditingServiceTitle("");
        setEditingServiceDesc("");
        fetchServices();
      } else showNotification('error', 'Failed to update service.');
    } catch {
      showNotification('error', 'Error updating service.');
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 p-6">
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
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Service Manager</h1>
          <p className="text-gray-600">Manage your services with ease—add, edit, and delete as needed.</p>
        </header>

        <section className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <WrenchScrewdriverIcon className="w-6 h-6 text-indigo-500" />
            Manage Services
          </h2>

          {/* ADD SERVICE FORM */}
          <div className="space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                placeholder="Service Title"
                value={serviceTitle}
                onChange={(e) => setServiceTitle(e.target.value)}
              />
              <textarea
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition col-span-1 md:col-span-2"
                placeholder="Description"
                value={serviceDesc}
                onChange={(e) => setServiceDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-center">
              <button
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                onClick={addService}
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
                    Add Service
                  </>
                )}
              </button>
            </div>
          </div>

          {/* SERVICES LIST */}
          <div className="space-y-4">
            {services.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No services added yet. Start by adding one above!</p>
            ) : (
              services.map((s) => (
                <div key={s.id} className="border border-gray-200 p-4 rounded-lg hover:bg-gray-50 transition-all duration-300 group relative">
                  {editingServiceId === s.id ? (
                    <div className="space-y-4">
                      <input
                        className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        value={editingServiceTitle}
                        onChange={(e) => setEditingServiceTitle(e.target.value)}
                        placeholder="Service Title"
                      />
                      <textarea
                        className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        value={editingServiceDesc}
                        onChange={(e) => setEditingServiceDesc(e.target.value)}
                        placeholder="Description"
                        rows={3}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => updateService(s.id)}
                          disabled={isUpdating}
                        >
                          {isUpdating ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : <CheckCircleIcon className="w-5 h-5" />}
                          Save
                        </button>
                        <button
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                          onClick={() => {
                            setEditingServiceId(null);
                            setEditingServiceTitle("");
                            setEditingServiceDesc("");
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                      <div className="flex-1 mb-4 sm:mb-0">
                        <h3 className="text-lg font-semibold text-gray-800">{s.title}</h3>
                        <p className="text-gray-600 mt-1">{s.description}</p>
                      </div>

                      {/* Desktop buttons */}
                      <div className="hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                          onClick={() => {
                            setEditingServiceId(s.id);
                            setEditingServiceTitle(s.title);
                            setEditingServiceDesc(s.description);
                          }}
                        >
                          <PencilIcon className="w-4 h-4" /> Edit
                        </button>
                        <button
                          className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
                          onClick={() => deleteService(s.id)}
                        >
                          <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                      </div>

                      {/* Mobile 3-dot menu */}
                      <div className="sm:hidden relative">
                        <button
                          className="p-2 rounded-full hover:bg-gray-200 transition " 
                          onClick={() => setMenuOpenId(menuOpenId === s.id ? null : s.id)}
                        >
                          ⋮
                        </button>
                        {menuOpenId === s.id && (
                          <div className="absolute left-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg flex flex-col z-10">
                            <button
                              className="px-4 py-2 text-left hover:bg-yellow-100 flex items-center gap-2"
                              onClick={() => {
                                setEditingServiceId(s.id);
                                setEditingServiceTitle(s.title);
                                setEditingServiceDesc(s.description);
                                setMenuOpenId(null);
                              }}
                            >
                              <PencilIcon className="w-4 h-4" /> Edit
                            </button>
                            <button
                              className="px-4 py-2 text-left hover:bg-red-100 flex items-center gap-2"
                              onClick={() => {
                                deleteService(s.id);
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
