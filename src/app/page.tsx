"use client";

import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FormEvent, useState } from "react";

const checklistItems = [
  { key: "esaInformation", label: "ESA Information Pamphlet" },
  { key: "esaLetterOnline", label: "How to Get an ESA Letter Online Safely" },
  { key: "blogPost", label: "Blog Post" },
  { key: "resourcesPage", label: "Resources Page Link" },
  { key: "contactForm", label: "Contact Form for ESA Related Questions" },
  { key: "videoTraining", label: "Video Training for Volunteers" },
] as const;

type InterestKey = (typeof checklistItems)[number]["key"];

const emptyInterests: Record<InterestKey, boolean> = {
  esaInformation: false,
  esaLetterOnline: false,
  blogPost: false,
  resourcesPage: false,
  contactForm: false,
  videoTraining: false,
};

export default function Home() {
  const addShelter = useMutation(api.shelters.add);

  const [name, setName] = useState("");
  const [titleRole, setTitleRole] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [interests, setInterests] = useState<Record<InterestKey, boolean>>({ ...emptyInterests });
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const toggleInterest = (key: InterestKey) =>
    setInterests((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await addShelter({
      name: name.trim(),
      titleRole: titleRole.trim(),
      email: email.trim(),
      organization: organization.trim(),
      interests,
      notes: notes.trim() || undefined,
    });
    setName("");
    setTitleRole("");
    setEmail("");
    setOrganization("");
    setInterests({ ...emptyInterests });
    setNotes("");
    setSubmitted(true);
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shelter Contact Information</h1>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <p className="text-green-800 text-lg font-semibold">Thank you for your submission!</p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 text-blue-600 hover:text-blue-800 underline"
          >
            Submit another
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-5">
          <h2 className="text-xl font-semibold text-gray-800">Shelter Contact Information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              required
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              required
              placeholder="Title & Role"
              value={titleRole}
              onChange={(e) => setTitleRole(e.target.value)}
              className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <input
            required
            placeholder="Organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <fieldset>
            <legend className="text-sm font-medium text-gray-700 mb-2">
              Interested in (check all that apply):
            </legend>
            <div className="space-y-2">
              {checklistItems.map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={interests[key]}
                    onChange={() => toggleInterest(key)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <textarea
            placeholder="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="border rounded-md px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition"
          >
            Submit
          </button>
        </form>
      )}
    </main>
  );
}
