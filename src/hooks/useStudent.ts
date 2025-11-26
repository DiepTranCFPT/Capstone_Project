import { useState } from "react";
import StudentService from "~/services/studentService";
import type { UpdateStudentProfileRequest } from "~/types/user";
import { toast } from "~/components/common/Toast";

export const useStudent = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateStudentProfile = async (data: UpdateStudentProfileRequest) => {
        setLoading(true);
        setError(null);
        try {
            const response = await StudentService.updateStudentProfile(data);
            toast.success("Cập nhật thông tin thành công!");
            return response.data;
        } catch (err) {
            setError("Cập nhật thông tin thất bại");
            toast.error("Cập nhật thông tin thất bại");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        updateStudentProfile,
    };
};
