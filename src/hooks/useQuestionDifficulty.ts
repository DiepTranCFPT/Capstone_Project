import { useState, useEffect } from "react";
import { message } from "antd";
import type { QuestionDifficulty } from "~/services/questionDifficultyService";
import QuestionDifficultyService from "~/services/questionDifficultyService";


export const useQuestionDifficulty = () => {
    const [difficulties, setDifficulties] = useState<QuestionDifficulty[]>([]);
    const [loading, setLoading] = useState(false);

    //  Hàm gọi API lấy danh sách độ khó
    const fetchDifficulties = async () => {
        try {
            setLoading(true);
            const res = await QuestionDifficultyService.getAll();
            setDifficulties(res.data.data || []);
        } catch (error) {
            message.error("Không thể tải danh sách độ khó câu hỏi!");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    //  Tự động gọi khi khởi tạo hook
    useEffect(() => {
        fetchDifficulties();
    }, []);

    return { difficulties, loading, fetchDifficulties };
};

export default useQuestionDifficulty;
