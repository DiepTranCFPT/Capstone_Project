import React, { useState, useEffect } from "react";
import { Switch, Radio, Select, Input, Card, Collapse, Spin } from "antd";
import {
    ReadOutlined,
    SelectOutlined,
    PlusOutlined,
    PictureOutlined,
    AudioOutlined,
} from "@ant-design/icons";
import type { QuestionContext, CreateQuestionContextRequest } from "~/types/question";
import ContextUploader from "./ContextUploader";
import { useSubjects } from "~/hooks/useSubjects";

const { TextArea } = Input;
const { Panel } = Collapse;

interface QuestionContextSectionProps {
    // Mode selection
    hasContext: boolean;
    onHasContextChange: (value: boolean) => void;

    // For existing context selection
    contextId?: string;
    onContextIdChange?: (id: string | undefined) => void;
    existingContexts?: QuestionContext[];
    loadingContexts?: boolean;

    // For inline context creation
    inlineContext?: CreateQuestionContextRequest;
    onInlineContextChange?: (context: CreateQuestionContextRequest | undefined) => void;

    // Image and Audio URLs for question level
    imageUrl?: string;
    onImageUrlChange?: (url: string | undefined) => void;
    audioUrl?: string;
    onAudioUrlChange?: (url: string | undefined) => void;

    disabled?: boolean;
}

type ContextMode = "existing" | "new";

