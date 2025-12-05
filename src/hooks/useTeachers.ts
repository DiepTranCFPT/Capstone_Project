import { useEffect, useState } from "react";
import UserService from "~/services/userService";
import type { User } from "~/types/user";

export interface Teacher {
    id: string;
    name: string;
    email: string;
    imgUrl?: string;
}

export const useTeachers = () => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTeachers = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await UserService.getUsers({
                role: "TEACHER",
                pageSize: 100 // Get all teachers for dropdown
            });

            if (res.code === 1000 || res.code === 0) {
                const teacherList: Teacher[] = res.data.items
                    .filter((user: User) => user.roles.includes("TEACHER"))
                    .map((user: User) => ({
                        id: user.id,
                        name: `${user.firstName} ${user.lastName}`.trim() || user.email,
                        email: user.email,
                        imgUrl: user.imgUrl
                    }));
                setTeachers(teacherList);
            } else {
                throw new Error(res.message || "Failed to fetch teachers");
            }
        } catch (err) {
            const e = err as Error;
            setError(e.message || "Failed to fetch teachers");
            console.error("Failed to fetch teachers:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTeachers();
    }, []);

    return {
        teachers,
        loading,
        error,
        fetchTeachers
    };
};
