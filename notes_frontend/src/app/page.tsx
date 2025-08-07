"use client";

import React, { useEffect, useState } from "react";

// Types
type Note = {
  id: string;
  title: string;
  content: string;
  updated_at: string;
  created_at: string;
};

// Utilities for API calls (adjust BASE_URL for the backend; use a proxy on the server or env in prod)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api"; // fallback to local

// PUBLIC_INTERFACE
async function fetchNotes(query = ""): Promise<Note[]> {
  /** Fetches all notes or filtered by text. */
  const url = query
    ? `${BASE_URL}/notes?search=${encodeURIComponent(query)}`
    : `${BASE_URL}/notes`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch notes");
  return await res.json();
}



// PUBLIC_INTERFACE
async function createNote(note: { title: string; content: string }): Promise<Note> {
  /** Creates a new note. */
  const res = await fetch(`${BASE_URL}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to create note");
  return await res.json();
}

// PUBLIC_INTERFACE
async function updateNote(id: string, note: { title: string; content: string }): Promise<Note> {
  /** Updates an existing note by id. */
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note),
  });
  if (!res.ok) throw new Error("Failed to update note");
  return await res.json();
}

// PUBLIC_INTERFACE
async function deleteNote(id: string): Promise<void> {
  /** Deletes a note by id. */
  const res = await fetch(`${BASE_URL}/notes/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete note");
}


function formatDate(date: string) {
  if (!date) return "";
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type ViewMode = "list" | "edit" | "new";

// Main component
export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<null | Note>(null);
  const [view, setView] = useState<ViewMode>("list");
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [error, setError] = useState<string | null>(null);

  // Load notes, optionally by search
  const reloadNotes = async (txt = "") => {
    setLoading(true);
    try {
      const data = await fetchNotes(txt);
      setNotes(data);
    } catch {
      setError("Failed to load notes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reloadNotes();
  }, []);

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    await reloadNotes(search);
    setSelected(null); setView("list");
  };

  // Select note for viewing/editing
  const handleSelect = async (note: Note) => {
    setSelected(note);
    setFormData({ title: note.title, content: note.content });
    setView("edit");
  };

  // Prepare to add a note
  const handleNew = () => {
    setSelected(null);
    setFormData({ title: "", content: "" });
    setView("new");
  };

  // Handle form field changes
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Handle create or update note
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      if (view === "edit" && selected) {
        const n = await updateNote(selected.id, formData);
        setNotes((prev) => prev.map((x) => (x.id === n.id ? n : x)));
        setSelected(n);
      } else if (view === "new") {
        const n = await createNote(formData);
        setNotes((prev) => [n, ...prev]);
        setSelected(n);
        setView("edit");
      }
    } catch {
      setError("Save failed.");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await deleteNote(selected.id);
      setNotes((prev) => prev.filter((n) => n.id !== selected.id));
      setSelected(null);
      setView("list");
    } catch {
      setError("Delete failed.");
    } finally {
      setLoading(false);
    }
  };

  // UI
  return (
    <main className="flex flex-1 min-h-0 w-full">
      {/* Sidebar */}
      <aside className="w-64 min-w-[220px] border-r border-gray-200 bg-gray-50 dark:bg-white flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search notes..."
              className="flex-1 rounded-l px-3 py-2 text-sm border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-accent"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={loading}
            />
            <button
              className="bg-accent text-primary font-semibold rounded-r px-3 py-2 text-sm border-t border-b border-r border-gray-300 hover:bg-amber-200 transition"
              type="submit"
              disabled={loading}
            >
              Search
            </button>
          </form>
          <button
            className="mt-4 w-full bg-primary hover:bg-blue-700 text-white font-medium rounded px-4 py-2 text-sm transition"
            onClick={handleNew}
            disabled={loading}
          >
            + New Note
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-sm text-secondary">Loading...</div>
          ) : notes.length === 0 ? (
            <div className="p-4 text-sm text-secondary">No notes found.</div>
          ) : (
            <ul>
              {notes.map((note) => (
                <li key={note.id}>
                  <button
                    className={
                      "flex flex-col items-start w-full text-left px-4 py-3 border-b border-gray-100 transition " +
                      (selected?.id === note.id && view !== "new"
                        ? "bg-blue-100"
                        : "hover:bg-gray-100")
                    }
                    onClick={() => handleSelect(note)}
                    disabled={loading}
                  >
                    <span className="font-semibold text-base text-primary truncate">{note.title || "Untitled"}</span>
                    <span className="text-xs text-secondary truncate">{formatDate(note.updated_at)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
      {/* Main Area */}
      <section className="flex-1 flex flex-col min-h-0">
        {error && (
          <div className="bg-red-100 text-red-800 px-4 py-2 text-xs">
            {error}
          </div>
        )}
        <div className="flex-1 p-6 overflow-y-auto">
          {(view === "edit" || view === "new") && (
            <form
              className="mx-auto max-w-xl w-full flex flex-col gap-4"
              onSubmit={handleFormSubmit}
            >
              <input
                className="border border-gray-300 rounded px-3 py-2 text-lg font-medium focus:outline-none focus:ring-2 focus:ring-accent"
                name="title"
                required
                placeholder="Title"
                value={formData.title}
                maxLength={128}
                onChange={handleFormChange}
                disabled={loading}
              />
              <textarea
                className="border border-gray-300 rounded px-3 py-2 font-mono min-h-[180px] text-base focus:outline-none focus:ring-2 focus:ring-accent"
                name="content"
                required
                placeholder="Write your note here…"
                value={formData.content}
                maxLength={4000}
                onChange={handleFormChange}
                disabled={loading}
              />
              <div className="flex gap-2 justify-between">
                <div>
                  {(view === "edit") && (
                    <button
                      className="bg-primary text-white font-medium rounded px-4 py-2 text-sm hover:bg-blue-700 transition"
                      type="submit"
                      disabled={loading}
                    >
                      Save Changes
                    </button>
                  )}
                  {(view === "new") && (
                    <button
                      className="bg-accent text-primary font-semibold rounded px-4 py-2 text-sm hover:bg-amber-200 transition"
                      type="submit"
                      disabled={loading}
                    >
                      Create Note
                    </button>
                  )}
                </div>
                {view === "edit" && (
                  <button
                    className="ml-auto bg-red-50 text-red-600 border border-red-200 rounded px-4 py-2 text-sm hover:bg-red-100 transition"
                    type="button"
                    onClick={handleDelete}
                    disabled={loading}
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          )}
          {view === "list" && (
            <div className="mx-auto max-w-xl w-full flex flex-col gap-2">
              <div className="mb-8 text-lg text-secondary">
                <span>
                  Select a note from sidebar, or create a new note.
                </span>
              </div>
              {notes.length > 0 && (
                <div className="space-y-5">
                  {notes.map((n) => (
                    <div
                      key={n.id}
                      className="rounded border border-gray-200 bg-white px-5 py-4 shadow hover:shadow-md transition cursor-pointer"
                      onClick={() => handleSelect(n)}
                    >
                      <div className="font-semibold text-lg text-primary">
                        {n.title || "Untitled"}
                      </div>
                      <div className="text-sm text-secondary line-clamp-2">
                        {n.content.length > 120
                          ? n.content.slice(0, 120) + "…"
                          : n.content}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Updated {formatDate(n.updated_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        <footer className="h-12 border-t border-gray-100 flex items-center justify-center text-xs text-secondary bg-gray-50">
          notes_app · Minimal Next.js application
        </footer>
      </section>
    </main>
  );
}
