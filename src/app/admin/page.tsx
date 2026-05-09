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
  const [shelters, setShelters] = useState<Doc<"shelters">[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const result = await convex.query(api.shelters.listProtected, {
        password: passwordInput,
      });
      setShelters(result);
    } catch {
      setError("Incorrect password.");
    } finally {
      setSubmitting(false);
    }
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
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Submissions</h1>

      {shelters.length === 0 ? (
        <p className="text-gray-500">No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {shelters.map((shelter) => {
            const checked = checklistItems.filter(
              ({ key }) => shelter.interests[key as keyof typeof shelter.interests]
            );
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
                  {shelter.notes && (
                    <p className="text-gray-500 mt-2 text-sm">
                      <span className="font-medium">Notes:</span> {shelter.notes}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
