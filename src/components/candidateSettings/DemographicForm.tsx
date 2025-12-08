import React, { useState } from "react";
import Tag from "./Tag";

/**
 * Demographic form with simple state & skeleton-like initial load
 * In real app, fetch existing values and submit via API (e.g., Supabase)
 */
export default function DemographicForm({ onBack }) {
  const [loading] = useState(false);
  const [gender, setGender] = useState("");
  const [disability, setDisability] = useState("");
  const [tags, setTags] = useState(["first-gen", "urban"]);

  const save = () => {
    // TODO: replace with API call
    console.log({ gender, disability, tags });
    alert("Saved (mock)");
    onBack();
  };

  return (
    <div>
      <button onClick={onBack} className="text-blue-600 mb-4">
        ← Back
      </button>

      <h2 className="text-xl font-semibold mb-4">Demographic Information</h2>

      {loading ? (
        <div className="space-y-3">
          <div className="h-8 bg-gray-100 rounded w-2/5 animate-pulse" />
          <div className="h-8 bg-gray-100 rounded w-3/5 animate-pulse" />
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium mb-2">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="border rounded w-full md:w-2/3 p-2"
              aria-label="Select gender"
            >
              <option value="">Select</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="nonbinary">Non-binary</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Disability</label>
            <select
              value={disability}
              onChange={(e) => setDisability(e.target.value)}
              className="border rounded w-full md:w-2/3 p-2"
              aria-label="Disability status"
            >
              <option value="">Select</option>
              <option value="no">No</option>
              <option value="yes">Yes</option>
              <option value="prefer_not">Prefer not to say</option>
            </select>
          </div>

          <div>
            <div className="text-sm font-medium mb-2">Tags (example)</div>
            <div className="flex items-center flex-wrap">
              {tags.map((t) => (
                <Tag key={t}>{t}</Tag>
              ))}
              <button
                type="button"
                onClick={() => setTags((s) => [...s, `tag-${s.length + 1}`])}
                className="ml-1 mt-1 inline-flex items-center px-2 py-1 border rounded text-sm text-gray-600"
              >
                + add
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Agree and save
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
