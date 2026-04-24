"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

const checklistItems = [
  { key: "esaInformation", label: "ESA Information Pamphlet" },
  { key: "esaLetterOnline", label: "How to Get an ESA Letter Online Safely" },
  { key: "blogPost", label: "Blog Post" },
  { key: "resourcesPage", label: "Resources Page Link" },
  { key: "contactForm", label: "Contact Form for ESA Related Questions" },
  { key: "videoTraining", label: "Video Training for Volunteers" },
] as const;

export default function Submissions() {
  const shelters = useQuery(api.shelters.list);
  const removeShelter = useMutation(api.shelters.remove);

  return (
    <main className="max-w-2xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Submissions</h1>

      {shelters === undefined ? (
        <p className="text-gray-500">Loading...</p>
      ) : shelters.length === 0 ? (
        <p className="text-gray-500">No submissions yet.</p>
      ) : (
        <div className="space-y-4">
          {shelters.map((shelter) => {
            const checked = checklistItems.filter(({ key }) => shelter.interests[key as keyof typeof shelter.interests]);
            return (
              <div key={shelter._id} className="bg-white rounded-lg shadow p-5">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-gray-900">{shelter.name}</h3>
                    <p className="text-gray-600 text-sm">{shelter.titleRole}</p>
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
