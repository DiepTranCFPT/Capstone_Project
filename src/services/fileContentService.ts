import axiosInstance from "~/configs/axios";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "~/types/api";
import type { FileMaterial, FileLesson } from "~/types/fileContent";

const FileContentService = {
  // GET /{fileName}/materials
  getMaterials(fileName: string): Promise<AxiosResponse<ApiResponse<FileMaterial[]>>> {
    return axiosInstance.get(`/${fileName}/materials`);
  },

  // GET /{fileName}/lesson
  getLesson(fileName: string): Promise<AxiosResponse<ApiResponse<FileLesson>>> {
    return axiosInstance.get(`/${fileName}/lesson`);
  },
};

export default FileContentService;