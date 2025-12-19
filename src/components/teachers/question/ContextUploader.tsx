import React, { useState, useRef } from "react";
import { Upload, Button, message, Spin, Image } from "antd";
import {
    UploadOutlined,
    PictureOutlined,
    AudioOutlined,
    DeleteOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
} from "@ant-design/icons";
import type { UploadProps } from "antd";
import { useQuestionBank } from "~/hooks/useQuestionBank";

interface ContextUploaderProps {
    type: "image" | "audio";
    value?: string;
    onChange?: (url: string | undefined) => void;
    disabled?: boolean;
}

const ContextUploader: React.FC<ContextUploaderProps> = ({
    type,
    value,
    onChange,
    disabled = false,
}) => {
    const { uploadQuestionFile, loading } = useQuestionBank();
    const [uploading, setUploading] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const acceptTypes = type === "image"
        ? ".jpg,.jpeg,.png,.gif,.webp"
        : ".mp3,.wav,.ogg,.m4a";

    const maxSize = type === "image" ? 5 : 10; // MB

    const handleUpload = async (file: File) => {
        // Validate file size
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
            message.error(`File size must be less than ${maxSize}MB`);
            return false;
        }

        // Validate file type
        const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        const validAudioTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4", "audio/x-m4a"];
        const validTypes = type === "image" ? validImageTypes : validAudioTypes;

        if (!validTypes.includes(file.type)) {
            message.error(`Invalid file type. Please upload ${type === "image" ? "an image" : "an audio"} file.`);
            return false;
        }

        setUploading(true);
        try {
            const url = await uploadQuestionFile(file);
            if (url) {
                onChange?.(url);
                message.success(`${type === "image" ? "Image" : "Audio"} uploaded successfully!`);
            }
        } catch (error) {
            console.error("Upload failed:", error);
            message.error("Upload failed. Please try again.");
        } finally {
            setUploading(false);
        }
        return false; // Prevent default upload behavior
    };

    const handleRemove = () => {
        onChange?.(undefined);
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
    };

    const toggleAudioPlay = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const uploadProps: UploadProps = {
        beforeUpload: handleUpload,
        showUploadList: false,
        accept: acceptTypes,
        disabled: disabled || uploading || loading,
    };

    return (
        <div className="context-uploader">
            {!value ? (
                // Upload button when no file uploaded
                <Upload {...uploadProps}>
                    <Button
                        icon={type === "image" ? <PictureOutlined /> : <AudioOutlined />}
                        loading={uploading || loading}
                        disabled={disabled}
                        className="w-full"
                        style={{
                            height: "80px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            border: "2px dashed #d9d9d9",
                            borderRadius: "8px",
                            background: "#fafafa",
                        }}
                    >
                        {uploading || loading ? (
                            <Spin size="small" />
                        ) : (
                            <>
                                <UploadOutlined style={{ fontSize: "24px", marginBottom: "4px" }} />
                                <span style={{ fontSize: "12px" }}>
                                    Upload {type === "image" ? "Image" : "Audio"}
                                </span>
                                <span style={{ fontSize: "10px", color: "#999" }}>
                                    Max {maxSize}MB
                                </span>
                            </>
                        )}
                    </Button>
                </Upload>
            ) : (
                // Preview when file uploaded
                <div
                    className="uploaded-preview"
                    style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: "8px",
                        padding: "12px",
                        background: "#fafafa",
                    }}
                >
                    {type === "image" ? (
                        // Image preview
                        <div className="image-preview">
                            <Image
                                src={value}
                                alt="Context image"
                                style={{
                                    maxWidth: "100%",
                                    maxHeight: "200px",
                                    objectFit: "contain",
                                    borderRadius: "4px",
                                }}
                                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgesAfY/ijgAAAAJcEhZcwAACxMAAAsTAQCanBgAAAHeaVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA1LjQuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjE5NDwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOlBpeGVsWURpbWVuc2lvbj4xOTU8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KN4CMHAAAABtJREFUeJztwQENAAAAwqD3T20PBxQAAAAAgNgJsAAB2hCLnwAAAABJRU5ErkJggg=="
                            />
                            <div className="flex justify-end mt-2">
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={handleRemove}
                                    disabled={disabled}
                                >
                                    Remove
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Audio preview
                        <div className="audio-preview">
                            <audio
                                ref={audioRef}
                                src={value}
                                onEnded={() => setIsPlaying(false)}
                                style={{ display: "none" }}
                            />
                            <div className="flex items-center gap-3">
                                <Button
                                    type="primary"
                                    shape="circle"
                                    size="large"
                                    icon={isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                                    onClick={toggleAudioPlay}
                                    style={{
                                        backgroundColor: "#3CBCB2",
                                        border: "none",
                                    }}
                                />
                                <div className="flex-1">
                                    <div className="text-sm font-medium text-gray-700">
                                        Audio File
                                    </div>
                                    <div className="text-xs text-gray-500 truncate" style={{ maxWidth: "200px" }}>
                                        {value.split("/").pop()}
                                    </div>
                                </div>
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={handleRemove}
                                    disabled={disabled}
                                >
                                    Remove
                                </Button>
                            </div>
                            {/* Audio waveform visualization (simple) */}
                            <div
                                className="mt-3"
                                style={{
                                    height: "40px",
                                    background: "linear-gradient(90deg, #3CBCB2 0%, #35a89a 100%)",
                                    borderRadius: "4px",
                                    opacity: isPlaying ? 1 : 0.6,
                                    transition: "opacity 0.3s",
                                }}
                            >
                                <audio
                                    controls
                                    src={value}
                                    style={{
                                        width: "100%",
                                        height: "40px",
                                    }}
                                    onPlay={() => setIsPlaying(true)}
                                    onPause={() => setIsPlaying(false)}
                                    onEnded={() => setIsPlaying(false)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContextUploader;
