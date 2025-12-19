import React, { useState, useRef } from "react";
import { Collapse, Image } from "antd";
import {
    ReadOutlined,
    PictureOutlined,
    AudioOutlined,
    PlayCircleOutlined,
    PauseCircleOutlined,
    ExpandOutlined,
    CompressOutlined,
} from "@ant-design/icons";
import type { QuestionContext } from "~/types/question";
import LatexRenderer from "~/components/common/LatexRenderer";

interface ContextDisplayProps {
    context: QuestionContext;
    defaultExpanded?: boolean;
    compact?: boolean;
}

const ContextDisplay: React.FC<ContextDisplayProps> = ({
    context,
    defaultExpanded = true,
    compact = false,
}) => {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement>(null);

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    if (compact) {
        // Compact mode - just show title and expandable content
        return (
            <div className="context-display-compact mb-4">
                <Collapse
                    defaultActiveKey={defaultExpanded ? ["context"] : []}
                    onChange={(keys) => setIsExpanded(keys.includes("context"))}
                    className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                >
                    <Collapse.Panel
                        key="context"
                        header={
                            <div className="flex items-center gap-2">
                                <ReadOutlined className="text-blue-600" />
                                <span className="font-semibold text-blue-800">{context.title}</span>
                                {context.imageUrl && <PictureOutlined className="text-blue-500" />}
                                {context.audioUrl && <AudioOutlined className="text-green-500" />}
                            </div>
                        }
                    >
                        <div className="space-y-3">
                            {/* Content */}
                            <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                <LatexRenderer content={context.content} />
                            </div>

                            {/* Image */}
                            {context.imageUrl && (
                                <div className="mt-3">
                                    <Image
                                        src={context.imageUrl}
                                        alt={context.title}
                                        className="rounded-lg max-h-64 object-contain"
                                        style={{ maxWidth: "100%" }}
                                    />
                                </div>
                            )}

                            {/* Audio */}
                            {context.audioUrl && (
                                <div className="mt-3">
                                    <audio
                                        ref={audioRef}
                                        src={context.audioUrl}
                                        onEnded={() => setIsPlaying(false)}
                                        className="w-full"
                                        controls
                                    />
                                </div>
                            )}
                        </div>
                    </Collapse.Panel>
                </Collapse>
            </div>
        );
    }

    // Full mode - show everything with beautiful styling
    return (
        <div className="context-display mb-6 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-100 to-indigo-100 border-b border-blue-200">
                <div className="flex items-center gap-2">
                    <ReadOutlined className="text-blue-600 text-lg" />
                    <span className="font-bold text-blue-800 text-lg">{context.title}</span>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                >
                    {isExpanded ? (
                        <>
                            <CompressOutlined />
                            <span className="text-sm">Collapse</span>
                        </>
                    ) : (
                        <>
                            <ExpandOutlined />
                            <span className="text-sm">Expand</span>
                        </>
                    )}
                </button>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-4 space-y-4">
                    {/* Text Content */}
                    <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                        <LatexRenderer content={context.content} />
                    </div>

                    {/* Media Section */}
                    {(context.imageUrl || context.audioUrl) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Image */}
                            {context.imageUrl && (
                                <div className="image-container">
                                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                        <PictureOutlined />
                                        <span>Image</span>
                                    </div>
                                    <Image
                                        src={context.imageUrl}
                                        alt={context.title}
                                        className="rounded-lg shadow-md"
                                        style={{ maxWidth: "100%", maxHeight: "300px", objectFit: "contain" }}
                                    />
                                </div>
                            )}

                            {/* Audio */}
                            {context.audioUrl && (
                                <div className="audio-container">
                                    <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
                                        <AudioOutlined />
                                        <span>Audio</span>
                                    </div>
                                    <div className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                                        <div className="flex items-center gap-3 mb-2">
                                            <button
                                                onClick={toggleAudio}
                                                className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-500 to-blue-500 text-white flex items-center justify-center hover:opacity-90 transition-opacity"
                                            >
                                                {isPlaying ? (
                                                    <PauseCircleOutlined className="text-xl" />
                                                ) : (
                                                    <PlayCircleOutlined className="text-xl" />
                                                )}
                                            </button>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-700">Listen to Audio</div>
                                                <div className="text-xs text-gray-500">Click to play/pause</div>
                                            </div>
                                        </div>
                                        <audio
                                            ref={audioRef}
                                            src={context.audioUrl}
                                            onEnded={() => setIsPlaying(false)}
                                            onPlay={() => setIsPlaying(true)}
                                            onPause={() => setIsPlaying(false)}
                                            className="w-full"
                                            controls
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ContextDisplay;
