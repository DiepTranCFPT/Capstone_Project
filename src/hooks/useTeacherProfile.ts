import { useState, useCallback } from "react";
import TeacherProfileService from "~/services/teacherProfileService";
import type {
    TeacherProfileData,
    TeacherProfilePayload,
    UnverifiedTeacherProfile,
} from "~/types/teacherProfile";
import { toast } from "~/components/common/Toast";
import type { ApiResponse } from "~/types/api";

export const useTeacherProfile = () => {
    const [profile, setProfile] = useState<TeacherProfileData | null>(null);
    const [unverifiedProfiles, setUnverifiedProfiles] = useState<UnverifiedTeacherProfile[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Helper xử lý lỗi
    const handleError = (err: unknown, defaultMessage: string) => {
        setLoading(false);
        const e = err as { response?: { data?: ApiResponse<unknown> } } & Error;
        const apiMessage = e.response?.data?.message;
        const msg = apiMessage || e.message || defaultMessage;
        setError(msg);
        toast.error(msg);
    };

    /**
     * Tạo hồ sơ giáo viên
     */
    const createProfile = useCallback(async (data: TeacherProfilePayload) => {
        setLoading(true);
        setError(null);
        try {
            const res = await TeacherProfileService.createProfile(data);
            if (res.data.code === 0 || res.data.code === 1000) {
                setProfile(res.data.data);
                toast.success("Create teacher profile successfully!");
                return res.data.data;
            } else {
                throw new Error(res.data.message || "Failed to create profile");
            }
        } catch (err) {
            handleError(err, "Failed to create profile");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Cập nhật hồ sơ giáo viên
     */
    const updateProfile = useCallback(async (id: string, data: TeacherProfilePayload) => {
        setLoading(true);
        setError(null);
        try {
            const res = await TeacherProfileService.updateMyProfile(id, data);
            if (res.data.code === 0 || res.data.code === 1000) {
                setProfile(res.data.data);
                toast.success("Update profile successfully!");
                return res.data.data;
            } else {
                throw new Error(res.data.message || "Failed to update profile");
            }
        } catch (err) {
            handleError(err, "Failed to update profile");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Xác thực hồ sơ (Dành cho Admin)
     */
    const verifyProfile = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await TeacherProfileService.verifyProfile(id);
            if (res.data.code === 0 || res.data.code === 1000) {
                toast.success("Verify teacher profile successfully!");
                // Cập nhật lại danh sách unverified sau khi verify thành công
                setUnverifiedProfiles(prev => prev.filter(p => (p.teacherProfile?.id || p.id || p.user?.id) !== id));
                return res.data.data;
            } else {
                throw new Error(res.data.message || "Failed to verify profile");
            }
        } catch (err) {
            handleError(err, "Verify teacher profile failed");
            return null;
        } finally {
            setLoading(false);
        }
    }, []);


    /**
     * Lấy danh sách hồ sơ chưa xác thực (Dành cho Admin)
     * Sử dụng API GET /api/teacher-profile/teacher/unverify
     */
    const fetchUnverifiedProfiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await TeacherProfileService.getUnverifiedProfiles();
            if (res.data.code === 0 || res.data.code === 1000) {
                // Xử lý trường hợp API trả về object đơn lẻ hoặc mảng
                const data = res.data.data;
                if (Array.isArray(data)) {
                    setUnverifiedProfiles(data);
                } else if (data) {
                    setUnverifiedProfiles([data as unknown as UnverifiedTeacherProfile]);
                } else {
                    setUnverifiedProfiles([]);
                }
            } else {
                setUnverifiedProfiles([]);
            }
        } catch {
            setUnverifiedProfiles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Lấy danh sách yêu cầu xác thực hiện tại (Dành cho Admin)
     * Sử dụng API GET /api/teacher-profile/request/current
     */
    const fetchCurrentRequests = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await TeacherProfileService.getCurrentVerificationRequest();
            if (res.data.code === 0 || res.data.code === 1000) {
                const data = res.data.data;
                if (Array.isArray(data)) {
                    setUnverifiedProfiles(data as unknown as UnverifiedTeacherProfile[]);
                } else if (data) {
                    setUnverifiedProfiles([data as unknown as UnverifiedTeacherProfile]);
                } else {
                    setUnverifiedProfiles([]);
                }
            } else {
                setUnverifiedProfiles([]);
            }
        } catch {
            setUnverifiedProfiles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        profile,
        unverifiedProfiles,
        loading,
        error,
        createProfile,
        updateProfile,
        verifyProfile,
        fetchUnverifiedProfiles,
        fetchCurrentRequests
    };
};

export default useTeacherProfile;
