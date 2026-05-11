"use client";

import { useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Doc } from "../../../convex/_generated/dataModel";
import { FormEvent, useState } from "react";

const checklistItems = [
  { key: "esaInformation", label: "ESA Information Pamphlet" },
  { key: "esaLetterOnline", label: "How to Get an ESA Letter Online Safely" },
  { key: "blogPost", label: "Blog Post" },
  { key: "resourcesPage", label: "Resources Page Link" },
  { key: "contactForm", label: "Contact Form for ESA Related Questions" },
  { key: "videoTraining", label: "Video Training for Volunteers" },
] as const;

export default function Admin() {
  const convex = useConvex();
  const [passwordInput, setPasswordInput] = useState("");
  const [password, setPassword] = useState<string | null>(null);
  const [shelters, setShelters] = useState<Doc<"shelters">[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await convex.query(api.shelters.listProtected, {
        password: passwordInput,
      });
      setShelters(result);
      setPassword(passwordInput);
    } catch {
      setError("Incorrect password.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (shelter: Doc<"shelters">) => {
    setEditingId(shelter._id);
    setEditingNotes(shelter.notes ?? "");
    setSaveError(null);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingNotes("");
    setSaveError(null);
  };

  const saveNotes = async (id: Doc<"shelters">["_id"]) => {
    if (!password) return;
    setSavingId(id);
    setSaveError(null);
    try {
      await convex.mutation(api.shelters.updateNotes, {
        password,
        id,
        notes: editingNotes,
      });
      setShelters((prev) =>
        prev
          ? prev.map((s) => (s._id === id ? { ...s, notes: editingNotes } : s))
          : prev
      );
      setEditingId(null);
      setEditingNotes("");
    } catch {
      setSaveError("Failed to save. Please try again.");
    } finally {
      setSavingId(null);
    }
  };

  const escapeCsv = (value: string) => {
    if (/[",\n\r]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  };

  const handleDownloadCsv = () => {
    if (!shelters) return;
    const headers = [
      "Name",
      "Title/Role",
      "Email",
      "Organization",
      ...checklistItems.map((item) => item.label),
      "Notes",
      "Submitted At",
    ];
    const rows = shelters.map((shelter) => [
      shelter.name,
      shelter.titleRole ?? "",
      shelter.email,
      shelter.organization,
      ...checklistItems.map(({ key }) =>
        shelter.interests[key as keyof typeof shelter.interests] ? "Yes" : "No"
      ),
      shelter.notes ?? "",
      new Date(shelter._creationTime).toISOString(),
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsv(String(cell))).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `shelters-${date}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (shelters === null) {
    return (
      <main className="max-w-md mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            required
            value={passwordInput}
            onChange={(e) => setPasswordInput(e.target.value)}
            className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition w-full disabled:opacity-50"
          >
            {submitting ? "Checking…" : "Unlock"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Submissions</h1>
        {shelters.length > 0 && (
          <button
            onClick={handleDownloadCsv}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm"
          >
            Download CSV
          </button>
        )}
      </div>

      {shelters.length === 0 ? (
        <p className="text-gray-500">No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {shelters.map((shelter) => {
            const checked = checklistItems.filter(
              ({ key }) => shelter.interests[key as keyof typeof shelter.interests]
            );
            const isEditing = editingId === shelter._id;
            const isSaving = savingId === shelter._id;
            return (
              <div key={shelter._id} className="bg-white rounded-lg shadow p-5">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-gray-900">{shelter.name}</h3>
                  {shelter.titleRole && (
                    <p className="text-gray-600 text-sm">{shelter.titleRole}</p>
                  )}
                  <p className="text-gray-600 text-sm">{shelter.email}</p>
                  <p className="text-gray-600 text-sm">{shelter.organization}</p>
                  {checked.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-500 uppercase">Interests</p>
                      <ul className="list-disc list-inside text-sm text-gray-700 mt-1">
                        {checked.map(({ key, label }) => (
                          <li key={key}>{label}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-gray-500 uppercase">Notes</p>
                      {!isEditing && (
                        <button
                          onClick={() => startEditing(shelter)}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          {shelter.notes ? "Edit" : "Add"}
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <div className="mt-1 space-y-2">
                        <textarea
                          value={editingNotes}
                          onChange={(e) => setEditingNotes(e.target.value)}
                          rows={3}
                          className="border rounded-md px-3 py-2 w-full text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {saveError && editingId === shelter._id && (
                          <p className="text-xs text-red-600">{saveError}</p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveNotes(shelter._id)}
                            disabled={isSaving}
                            className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition text-xs disabled:opacity-50"
                          >
                            {isSaving ? "Saving…" : "Save"}
                          </button>
                          <button
                            onClick={cancelEditing}
                            disabled={isSaving}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-200 transition text-xs disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : shelter.notes ? (
                      <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">
                        {shelter.notes}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm mt-1 italic">No notes</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
