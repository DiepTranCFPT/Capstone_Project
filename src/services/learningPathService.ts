import type { LearningPath, MajorOption } from "~/types/learningPath";

// Mock Data - Dữ liệu mẫu cho các ngành học
const MOCK_MAJORS: MajorOption[] = [
    { value: "cs", label: "Khoa học Máy tính (Computer Science)", description: "Tập trung vào Lập trình và Toán học" },
    { value: "pre_med", label: "Y khoa (Pre-Med)", description: "Tập trung vào Sinh học và Hóa học" },
    { value: "business", label: "Kinh doanh (Business)", description: "Tập trung vào Kinh tế và Thống kê" },
    { value: "engineering", label: "Kỹ thuật (Engineering)", description: "Tập trung vào Vật lý và Toán cao cấp" },
    { value: "art", label: "Nghệ thuật & Thiết kế (Arts)", description: "Tập trung vào Sáng tạo và Lịch sử Nghệ thuật" },
];

// Template lộ trình mẫu để copy khi tạo mới
const PATHWAY_TEMPLATES: Record<string, Partial<LearningPath>> = {
    cs: {
        
        items: [
            { id: "1", semester: "Lớp 10", subjectName: "AP Computer Science Principles", status: "completed", priority: "Must Have", reason: "Nền tảng cơ bản về CNTT", courseId: "1" },
            { id: "2", semester: "Lớp 10", subjectName: "AP Pre-Calculus", status: "completed", priority: "Recommended", reason: "Chuẩn bị cho Calculus BC" },
            { id: "3", semester: "Lớp 11", subjectName: "AP Computer Science A", status: "in_progress", priority: "Must Have", reason: "Lập trình Java chuyên sâu", courseId: "3" },
            { id: "4", semester: "Lớp 11", subjectName: "AP Calculus BC", status: "not_started", priority: "Must Have", reason: "Toán cao cấp cho kỹ thuật" },
            { id: "5", semester: "Lớp 12", subjectName: "AP Physics C: Mechanics", status: "not_started", priority: "Recommended", reason: "Tư duy logic vật lý" },
            { id: "6", semester: "Lớp 12", subjectName: "AP Statistics", status: "not_started", priority: "Optional", reason: "Hữu ích cho Data Science" }
        ]
    },
    business: {
        
        items: [
            { id: "1", semester: "Lớp 10", subjectName: "AP Microeconomics", status: "not_started", priority: "Must Have", reason: "Kinh tế vi mô căn bản" },
            { id: "2", semester: "Lớp 10", subjectName: "AP Macroeconomics", status: "not_started", priority: "Must Have", reason: "Kinh tế vĩ mô căn bản" },
            { id: "3", semester: "Lớp 11", subjectName: "AP Statistics", status: "not_started", priority: "Must Have", reason: "Phân tích số liệu kinh doanh" },
            { id: "4", semester: "Lớp 11", subjectName: "AP Psychology", status: "not_started", priority: "Recommended", reason: "Hiểu hành vi người tiêu dùng" },
            { id: "5", semester: "Lớp 12", subjectName: "AP Calculus AB", status: "not_started", priority: "Recommended", reason: "Toán cho tài chính" }
        ]
    },
    // Default fallback
    default: {
        
        items: [
            { id: "1", semester: "Lớp 10", subjectName: "AP Seminar", status: "not_started", priority: "Recommended", reason: "Kỹ năng nghiên cứu" },
            { id: "2", semester: "Lớp 11", subjectName: "AP English Language", status: "not_started", priority: "Must Have", reason: "Kỹ năng viết học thuật" },
            { id: "3", semester: "Lớp 12", subjectName: "AP Research", status: "not_started", priority: "Recommended", reason: "Nghiên cứu chuyên sâu" }
        ]
    }
};

const STORAGE_KEY = 'student_learning_pathway';

const LearningPathService = {
    getMajors: async (): Promise<MajorOption[]> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_MAJORS;
    },

    getMyPathway: async (): Promise<LearningPath | null> => {
        await new Promise(resolve => setTimeout(resolve, 800));

        // Kiểm tra localStorage để xem user đã có lộ trình chưa
        const savedPath = localStorage.getItem(STORAGE_KEY);
        if (savedPath) {
            try {
                return JSON.parse(savedPath);
            } catch (e) {
                console.error("Error parsing saved pathway", e);
                return null;
            }
        }

        // Trả về null nếu chưa có (để hiển thị trang Onboarding)
        return null;
    },

    generatePathway: async (data: { major: string, grade: number }): Promise<LearningPath> => {
        await new Promise(resolve => setTimeout(resolve, 1500)); // Giả lập AI đang tính toán

        const majorInfo = MOCK_MAJORS.find(m => m.value === data.major);
        const template = PATHWAY_TEMPLATES[data.major] || PATHWAY_TEMPLATES['default'];

        const newPathway: LearningPath = {
            id: `path_${Date.now()}`,
            studentId: "user_current",
            majorGoal: majorInfo ? majorInfo.label : "Chưa xác định",
            targetUniversity: "RMIT", // Có thể thêm field nhập trường sau
            overallProgress: 80,
            createdAt: new Date().toISOString(),
            items: template.items || []
        };

        // Lưu vào localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newPathway));

        return newPathway;
    },

    updateItemStatus: async (itemId: string, status: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));

        // Cập nhật status trong localStorage để giữ trạng thái
        const savedPathStr = localStorage.getItem(STORAGE_KEY);
        if (savedPathStr) {
            const savedPath: LearningPath = JSON.parse(savedPathStr);
            const updatedItems = savedPath.items.map(item =>
                item.id === itemId ? { ...item, status: status } : item
            );

            // Tính lại progress
            const completedCount = updatedItems.filter(i => i.status === 'completed').length;
            const newProgress = Math.round((completedCount / updatedItems.length) * 100);

            const updatedPath = { ...savedPath, items: updatedItems, overallProgress: newProgress };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPath));
        }

        console.log(`Updated item ${itemId} to ${status}`);
        return true;
    },

    // Hàm tiện ích để reset lộ trình (cho mục đích demo)
    resetPathway: () => {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
    }
};

export default LearningPathService;