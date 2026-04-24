"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { FormEvent, useState } from "react";

const checklistItems = [
  { key: "esaInformation", label: "ESA Information" },
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
  const shelters = useQuery(api.shelters.list);
  const addShelter = useMutation(api.shelters.add);
  const removeShelter = useMutation(api.shelters.remove);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [interests, setInterests] = useState<Record<InterestKey, boolean>>({ ...emptyInterests });
  const [notes, setNotes] = useState("");

  const toggleInterest = (key: InterestKey) =>
    setInterests((prev) => ({ ...prev, [key]: !prev[key] }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await addShelter({
      name: name.trim(),
      email: email.trim(),
      organization: organization.trim(),
      interests,
      notes: notes.trim() || undefined,
    });
    setName("");
    setEmail("");
    setOrganization("");
    setInterests({ ...emptyInterests });
    setNotes("");
  };

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shelter Directory</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-10 space-y-5">
        <h2 className="text-xl font-semibold text-gray-800">Add a Shelter</h2>

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

      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Submissions {shelters && `(${shelters.length})`}
      </h2>

      {shelters === undefined ? (
        <p className="text-gray-500">Loading...</p>
      ) : shelters.length === 0 ? (
        <p className="text-gray-500">No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {shelters.map((shelter) => {
            const checked = checklistItems.filter(({ key }) => shelter.interests[key]);
            return (
              <div key={shelter._id} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">{shelter.name}</h3>
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
                  <button
                    onClick={() => removeShelter({ id: shelter._id })}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
