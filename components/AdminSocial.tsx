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

  // Fetch social links
  const fetchLinks = async () => {
    const res = await fetch(`${API}/social`);
    const data = await res.json();
    setLinks(data);
  };

  const openEditor = (link: Social) => {
    setSelected(link);
    setEditUrl(link.url);
  };

  const saveChange = async () => {
    if (!selected) return;
await fetch(`${API}/social/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: editUrl }),
    });
    setSelected(null);
    fetchLinks();
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <div className="p-10 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-10 text-gray-800">Manage Social Links</h1>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {links.map((link) => (
          <div
            key={link.id}
            className="p-6 bg-white shadow-lg rounded-2xl border cursor-pointer hover:shadow-amber-400/40 transition"
            onClick={() => openEditor(link)}
          >
            <h2 className="text-xl font-semibold">{link.platform}</h2>
            <p className="text-sm text-gray-500 mt-2 truncate">{link.url}</p>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-xl w-96">
            <h3 className="text-2xl font-bold mb-4">Edit {selected.platform}</h3>

            <input
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              className="w-full border p-3 rounded mb-5"
            />

            <div className="flex justify-between">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={saveChange}
                className="px-4 py-2 rounded bg-emerald-600 text-white"
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
