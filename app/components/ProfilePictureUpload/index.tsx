import { useState, useRef } from "react";
import imageCompression from "browser-image-compression";

interface ProfilePictureUploadProps {
  onImageChange: (dataUrl: string | null) => void;
  currentImage?: string | null;
}

export default function ProfilePictureUpload({
  onImageChange,
  currentImage,
}: ProfilePictureUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    try {
      setIsProcessing(true);

      // Compress image on client-side before sending to server
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 500,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);

      // Convert to base64 data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setPreview(dataUrl);
        onImageChange(dataUrl);
        setIsProcessing(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error processing image:", error);
      setIsProcessing(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="Profile preview"
              className="h-32 w-32 rounded-full object-cover border-4 border-primary"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute -top-2 -right-2 btn btn-circle btn-sm btn-error"
              disabled={isProcessing}
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="h-32 w-32 rounded-full bg-base-200 flex items-center justify-center border-4 border-dashed border-base-300">
            <span className="text-4xl">👤</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <label className="btn btn-primary btn-sm">
          {isProcessing ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <>📷 {preview ? "Change" : "Add"} Photo</>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
            disabled={isProcessing}
          />
        </label>

        <label className="btn btn-outline btn-sm">
          {isProcessing ? (
            <span className="loading loading-spinner loading-sm"></span>
          ) : (
            <>🖼️ Gallery</>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isProcessing}
          />
        </label>
      </div>

      <p className="text-xs text-base-content/60 text-center">
        Upload a profile picture or take a selfie
      </p>
    </div>
  );
}
