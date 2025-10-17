import type { AssignedStudent, Consultation } from '~/types/advisor';

export const mockAssignedStudents: AssignedStudent[] = [
    {
        id: 's1',
        name: 'Nguyen Van A',
        avatar: 'https://i.pravatar.cc/150?img=1',
        apGoal: 'Computer Science, Calculus BC',
        overallProgress: 85,
        lastActivity: 'Completed MCQ Practice',
        status: 'on_track',
    },
    {
        id: 's2',
        name: 'Tran Thi B',
        avatar: 'https://i.pravatar.cc/150?img=2',
        apGoal: 'Physics C, Chemistry',
        overallProgress: 65,
        lastActivity: 'Took Full Mock Test',
        status: 'behind',
    },
    {
        id: 's3',
        name: 'Le Van C',
        avatar: 'https://i.pravatar.cc/150?img=3',
        apGoal: 'Biology, English Literature',
        overallProgress: 40,
        lastActivity: '3 days ago',
        status: 'at_risk',
    },
    {
        id: 's4',
        name: 'Pham Thi D',
        avatar: 'https://i.pravatar.cc/150?img=4',
        apGoal: 'US History, Microeconomics',
        overallProgress: 92,
        lastActivity: 'Reviewed Flashcards',
        status: 'on_track',
    },
];

export const mockConsultations: Consultation[] = [
    {
        id: 'c1',
        studentId: 's2',
        studentName: 'Tran Thi B',
        date: '2025-10-20',
        time: '14:00',
        status: 'upcoming',
    },
    {
        id: 'c2',
        studentId: 's3',
        studentName: 'Le Van C',
        date: '2025-10-22',
        time: '10:00',
        status: 'upcoming',
    },
    {
        id: 'c3',
        studentId: 's1',
        studentName: 'Nguyen Van A',
        date: '2025-10-15',
        time: '16:00',
        status: 'completed',
        notes: 'Discussed Calculus BC FRQ strategies. Student shows good understanding.'
    },
]

export const majorToAPMap: { [key: string]: { subject: string; reason: string; category: string }[] } = {
    'Khoa học Máy tính (Computer Science)': [
        { subject: 'AP Computer Science A', reason: 'Nền tảng lập trình Java và tư duy giải quyết vấn đề.', category: 'STEM' },
        { subject: 'AP Computer Science Principles', reason: 'Cung cấp cái nhìn tổng quan về các khái niệm tính toán và công nghệ.', category: 'STEM' },
        { subject: 'AP Calculus BC', reason: 'Toán cao cấp là yêu cầu cốt lõi cho hầu hết các chương trình CS.', category: 'Toán' },
        { subject: 'AP Physics C: Mechanics', reason: 'Tăng cường tư duy logic và kỹ năng giải quyết vấn đề vật lý.', category: 'STEM' }
    ],
    'Kinh doanh & Kinh tế (Business & Economics)': [
        { subject: 'AP Macroeconomics', reason: 'Hiểu về các nguyên tắc kinh tế ở quy mô quốc gia và toàn cầu.', category: 'Xã hội' },
        { subject: 'AP Microeconomics', reason: 'Phân tích hành vi của cá nhân và doanh nghiệp trong nền kinh tế.', category: 'Xã hội' },
        { subject: 'AP Statistics', reason: 'Cung cấp kỹ năng phân tích dữ liệu cần thiết cho kinh doanh.', category: 'Toán' },
        { subject: 'AP Calculus AB', reason: 'Toán ứng dụng là một lợi thế lớn trong lĩnh vực tài chính và kinh tế.', category: 'Toán' }
    ],
    'Y khoa & Sinh học (Pre-Med & Biology)': [
        { subject: 'AP Biology', reason: 'Kiến thức sinh học chuyên sâu, là môn học tiên quyết quan trọng.', category: 'STEM' },
        { subject: 'AP Chemistry', reason: 'Hóa học là nền tảng cơ bản cho y sinh và các ngành khoa học sức khỏe.', category: 'STEM' },
        { subject: 'AP Calculus BC', reason: 'Nhiều trường y khoa yêu cầu hoặc khuyến nghị một năm học calculus.', category: 'Toán' },
        { subject: 'AP Psychology', reason: 'Hiểu biết về tâm lý học rất hữu ích trong việc tương tác với bệnh nhân.', category: 'Xã hội' }
    ],
    'Kỹ thuật (Engineering)': [
        { subject: 'AP Physics C: Mechanics', reason: 'Cơ học là môn học nền tảng cho hầu hết các ngành kỹ thuật.', category: 'STEM' },
        { subject: 'AP Physics C: Electricity and Magnetism', reason: 'Quan trọng cho các ngành kỹ thuật điện, máy tính.', category: 'STEM' },
        { subject: 'AP Calculus BC', reason: 'Toán cao cấp là công cụ không thể thiếu của một kỹ sư.', category: 'Toán' },
        { subject: 'AP Chemistry', reason: 'Cần thiết cho các ngành kỹ thuật hóa học, vật liệu và môi trường.', category: 'STEM' }
    ],
};