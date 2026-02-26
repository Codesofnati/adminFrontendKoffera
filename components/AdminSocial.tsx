"use client";
import { useEffect, useState } from "react";

interface Social {
  id: number;
  platform: string;
  url: string;
  icon: string;
}

export default function AdminSocial() {
  const API = process.env.NEXT_PUBLIC_API_URL;
  const [links, setLinks] = useState<Social[]>([]);
  const [selected, setSelected] = useState<Social | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch social links
  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching from:", `${API}/social`);
      
      const res = await fetch(`${API}/social`);
      console.log("Response status:", res.status);
      
      const data = await res.json();
      console.log("Raw response data:", data);
      
      // Check what format the data is
      if (Array.isArray(data)) {
        console.log("Data is an array with length:", data.length);
        setLinks(data);
      } else if (data && typeof data === 'object') {
        console.log("Data is an object with keys:", Object.keys(data));
        
        // Try common patterns
        if (Array.isArray(data.data)) {
          console.log("Found data.data array");
          setLinks(data.data);
        } else if (Array.isArray(data.links)) {
          console.log("Found data.links array");
          setLinks(data.links);
        } else if (Array.isArray(data.social)) {
          console.log("Found data.social array");
          setLinks(data.social);
        } else if (data.id) {
          // Single object, wrap in array
          console.log("Single object detected, wrapping in array");
          setLinks([data]);
        } else {
          console.error("Unexpected data format:", data);
          setLinks([]);
          setError("Unexpected data format from server");
        }
      } else {
        console.error("Data is neither array nor object:", data);
        setLinks([]);
        setError("Invalid data format");
      }
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Failed to fetch social links");
      setLinks([]);
    } finally {
      setLoading(false);
    }
  };

  const openEditor = (link: Social) => {
    setSelected(link);
    setEditUrl(link.url);
  };

  const saveChange = async () => {
    if (!selected) return;
    
    try {
      const res = await fetch(`${API}/social/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: editUrl }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      setSelected(null);
      fetchLinks(); // Refresh the list
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save changes");
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  if (loading) {
    return (
      <div className="p-10 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-gray-800">Manage Social Links</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 max-w-5xl mx-auto">
        <h1 className="text-4xl font-bold mb-10 text-gray-800">Manage Social Links</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchLinks}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">
        <span className="bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent">
          Manage Social Links
        </span>
      </h1>

      {links.length === 0 ? (
        <div className="text-center py-12 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-emerald-600">No social links found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 text-black md:grid-cols-3 gap-6">
          {links.map((link) => (
            <div
              key={link.id}
              className="p-6 bg-white shadow-lg rounded-2xl border-2 border-emerald-100 cursor-pointer hover:shadow-xl hover:border-emerald-300 transition-all duration-300"
              onClick={() => openEditor(link)}
            >
              <h2 className="text-xl font-semibold text-emerald-800">{link.platform}</h2>
              <p className="text-sm text-gray-600 mt-2 truncate">{link.url}</p>
              <div className="mt-3 text-xs text-emerald-500 font-medium">
                Click to edit
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-8 text-black rounded-2xl shadow-2xl w-96 border-2 border-emerald-200">
            <h3 className="text-2xl font-bold mb-4 text-emerald-800">Edit {selected.platform}</h3>

            <input
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="w-full border-2 border-emerald-200 p-3 rounded-xl mb-5 focus:ring-4 focus:ring-emerald-200 focus:border-emerald-500 transition"
              placeholder="Enter URL"
            />

            <div className="flex justify-between gap-3">
              <button
                onClick={() => setSelected(null)}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveChange}
                className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-all shadow-lg hover:shadow-xl"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}