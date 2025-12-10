import { useState, useCallback } from "react";
import type { MaterialWithStudents } from "~/types/learningMaterial";
import LearningMaterialService from "~/services/learningMaterialService";

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message) {
        return error.message;
    }
    if (typeof error === "string" && error.trim() !== "") {
        return error;
    }
    if (
        typeof error === "object" &&
        error !== null &&
        "message" in error &&
        typeof (error as { message?: unknown }).message === "string"
    ) {
        return (error as { message: string }).message;
    }
    return fallback;
};

export interface UseMaterialsWithStudentsReturn {
    materialsWithStudents: MaterialWithStudents[];
    loading: boolean;
    error: string | null;
    fetchMaterialsWithStudents: () => Promise<void>;
    getMaterialById: (materialId: string) => MaterialWithStudents | undefined;
    getTotalStudentsCount: () => number;
}

export function useMaterialsWithStudents(): UseMaterialsWithStudentsReturn {
    const [materialsWithStudents, setMaterialsWithStudents] = useState<MaterialWithStudents[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch all materials with registered students
    const fetchMaterialsWithStudents = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await LearningMaterialService.getMaterialsWithStudents();
            setMaterialsWithStudents(res.data.data ?? []);
        } catch (err: unknown) {
            console.error("❌ Fetch materials with students error:", err);
            setError(getErrorMessage(err, "Failed to load materials with students"));
        } finally {
            setLoading(false);
        }
    }, []);

    // Get a specific material by ID
    const getMaterialById = useCallback(
        (materialId: string): MaterialWithStudents | undefined => {
            return materialsWithStudents.find((item) => item.material.id === materialId);
        },
        [materialsWithStudents]
    );

    // Get total count of all registered students across all materials
    const getTotalStudentsCount = useCallback((): number => {
        return materialsWithStudents.reduce((total, item) => total + item.totalStudent, 0);
    }, [materialsWithStudents]);

    return {
        materialsWithStudents,
        loading,
        error,
        fetchMaterialsWithStudents,
        getMaterialById,
        getTotalStudentsCount,
    };
}

export default useMaterialsWithStudents;
