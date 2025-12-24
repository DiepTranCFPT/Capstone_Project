import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";

const FileUploadService = {
    /**
     * Upload image for flashcard
     * POST /files/upload/flashcard
     * @param file - The image file to upload
     * @returns The uploaded image URL
     */
    uploadFlashcardImage(file: File): Promise<AxiosResponse<ApiResponse<string>>> {
        const formData = new FormData();
        formData.append("file", file);

        return axiosInstance.post("/files/upload/flashcard", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
    },
};

export default FileUploadService;