const QuestionContextSection: React.FC<QuestionContextSectionProps> = ({
    hasContext,
    onHasContextChange,
    contextId,
    onContextIdChange,
    existingContexts = [],
    loadingContexts = false,
    inlineContext,
    onInlineContextChange,
    imageUrl,
    onImageUrlChange,
    audioUrl,
    onAudioUrlChange,
    disabled = false,
}) => {
    const [contextMode, setContextMode] = useState<ContextMode>("new");
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const { subjects, fetchSubjects } = useSubjects();
    const [localInlineContext, setLocalInlineContext] = useState<CreateQuestionContextRequest>({
        title: "",
        content: "",
        imageUrl: undefined,
        audioUrl: undefined,
        subjectId: "",
    });

    useEffect(() => {
        setLoadingSubjects(true);
        fetchSubjects();
        setLoadingSubjects(false);
    }, [fetchSubjects]);

    // Sync with parent
    useEffect(() => {
        if (inlineContext) {
            setLocalInlineContext(inlineContext);
        }
    }, [inlineContext]);

    // Reset when hasContext changes
    useEffect(() => {
        if (!hasContext) {
            setContextMode("new");
            setLocalInlineContext({
                title: "",
                content: "",
                imageUrl: undefined,
                audioUrl: undefined,
                subjectId: "",
            });
            onContextIdChange?.(undefined);
            onInlineContextChange?.(undefined);
        }
    }, [hasContext, onContextIdChange, onInlineContextChange]);

    const handleModeChange = (mode: ContextMode) => {
        setContextMode(mode);
        if (mode === "existing") {
            // Clear inline context when switching to existing
            onInlineContextChange?.(undefined);
        } else {
            // Clear contextId when switching to new
            onContextIdChange?.(undefined);
        }
    };

    const updateInlineContext = <K extends keyof CreateQuestionContextRequest>(
        key: K,
        value: CreateQuestionContextRequest[K]
    ) => {
        const updated = { ...localInlineContext, [key]: value };
        setLocalInlineContext(updated);
        onInlineContextChange?.(updated);
    };

    const selectedContext = existingContexts.find((c) => c.id === contextId);

    return (
        <div className="question-context-section">
            {/* Toggle Has Context */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                    <ReadOutlined className="text-[#3CBCB2] text-lg" />
                    <span className="font-medium">Question Context</span>
                    <span className="text-xs text-gray-500">
                        (Reading passage, image, or audio)
                    </span>
                </div>
                <Switch
                    checked={hasContext}
                    onChange={onHasContextChange}
                    disabled={disabled}
                    checkedChildren="ON"
                    unCheckedChildren="OFF"
                />
            </div>

            {hasContext && (
                <Card
                    className="context-card"
                    style={{
                        border: "1px solid #3CBCB2",
                        borderRadius: "8px",
                        marginBottom: "16px",
                    }}
                    styles={{
                        body: { padding: "16px" },
                    }}
                >
                    {/* Mode Selection */}
                    <Radio.Group
                        value={contextMode}
                        onChange={(e) => handleModeChange(e.target.value)}
                        className="w-full mb-4"
                        disabled={disabled}
                    >
                        <Radio.Button
                            value="existing"
                            className="w-1/2 text-center"
                            style={{ height: "40px", lineHeight: "40px" }}
                        >
                            <SelectOutlined className="mr-2" />
                            Select Existing Context
                        </Radio.Button>
                        <Radio.Button
                            value="new"
                            className="w-1/2 text-center"
                            style={{ height: "40px", lineHeight: "40px" }}
                        >
                            <PlusOutlined className="mr-2" />
                            Create New Context
                        </Radio.Button>
                    </Radio.Group>

                    {contextMode === "existing" ? (
                        // Select Existing Context
                        <div className="existing-context-section">
                            <Select
                                placeholder="Select a context..."
                                value={contextId}
                                onChange={(value) => onContextIdChange?.(value)}
                                loading={loadingContexts}
                                disabled={disabled || loadingContexts}
                                style={{ width: "100%", marginTop: "16px" }}
                                size="large"
                                allowClear
                                showSearch
                                optionFilterProp="children"
                                notFoundContent={
                                    loadingContexts ? (
                                        <Spin size="small" />
                                    ) : (
                                        <span className="text-gray-500">No contexts available</span>
                                    )
                                }
                            >
                                {existingContexts.map((ctx) => (
                                    <Select.Option key={ctx.id} value={ctx.id}>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">{ctx.title}</span>
                                            {ctx.imageUrl && <PictureOutlined className="text-blue-500" />}
                                            {ctx.audioUrl && <AudioOutlined className="text-green-500" />}
                                        </div>
                                    </Select.Option>
                                ))}
                            </Select>

                            {/* Preview selected context */}
                            {selectedContext && (
                                <Collapse
                                    className="mt-3"
                                    defaultActiveKey={["preview"]}
                                    style={{ background: "#f5f5f5", marginTop: "16px" }}
                                >
                                    <Panel header="Context Preview" key="preview">
                                        <div className="space-y-2">
                                            <h4 className="font-semibold text-lg">{selectedContext.title}</h4>
                                            <p className="text-gray-700 whitespace-pre-wrap">
                                                {selectedContext.content}
                                            </p>
                                            {selectedContext.imageUrl && (
                                                <img
                                                    src={selectedContext.imageUrl}
                                                    alt="Context"
                                                    className="max-w-full max-h-48 rounded"
                                                />
                                            )}
                                            {selectedContext.audioUrl && (
                                                <audio
                                                    controls
                                                    src={selectedContext.audioUrl}
                                                    className="w-full"
                                                />
                                            )}
                                        </div>
                                    </Panel>
                                </Collapse>
                            )}
                        </div>
                    ) : (
                        // Create New Context
                        <div className="new-context-section space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Context Title <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    placeholder="e.g., Reading Passage 1, Graph Analysis, Listening Exercise..."
                                    value={localInlineContext.title}
                                    onChange={(e) => updateInlineContext("title", e.target.value)}
                                    disabled={disabled}
                                    size="large"
                                />
                            </div>

                            {/* Content */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Context Content <span className="text-red-500">*</span>
                                </label>
                                <TextArea
                                    placeholder="Enter the reading passage, description, or instructions..."
                                    value={localInlineContext.content}
                                    onChange={(e) => updateInlineContext("content", e.target.value)}
                                    disabled={disabled}
                                    rows={6}
                                    showCount
                                    maxLength={5000}
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label className="block text-sm font-medium mb-1">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    placeholder="Select a subject..."
                                    value={localInlineContext.subjectId}
                                    onChange={(value) => updateInlineContext("subjectId", value)}
                                    disabled={disabled}
                                    size="large"
                                    showSearch
                                    optionFilterProp="children"
                                    style={{ width: "100%" }}
                                    notFoundContent={
                                        loadingSubjects ? (
                                            <Spin size="small" />
                                        ) : (
                                            <span className="text-gray-500">No subjects available</span>
                                        )
                                    }
                                >
                                    {subjects.map((subject) => (
                                        <Select.Option key={subject.id} value={subject.id}>
                                            {subject.name}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </div>

                            {/* Image and Audio Upload */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <PictureOutlined className="mr-1" />
                                        Context Image
                                    </label>
                                    <ContextUploader
                                        type="image"
                                        value={localInlineContext.imageUrl}
                                        onChange={(url) => updateInlineContext("imageUrl", url)}
                                        disabled={disabled}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        <AudioOutlined className="mr-1" />
                                        Context Audio
                                    </label>
                                    <ContextUploader
                                        type="audio"
                                        value={localInlineContext.audioUrl}
                                        onChange={(url) => updateInlineContext("audioUrl", url)}
                                        disabled={disabled}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </Card>
            )}

            {/* Question-level Image/Audio (always available) */}
            <Collapse
                className="mt-4"
                style={{ background: "#fafafa" }}
            >
                <Panel
                    header={
                        <div className="flex items-center gap-2">
                            <span>Question Attachments</span>
                            <span className="text-xs text-gray-500">(Image/Audio for this question only)</span>
                        </div>
                    }
                    key="attachments"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <PictureOutlined className="mr-1" />
                                Question Image
                            </label>
                            <ContextUploader
                                type="image"
                                value={imageUrl}
                                onChange={onImageUrlChange}
                                disabled={disabled}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                <AudioOutlined className="mr-1" />
                                Question Audio
                            </label>
                            <ContextUploader
                                type="audio"
                                value={audioUrl}
                                onChange={onAudioUrlChange}
                                disabled={disabled}
                            />
                        </div>
                    </div>
                </Panel>
            </Collapse>
        </div>
    );
};

export default QuestionContextSection;
