import { ChevronLeft, Folder } from "lucide-react";
import React, { useRef, useState } from "react";

interface VerificationUploadProps {
  onBack?: () => void;
}

export default function VerificationUpload({
  onBack,
}: VerificationUploadProps) {
  // FIX 1: Initialize with null and add Type
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const f = files[0];
    if (f.size > 10 * 1024 * 1024) {
      alert("Max 10MB allowed");
      return;
    }
    setFile(f);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  };

  const upload = async () => {
    if (!file) return alert("Select a file");
    setUploading(true);
    await new Promise((r) => setTimeout(r, 800));
    setUploading(false);
    alert("Uploaded (mock)");
    if (onBack) onBack();
  };

  const handleBrowseClick = () => {
    // FIX 2: Use optional chaining
    fileRef.current?.click();
  };

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-base text-gray-600 font-medium flex items-center gap-1  hover:text-gray-900 mb-6"
      >
        <ChevronLeft /> Back
      </button>
      <div className="mb-8">
        <h2 className="text-2xl font-medium text-gray-800 mb-2">
          Verifications
        </h2>
        <p className="text-gray-500 text-base leading-relaxed">
          Please upload any government ID to verify your age and identity.{" "}
          <a href="#" className="text-blue-600 font-medium hover:underline">
            Learn more
          </a>
        </p>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={handleBrowseClick}
        className="group relative border-2 border-dashed border-blue-400 bg-blue-50/50 hover:bg-blue-50 rounded-xl h-64 flex flex-col items-center justify-center cursor-pointer transition-all"
      >
        <div className="mb-4 p-3 bg-blue-100 rounded-full transition-transform">
          <Folder className="w-8 h-8 text-blue-600" />
        </div>

        <div className="text-lg font-medium text-gray-900 mb-2">
          Drag your file(s) or{" "}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleBrowseClick();
            }}
            className="text-blue-600 font-bold hover:underline"
          >
            browse
          </button>
        </div>

        <div className="text-sm text-gray-400">Max 10 MB files are allowed</div>

        <input
          ref={fileRef}
          type="file"
          className="hidden"
          accept="image/*,.pdf"
          onChange={(e) => handleFiles(e.target.files)}
          aria-label="upload verification"
        />
      </div>

      {file && (
        <div className="mt-6 flex items-center justify-between border border-gray-200 rounded-lg p-4 bg-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-gray-100 p-2 rounded">
              <Folder className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <div className="font-medium text-gray-900">{file.name}</div>
              <div className="text-sm text-gray-500">
                {Math.round(file.size / 1024)} KB
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 transition-colors"
            >
              Remove
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                upload();
              }}
              disabled={uploading}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </div>
      )}

      <p className="mt-8 text-center text-sm text-gray-500">
        You can delete the document and re-upload to get verified.
      </p>
    </div>
  );
}
