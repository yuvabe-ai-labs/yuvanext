import React, { useRef, useState } from "react";

/**
 * Minimal file upload UI. Replace onUpload with your storage API
 * - Accepts drag + click
 * - Shows selected file name and size
 */
export default function VerificationUpload({ onBack }) {
  const fileRef = useRef();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = (files) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size > 10 * 1024 * 1024) {
      alert("Max 10MB allowed");
      return;
    }
    setFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const upload = async () => {
    if (!file) return alert("Select a file");
    setUploading(true);
    // replace with real upload API (Supabase / S3)
    await new Promise((r) => setTimeout(r, 800));
    setUploading(false);
    alert("Uploaded (mock)");
    onBack();
  };

  return (
    <div>
      <button onClick={onBack} className="text-blue-600 mb-4">
        ← Back
      </button>

      <h2 className="text-xl font-semibold mb-4">Verifications</h2>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="border-dashed border-2 border-blue-200 rounded p-8 text-center bg-blue-50"
      >
        <div className="mb-2">📁</div>
        <div className="mb-2 font-medium">
          Drag your file(s) or{" "}
          <button
            onClick={() => fileRef.current.click()}
            className="text-blue-600 underline"
          >
            browse
          </button>
        </div>
        <div className="text-sm text-gray-500">Max 10 MB files are allowed</div>

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="upload verification"
        />
      </div>

      {file && (
        <div className="mt-4 flex items-center justify-between border rounded p-3">
          <div>
            <div className="font-medium">{file.name}</div>
            <div className="text-sm text-gray-500">
              {Math.round(file.size / 1024)} KB
            </div>
          </div>
          <div>
            <button
              onClick={() => setFile(null)}
              className="text-sm text-gray-600 mr-3"
            >
              Remove
            </button>
            <button
              onClick={upload}
              className="px-3 py-1 bg-blue-600 text-white rounded"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      <p className="mt-6 text-sm text-gray-500">
        You can delete the document and re-upload to get verified.
      </p>
    </div>
  );
}
