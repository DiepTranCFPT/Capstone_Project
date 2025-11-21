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
        objectUrl = URL.createObjectURL(response.data);
        setPreviewUrl(objectUrl);
      })
      .catch(() => {
        if (!active) return;
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
        className={`flex items-center justify-center bg-gray-50 border ${roundedClass} ${className}`}
        style={sizeStyle}
      >
        <Spin size="small" />
      </div>
    );
  }

  if (!previewUrl) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 text-gray-500 text-xs border ${roundedClass} ${className}`}
        style={sizeStyle}
      >
        N/A
      </div>
    );
  }

  return (
    <img
      src={previewUrl}
      alt="material thumbnail"
      className={`border ${roundedClass} ${className}`}
      style={{ ...sizeStyle, objectFit: fit }}
    />
  );
};

export default MaterialThumbnail;

