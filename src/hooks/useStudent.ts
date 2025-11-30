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
            toast.success("Update profile successfully!");
            return response.data;
        } catch (err) {
            setError("Update profile failed");
            toast.error("Update profile failed");
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
