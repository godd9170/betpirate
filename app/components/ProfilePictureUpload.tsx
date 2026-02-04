import { useEffect, useRef, useState } from "react";
import imageCompression from "browser-image-compression";

interface ProfilePictureUploadProps {
  onImageChange: (imageUrl: string | null) => void;
  currentImage?: string | null;
}

export default function ProfilePictureUpload({
  onImageChange,
  currentImage,
}: ProfilePictureUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPreview(currentImage || null);
  }, [currentImage]);

  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        fileType: "image/webp",
        useWebWorker: true,
      });

      const contentType =
        compressedFile.type || file.type || "image/webp";

      const formData = new FormData();
      formData.append("contentType", contentType);
      formData.append("fileName", file.name || "profile-picture");

      const response = await fetch("/sailors/profile-picture", {
        method: "post",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to prepare upload");
      }

      const { uploadUrl, publicUrl } = await response.json();

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=31536000, immutable",
        },
        body: compressedFile,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      setPreview(publicUrl);
      onImageChange(publicUrl);
    } catch (uploadError) {
      console.error("Profile picture upload error:", uploadError);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <button
        type="button"
        onClick={handleAvatarClick}
        className="cursor-pointer transition-opacity hover:opacity-80"
        aria-label="Upload profile picture"
        disabled={isUploading}
      >
        <div className="relative">
          <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2 flex items-center justify-center bg-base-200 overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 text-base-content/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </div>
          {isUploading && (
            <div className="absolute inset-0 rounded-full bg-base-200/70 flex items-center justify-center">
              <span className="loading loading-spinner loading-sm"></span>
            </div>
          )}
        </div>
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      <div className="flex flex-col items-center gap-2">
        <p className="text-sm text-base-content/70 text-center">
          Tap to add a photo
        </p>
        <button
          type="button"
          className="btn btn-xs btn-ghost"
          onClick={handleRemove}
          disabled={!preview || isUploading}
        >
          Remove
        </button>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
