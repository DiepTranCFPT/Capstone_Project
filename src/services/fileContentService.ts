import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { FileMaterial, FileLesson } from "~/types/fileContent";

const FileContentService = {
  // GET /{fileName}/materials - metadata
  getMaterials(fileName: string): Promise<AxiosResponse<ApiResponse<FileMaterial[]>>> {
    return axiosInstance.get(`/${fileName}/materials`);
  },

  // GET /{fileName}/lesson - metadata
  getLesson(fileName: string): Promise<AxiosResponse<ApiResponse<FileLesson>>> {
    return axiosInstance.get(`/${fileName}/lesson`);
  },

  // View/download actual material file
  viewMaterialFile(fileName: string): Promise<AxiosResponse<Blob>> {
    return axiosInstance.get(`/${fileName}/materials`, { responseType: "blob" });
  },

  // View/download lesson file
  viewLessonFile(fileName: string): Promise<AxiosResponse<Blob>> {
    return axiosInstance.get(`/${fileName}/lesson`, { responseType: "blob" });
  },
};

export default FileContentService;