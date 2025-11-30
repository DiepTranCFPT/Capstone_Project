import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import FileContentService from "~/services/fileContentService";

interface MaterialThumbnailProps {
  source?: string;
  width?: number | string;
  height?: number | string;
  roundedClass?: string;
  className?: string;
  fit?: "cover" | "contain";
}

const normalizeSize = (value?: number | string): string | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === "number") {
    return `${value}px`;
  }
  return value;
};

const MaterialThumbnail: React.FC<MaterialThumbnailProps> = ({
  source,
  width = 48,
  height = 48,
  roundedClass = "rounded-md",
  className = "",
  fit = "cover",
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let objectUrl: string | null = null;
    let active = true;

    if (!source) {
      setPreviewUrl(null);
      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }

    const isAbsolute = source.startsWith("http://") || source.startsWith("https://");
    if (isAbsolute) {
      setPreviewUrl(source);
      return () => {
        if (objectUrl) URL.revokeObjectURL(objectUrl);
      };
    }

    setLoading(true);
    FileContentService.viewMaterialFile(source)
      .then((response) => {
        if (!active) return;
        if (response.data instanceof Blob) {
          objectUrl = URL.createObjectURL(response.data);
          setPreviewUrl(objectUrl);
        } else {
          console.warn("MaterialThumbnail: Response is not a Blob", response);
          setPreviewUrl(null);
        }
      })
      .catch((error) => {
        if (!active) return;
        console.error("MaterialThumbnail: Error loading file", source, error);
        setPreviewUrl(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [source]);

  const sizeStyle: React.CSSProperties = {
    width: normalizeSize(width),
    height: normalizeSize(height),
  };

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 ${roundedClass} ${className}`}
        style={sizeStyle}
      >
        <div className="text-center">
          <Spin size="small" />
          <p className="text-xs text-gray-400 mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 ${roundedClass} ${className}`}
        style={sizeStyle}
      >
        <svg
          className="w-12 h-12 text-gray-400 mb-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="text-xs text-gray-500 font-medium">No Image</p>
      </div>
    );
  }

  return (
    <img
      src={previewUrl}
      alt="material thumbnail"
      className={`border-0 ${roundedClass} ${className}`}
      style={{ ...sizeStyle, objectFit: fit }}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        // Fallback sẽ được xử lý bởi parent component
      }}
    />
  );
};

export default MaterialThumbnail;

