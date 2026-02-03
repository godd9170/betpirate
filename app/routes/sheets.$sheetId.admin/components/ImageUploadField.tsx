import { useEffect, useRef, useState, type ChangeEvent } from "react";
import imageCompression from "browser-image-compression";

const MAX_IMAGE_SIZE_MB = 1;
const MAX_IMAGE_DIMENSION = 1600;

type Variant = "wide" | "square";

type Props = {
  sheetId: string;
  name: string;
  label: string;
  value?: string | null;
  helpText?: string;
  variant?: Variant;
};

export default function ImageUploadField({
  sheetId,
  name,
  label,
  value,
  helpText,
  variant = "wide",
}: Props) {
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewSizeClasses =
    variant === "wide" ? "h-20 w-36" : "h-16 w-16";

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  const handleRemove = () => {
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      setError(null);

      const compressedFile = await imageCompression(file, {
        maxSizeMB: MAX_IMAGE_SIZE_MB,
        maxWidthOrHeight: MAX_IMAGE_DIMENSION,
        fileType: "image/webp",
        useWebWorker: true,
      });

      const contentType =
        compressedFile.type || file.type || "image/webp";

      const formData = new FormData();
      formData.append("contentType", contentType);
      formData.append("fileName", file.name || "upload");

      const response = await fetch(`/sheets/${sheetId}/images`, {
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
    } catch (uploadError) {
      console.error("Image upload error:", uploadError);
      setError("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input type="hidden" name={name} value={preview ?? ""} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">{label}</p>
          {helpText && (
            <p className="text-xs text-base-content/60">{helpText}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div
          className={`rounded-lg border border-base-300 bg-base-200/60 ${previewSizeClasses} flex items-center justify-center overflow-hidden`}
        >
          {preview ? (
            <img
              src={preview}
              alt="Preview"
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="text-[10px] uppercase tracking-wide text-base-content/50">
              No image
            </span>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="btn btn-sm btn-outline">
            {isUploading ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              "Upload"
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={isUploading}
            />
          </label>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            onClick={handleRemove}
            disabled={!preview || isUploading}
          >
            Remove
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
