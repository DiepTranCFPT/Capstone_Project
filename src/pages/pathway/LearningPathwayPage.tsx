import React, { useState, useEffect } from "react";
import {
    Steps,
    Card,
    Button,
    Typography,
    Progress,
    Form,
    Spin,
    Popconfirm,
    Avatar,
    // Select
} from "antd";
import {
    RocketOutlined,
    StarOutlined,
    TrophyOutlined,
    LeftOutlined as QuoteLeftOutlined,
    CheckCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import LearningPathService from "~/services/learningPathService";
import type { LearningPath, PathwayItem, MajorOption } from "~/types/learningPath";
import { toast } from "~/components/common/Toast";
import PathwayOnboarding from "~/components/pathway/PathwayOnboarding";
import PathwayItemCard from "~/components/pathway/PathwayItemCard";

const { Title, Text, Paragraph } = Typography;
// const { Option } = Select;

const LearningPathwayPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [pathway, setPathway] = useState<LearningPath | null>(null);
    const [majors, setMajors] = useState<MajorOption[]>([]);

    // Onboarding State
    const [isGenerating, setIsGenerating] = useState(false);
    const [onboardingForm] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [pathData, majorsData] = await Promise.all([
                LearningPathService.getMyPathway(),
                LearningPathService.getMajors()
            ]);
            setPathway(pathData);
            setMajors(majorsData);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải lộ trình học tập");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async (values: { major: string; grade: number }) => {
        setIsGenerating(true);
        try {
            const newPath = await LearningPathService.generatePathway(values);
            setPathway(newPath);
            toast.success("Đã tạo lộ trình cá nhân hóa thành công!");
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi tạo lộ trình");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleReset = () => {
        LearningPathService.resetPathway();
    };



    // Group items by Semester for Timeline visualization
    const groupedItems = React.useMemo(() => {
        if (!pathway) return {};
        return pathway.items.reduce((acc, item) => {
            if (!acc[item.semester]) {
                acc[item.semester] = [];
            }
            acc[item.semester].push(item);
            return acc;
        }, {} as Record<string, PathwayItem[]>);
    }, [pathway]);

    const renderOnboarding = () => (
        <PathwayOnboarding
            majors={majors}
            isGenerating={isGenerating}
            onFinish={handleGenerate}
            form={onboardingForm}
        />
    );

    const renderPathway = () => {
        if (!pathway) return null;

        return (
            <div className="max-w-5xl mx-auto animate-fade-in flex flex-col gap-4">
                {/* Header Summary */}
                <Card className="mb-8 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 text-white border-0 shadow-xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-transparent to-white/5 animate-pulse"></div>
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                {/* <AimOutlined className="text-2xl text-yellow-300 animate-bounce" /> */}
                                <span className="text-gray-800 text-sm uppercase font-bold tracking-widest bg-white/10 px-3 py-1 rounded-full animate-bounce">🚀 Mục tiêu ngành</span>
                            </div>
                            <Title level={2} className="text-white mb-1 drop-shadow-lg">🎓 {pathway.majorGoal}</Title>
                            {pathway.targetUniversity && <Text className="text-white/90 block font-medium text-lg">🎯 Mục tiêu: {pathway.targetUniversity}</Text>}
                        </div>
                        <div className="flex flex-col items-end gap-4">
                            <div className="bg-white/15 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/20 min-w-[220px] hover:scale-105 transition-transform duration-300">
                                <div className="flex items-center justify-between mb-3">
                                    <Text className="text-white font-bold">🚀 Tiến độ hoàn thành</Text>
                                    <span className="text-2xl">{pathway.overallProgress >= 80 ? '🏆' : pathway.overallProgress >= 50 ? '📈' : '💪'}</span>
                                </div>
                                <Progress
                                    percent={pathway.overallProgress}
                                    status="active"
                                    strokeColor={{
                                        '0%': '#fbbf24',
                                        '50%': '#06b6d4',
                                        '100%': '#ffffff'
                                    }}
                                    trailColor="rgba(255,255,255,0.1)"
                                    format={(percent) => <span className="text-gray-600 font-bold">{percent}%</span>}
                                    strokeWidth={8}
                                    className="progress-custom"
                                />
                                {pathway.overallProgress === 100 && (
                                    <div className="text-center mt-2">
                                        <TrophyOutlined className="text-yellow-300 text-lg animate-bounce" />
                                        <Text className="text-white ml-2">Hoàn thành xuất sắc!</Text>
                                    </div>
                                )}
                            </div>
                            <Popconfirm
                                title="🚨 Tạo lại lộ trình?"
                                description="Bạn có chắc chắn muốn thiết lập lại lộ trình? Điều này sẽ xóa toàn bộ tiến độ hiện tại."
                                onConfirm={handleReset}
                                okText="✅ Xác nhận"
                                cancelText="❌ Hủy"
                                okButtonProps={{ className: 'bg-red-500 border-red-500' }}
                            >
                                <Button
                                    type="text"
                                    size="large"
                                    className="text-white hover:text-red-300 bg-white/10 hover:bg-white/20 rounded-full px-6 py-2 font-semibold transition-all duration-300 hover:scale-110"
                                >
                                    🔄 Thiết lập lại lộ trình
                                </Button>
                            </Popconfirm>
                        </div>
                    </div>
                </Card>

                {/* Timeline */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8">
                        <Card title={<div className="flex items-center gap-2 text-lg">📚 Lộ trình chi tiết</div>} className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
                            <Steps direction="vertical" current={-1} className="custom-steps">
                                {Object.entries(groupedItems).map(([semester, items]) => (
                                    <Steps.Step
                                        key={semester}
                                        status="finish"
                                        title={
                                            <div className="mb-6 mt-2 flex items-center gap-3">
                                                <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white px-4 py-2 rounded-full font-bold text-base shadow-md">
                                                    📅 {semester}
                                                </div>
                                                <span className="text-gray-600 italic">{items.length} môn học</span>
                                            </div>
                                        }
                                        description={
                                            <div className="flex flex-col gap-4 mb-8 ml-8">
                                                {items.map(item => (
                                                    <PathwayItemCard
                                                        key={item.id}
                                                        item={item}
                                                        onNavigateToMaterial={(courseId) => navigate(`/materials/${courseId}`)}
                                                    />
                                                ))}
                                            </div>
                                        }
                                    />
                                ))}
                            </Steps>
                        </Card>
                    </div>

                    {/* Sidebar Info */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        {/* Achievement Stats */}
                        <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 shadow-lg">
                            <div className="text-center">
                                <TrophyOutlined className="text-4xl mb-3 text-yellow-300 animate-bounce" />
                                <Title level={4} className="text-white mb-2">🏆 Thành tựu của bạn</Title>
                                <div className="grid grid-cols-3 gap-4">
                                    <div className="bg-white/20 p-3 rounded-lg">
                                        <div className="text-2xl font-bold">{pathway.items.filter(i => i.status === 'completed').length}</div>
                                        <div className="text-xs">AP đã xong</div>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-lg">
                                        <div className="text-2xl font-bold">{pathway.items.length}</div>
                                        <div className="text-xs">Tổng môn học</div>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-lg">
                                        <div className="text-2xl font-bold">{Math.round(pathway.overallProgress)}%</div>
                                        <div className="text-xs">Hoàn thành</div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Why Choose This Path */}
                        <Card title={<div className="flex items-center gap-2"><StarOutlined className="text-yellow-500" />🤔 Tại sao chọn lộ trình này?</div>} className="shadow-lg border-0 bg-gradient-to-br from-blue-50 to-indigo-50">
                            <Paragraph className="text-gray-700 leading-relaxed">
                                Lộ trình cá nhân hóa này được AI thiết kế dựa trên yêu cầu tuyển sinh của các trường đại học top đầu cho ngành <strong className="text-blue-600">{pathway.majorGoal}</strong>. Việc chinh phục các môn AP này sẽ "unlock" những lợi ích tuyệt vời:
                            </Paragraph>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 p-3 bg-green-100 rounded-lg border-l-4 border-green-400">
                                    <div className="bg-green-500 text-white rounded-full p-1">
                                        <CheckCircleOutlined className="text-sm" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-green-800">🎓 Tăng 30-40% khả năng trúng tuyển</div>
                                        <div className="text-sm text-green-600">Đại học mơ ước trong tầm tay</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-purple-100 rounded-lg border-l-4 border-purple-400">
                                    <div className="bg-purple-500 text-white rounded-full p-1">
                                        <TrophyOutlined className="text-sm" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-purple-800">💰 Tiết kiệm 5-10 tín chỉ đại học</div>
                                        <div className="text-sm text-purple-600">College Credit miễn phí</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 bg-blue-100 rounded-lg border-l-4 border-blue-400">
                                    <div className="bg-blue-500 text-white rounded-full p-1">
                                        <RocketOutlined className="text-sm" />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-blue-800">🧠 Nền tảng kiến thức vững chắc</div>
                                        <div className="text-sm text-blue-600">Chuẩn bị sẵn sàng cho năm nhất ĐH</div>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        {/* Mentoring Support */}
                        <Card className="bg-gradient-to-r from-emerald-400 to-teal-500 border-0 shadow-lg text-center transform hover:scale-105 transition-all duration-300">
                            <div className="text-white">
                                <div className="mb-3">
                                    <Avatar size="large" className="bg-white/20 border-2 border-white/50">
                                        👨‍🏫
                                    </Avatar>
                                </div>
                                <Title level={4} className="text-white mb-2">👨‍🏫 Cố vấn học tập 1-1</Title>
                                <Paragraph className="text-white/90 text-sm mb-4 leading-relaxed">
                                    Có gặp khó khăn trong lộ trình? Học tập với cố vấn chuyên ngành sẽ giúp bạn加速 tiến bộ và đạt mục tiêu cao hơn!
                                </Paragraph>
                                <Button
                                    type="primary"
                                    size="large"
                                    onClick={() => navigate('/student/find-tutor')}
                                    className="bg-white text-teal-600 hover:bg-teal-50 border-white hover:border-teal-200 rounded-full font-bold shadow-lg transform hover:scale-105 transition-all duration-300"
                                >
                                    📅 Tìm Cố vấn ngay
                                </Button>
                            </div>
                        </Card>

                        {/* Motivation Quote */}
                        <Card className="bg-gradient-to-br from-amber-100 to-orange-100 border-amber-200 text-center shadow-sm">
                            <div className="text-amber-800">
                                <QuoteLeftOutlined className="text-4xl mb-2 text-amber-400" />
                                <Paragraph className="text-sm italic leading-relaxed mb-2">
                                    "Thành công không phải là đích đến, mà là con đường tiến tới cái đích đó."
                                </Paragraph>
                                <Text className="text-xs text-amber-600 font-semibold">- Benjamin Disraeli</Text>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            {loading ? (
                <div className="flex justify-center items-center h-[50vh]">
                    <Spin size="large" tip="Đang tải lộ trình..." />
                </div>
            ) : (
                <>
                    {pathway ? renderPathway() : renderOnboarding()}
                </>
            )}
        </div>
    );
};

export default LearningPathwayPage;
