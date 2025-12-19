import { useRef, useState } from "react";
import { message } from "antd";

import LessonService from "~/services/LessonService";
import type { Lesson, LessonVideoAsset } from "~/types/lesson";

export default function useLessonPreview() {
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [loadingPreviewDetail, setLoadingPreviewDetail] = useState(false);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [previewVideoLoading, setPreviewVideoLoading] = useState(false);
  const previewVideoCache = useRef<Record<string, string>>({});

  const resolveVideoReference = (lesson: Lesson | null): string | null => {
    if (!lesson) return null;
    return lesson.video ?? lesson.url ?? lesson.file ?? null;
  };

  const loadPreviewVideo = async (lesson: Lesson | null) => {
    const reference = resolveVideoReference(lesson);
    if (!reference) {
      setPreviewVideoUrl(null);
      return;
    }

    if (/^https?:\/\//i.test(reference) || !/^VIDEO_/i.test(reference)) {
      setPreviewVideoUrl(reference);
      return;
    }

    const cached = previewVideoCache.current[reference];
    if (cached) {
      setPreviewVideoUrl(cached);
      return;
    }

    try {
      setPreviewVideoLoading(true);
      const res = await LessonService.getVideos(reference);
      const payload =
        res.data && typeof res.data === "object" && "data" in res.data
          ? (res.data as { data: unknown }).data
          : res.data;
      const matched = Array.isArray(payload)
        ? payload.find(
            (video) =>
              video.id === reference ||
              video.name === reference ||
              (video as LessonVideoAsset).nameFile === reference
          )
        : payload;

      if (typeof matched === "string") {
        previewVideoCache.current[reference] = matched;
        setPreviewVideoUrl(matched);
        return;
      }

      const matchedAsset = matched as LessonVideoAsset | undefined;
      const assetUrl =
        matchedAsset?.url ||
        matchedAsset?.videoUrl ||
        matchedAsset?.streamUrl ||
        matchedAsset?.downloadUrl;

      if (assetUrl) {
        previewVideoCache.current[reference] = assetUrl;
        setPreviewVideoUrl(assetUrl);
      } else {
        setPreviewVideoUrl(null);
        message.error("Lesson video not found.");
      }
    } catch (error) {
      console.error("Load video asset error:", error);
      message.error("Unable to load lesson video.");
      setPreviewVideoUrl(null);
    } finally {
      setPreviewVideoLoading(false);
    }
  };

  const openPreview = async (lesson: Lesson) => {
    setPreviewLesson(lesson);
    setIsPreviewOpen(true);
    try {
      setLoadingPreviewDetail(true);
      const response = await LessonService.getById(lesson.id);
      const detail = response.data.data ?? lesson;
      setPreviewLesson(detail);
      await loadPreviewVideo(detail);
    } catch (error) {
      console.error("Fetch preview detail error:", error);
      message.error("Unable to load lesson details.");
      await loadPreviewVideo(lesson);
    } finally {
      setLoadingPreviewDetail(false);
    }
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewLesson(null);
    setPreviewVideoUrl(null);
  };

  return {
    previewLesson,
    isPreviewOpen,
    loadingPreviewDetail,
    previewVideoUrl,
    previewVideoLoading,
    openPreview,
    closePreview,
  };
}

